CREATE OR REPLACE FUNCTION public.broadcast_iris_refresh()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  refresh_topic text;
BEGIN
  refresh_topic := CASE TG_TABLE_NAME
    WHEN 'notifications' THEN 'iris:notifications'
    WHEN 'case_chat_messages' THEN 'iris:chat'
    ELSE 'iris:cases'
  END;

  IF TG_TABLE_NAME = 'audit_logs'
    AND COALESCE((CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END)->>'target_table', '') <> 'cases' THEN
    RETURN NULL;
  END IF;

  BEGIN
    PERFORM realtime.send('{}'::jsonb, 'refresh', refresh_topic, false);

    IF TG_TABLE_NAME IN ('cases', 'case_process_history', 'case_status_history') THEN
      PERFORM realtime.send('{}'::jsonb, 'refresh', 'iris:chat', false);
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'IRIS realtime notification failed: %', SQLERRM;
  END;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.broadcast_iris_refresh() FROM PUBLIC;

DO $$
DECLARE
  source_table text;
BEGIN
  FOREACH source_table IN ARRAY ARRAY[
    'audit_logs',
    'case_chat_messages',
    'case_process_history',
    'case_status_history',
    'cases',
    'evidence',
    'hearings',
    'notifications',
    'officers',
    'settlements',
    'users'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.broadcast_iris_refresh()',
      'iris_realtime_refresh_' || source_table,
      source_table
    );
  END LOOP;
END;
$$;

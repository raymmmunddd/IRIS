ALTER TABLE IF EXISTS public.hearings REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.case_chat_messages REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.evidence REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.settlements REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.announcements REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.officers REPLICA IDENTITY FULL;

DO $$
DECLARE
  realtime_table text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH realtime_table IN ARRAY ARRAY[
      'hearings',
      'case_chat_messages',
      'evidence',
      'settlements',
      'announcements',
      'officers'
    ]
    LOOP
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', realtime_table);
      EXCEPTION WHEN duplicate_object THEN
        NULL;
      END;
    END LOOP;
  END IF;
END $$;

ALTER TABLE "audit_logs"
  ADD COLUMN IF NOT EXISTS "case_id" TEXT;

UPDATE "audit_logs" AS log
SET "case_id" = log."target_id"
WHERE log."target_table" = 'cases'
  AND EXISTS (SELECT 1 FROM "cases" WHERE "cases"."id" = log."target_id");

ALTER TABLE "audit_logs"
  DROP CONSTRAINT IF EXISTS "audit_logs_case_fk";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'audit_logs_case_id_fkey'
      AND conrelid = 'audit_logs'::regclass
  ) THEN
    ALTER TABLE "audit_logs"
      ADD CONSTRAINT "audit_logs_case_id_fkey"
      FOREIGN KEY ("case_id") REFERENCES "cases"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "audit_logs_case_id_logged_at_idx" ON "audit_logs"("case_id", "logged_at");

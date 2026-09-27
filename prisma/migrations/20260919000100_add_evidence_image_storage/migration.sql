ALTER TABLE "evidence"
    ADD COLUMN IF NOT EXISTS "file_name" TEXT,
    ADD COLUMN IF NOT EXISTS "file_data" BYTEA;

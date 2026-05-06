ALTER TABLE "users" ADD COLUMN "password" TEXT;

UPDATE "users"
SET "street" = COALESCE(NULLIF("street", ''), "purok")
WHERE "purok" IS NOT NULL;

ALTER TABLE "users" DROP COLUMN "purok";

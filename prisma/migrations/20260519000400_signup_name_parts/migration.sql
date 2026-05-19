ALTER TABLE "users"
ADD COLUMN "first_name" TEXT,
ADD COLUMN "middle_name" TEXT,
ADD COLUMN "last_name" TEXT,
ADD COLUMN "suffix" TEXT,
ADD COLUMN "terms_accepted_at" TIMESTAMP(3),
ADD COLUMN "privacy_accepted_at" TIMESTAMP(3);

UPDATE "users"
SET
  "first_name" = COALESCE("first_name", NULLIF(split_part("full_name", ' ', 1), '')),
  "last_name" = COALESCE(
    "last_name",
    NULLIF(regexp_replace("full_name", '^.*\s+([^\s]+)$', '\1'), "full_name")
  )
WHERE "full_name" IS NOT NULL;

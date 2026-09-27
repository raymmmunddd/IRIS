CREATE TABLE "resident_identities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "government_id_image" BYTEA NOT NULL,
    "government_id_mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resident_identities_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "resident_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "resident_identities_user_id_key" ON "resident_identities"("user_id");

CREATE TABLE "password_reset_codes" (
    "email" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumed_at" TIMESTAMP(6),
    CONSTRAINT "password_reset_codes_pkey" PRIMARY KEY ("email")
);

CREATE INDEX "password_reset_codes_expires_at_idx" ON "password_reset_codes"("expires_at");

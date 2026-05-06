CREATE TABLE "case_chat_messages" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_chat_messages_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "case_chat_messages" ADD CONSTRAINT "case_chat_messages_case_id_fkey"
FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

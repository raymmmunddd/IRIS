CREATE TYPE "CaseProcessStatus" AS ENUM (
  'SCHEDULED', 'MEDIATION', 'CONCILIATION', 'ARBITRATION',
  'RESOLVED', 'REPUDIATION', 'DISMISSED', 'WITHDRAWN'
);

CREATE TYPE "SettlementSource" AS ENUM ('MEDIATION', 'CONCILIATION', 'ARBITRATION');
CREATE TYPE "RepudiatedBy" AS ENUM ('COMPLAINANT', 'RESPONDENT');
CREATE TYPE "ExecutionMethod" AS ENUM ('LUPON', 'COURT');

ALTER TABLE "cases"
  ADD COLUMN "current_status" "CaseProcessStatus" NOT NULL DEFAULT 'SCHEDULED',
  ADD COLUMN "previous_status" "CaseProcessStatus",
  ADD COLUMN "filing_date" DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN "status_entered_date" DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN "status_days_allotted" INTEGER,
  ADD COLUMN "mediation_attempt_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "conciliation_attempt_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "absence_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "arbitration_agreement_signed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "arbitration_agreement_date" DATE,
  ADD COLUMN "arbitration_award_date" DATE,
  ADD COLUMN "settlement_date" DATE,
  ADD COLUMN "settlement_source" "SettlementSource",
  ADD COLUMN "repudiation_date" DATE,
  ADD COLUMN "repudiation_deadline" DATE,
  ADD COLUMN "repudiation_reason" TEXT,
  ADD COLUMN "repudiated_by" "RepudiatedBy",
  ADD COLUMN "closed_date" DATE,
  ADD COLUMN "execution_deadline" DATE,
  ADD COLUMN "execution_method" "ExecutionMethod",
  ADD COLUMN "needs_certificate_to_file_action" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "withdrawal_reason" TEXT;

UPDATE "cases"
SET "filing_date" = "date_submitted"::date,
    "status_entered_date" = "date_submitted"::date;

CREATE FUNCTION "iris_add_business_days"(start_date DATE, day_count INTEGER)
RETURNS DATE
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT day::date
  FROM generate_series(start_date + 1, start_date + (day_count * 2 + 14), INTERVAL '1 day') AS day
  WHERE EXTRACT(ISODOW FROM day) BETWEEN 1 AND 5
  ORDER BY day
  OFFSET day_count - 1
  LIMIT 1
$$;

-- Move the prior one-to-one monitoring record into the canonical case fields.
UPDATE "cases" AS c
SET "current_status" = CASE WHEN m."is_repudiated" THEN 'REPUDIATION'::"CaseProcessStatus" ELSE 'RESOLVED'::"CaseProcessStatus" END,
    "previous_status" = CASE
      WHEN m."is_repudiated" THEN COALESCE(prior_stage.stage, 'MEDIATION'::"CaseProcessStatus")
      ELSE NULL
    END,
    "settlement_date" = m."monitoring_start"::date,
    "settlement_source" = CASE WHEN prior_stage.stage = 'CONCILIATION'::"CaseProcessStatus" THEN 'CONCILIATION'::"SettlementSource" ELSE 'MEDIATION'::"SettlementSource" END,
    "repudiation_date" = m."repudiated_at"::date,
    "repudiation_deadline" = "iris_add_business_days"(m."monitoring_start"::date, 10),
    "repudiation_reason" = m."repudiation_reason",
    "closed_date" = CASE WHEN m."is_closed" THEN COALESCE(m."closed_at"::date, m."monitoring_end"::date) ELSE NULL END,
    "execution_deadline" = (m."monitoring_start"::date + INTERVAL '6 months')::date,
    "status_entered_date" = COALESCE(m."repudiated_at"::date, m."monitoring_start"::date),
    "status_days_allotted" = CASE WHEN m."is_repudiated" THEN NULL ELSE 10 END
FROM "case_monitoring" AS m
LEFT JOIN LATERAL (
  SELECT CASE WHEN h."stage" = 'CONCILIATION'::"HearingStage" THEN 'CONCILIATION'::"CaseProcessStatus" ELSE 'MEDIATION'::"CaseProcessStatus" END AS stage
  FROM "hearings" AS h
  WHERE h."case_id" = m."case_id" AND h."status" = 'COMPLETED'::"HearingStatus"
  ORDER BY h."scheduled_date" DESC
  LIMIT 1
) AS prior_stage ON true
WHERE m."case_id" = c."id";

-- Import only settlements with a recorded signature date; unresolved legacy cases remain scheduled for staff review.
UPDATE "cases" AS c
SET "current_status" = 'RESOLVED'::"CaseProcessStatus",
    "settlement_date" = s."signed_at"::date,
    "settlement_source" = COALESCE(prior_stage.stage, 'MEDIATION'::"SettlementSource"),
    "repudiation_deadline" = "iris_add_business_days"(s."signed_at"::date, 10),
    "execution_deadline" = (s."signed_at"::date + INTERVAL '6 months')::date,
    "status_entered_date" = s."signed_at"::date,
    "status_days_allotted" = 10
FROM "settlements" AS s
LEFT JOIN LATERAL (
  SELECT CASE WHEN h."stage" = 'CONCILIATION'::"HearingStage" THEN 'CONCILIATION'::"SettlementSource" ELSE 'MEDIATION'::"SettlementSource" END AS stage
  FROM "hearings" AS h
  WHERE h."case_id" = s."case_id" AND h."status" = 'COMPLETED'::"HearingStatus"
  ORDER BY h."scheduled_date" DESC
  LIMIT 1
) AS prior_stage ON true
WHERE s."case_id" = c."id"
  AND c."current_status" = 'SCHEDULED'::"CaseProcessStatus"
  AND s."signed_at" IS NOT NULL;

CREATE TABLE "case_process_history" (
  "id" TEXT NOT NULL,
  "case_id" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "from_status" "CaseProcessStatus" NOT NULL,
  "to_status" "CaseProcessStatus" NOT NULL,
  "changed_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "business_days_spent" INTEGER NOT NULL DEFAULT 0,
  "details" TEXT,
  CONSTRAINT "case_process_history_pkey" PRIMARY KEY ("id")
);

INSERT INTO "case_process_history" ("id", "case_id", "event", "from_status", "to_status", "changed_at", "details")
SELECT gen_random_uuid()::text, "id", 'legacy_import', "current_status", "current_status", "updated_at", 'Imported into the business-day case workflow.'
FROM "cases";

CREATE INDEX "cases_current_status_status_entered_date_idx" ON "cases"("current_status", "status_entered_date");
CREATE INDEX "cases_is_archived_filing_date_idx" ON "cases"("is_archived", "filing_date");
CREATE INDEX "case_process_history_case_id_changed_at_idx" ON "case_process_history"("case_id", "changed_at");

ALTER TABLE "case_process_history"
  ADD CONSTRAINT "case_process_history_case_id_fkey"
  FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Move the old single evidence URL into the existing multi-file evidence relation before dropping it.
INSERT INTO "evidence" ("id", "case_id", "file_url", "file_type", "file_name", "uploaded_at")
SELECT gen_random_uuid()::text,
       c."id",
       c."image_url",
       CASE
         WHEN c."image_url" ILIKE '%.png%' THEN 'image/png'
         WHEN c."image_url" ILIKE '%.webp%' THEN 'image/webp'
         WHEN c."image_url" ILIKE '%.gif%' THEN 'image/gif'
         WHEN c."image_url" ILIKE '%.jpg%' OR c."image_url" ILIKE '%.jpeg%' THEN 'image/jpeg'
         ELSE 'application/octet-stream'
       END,
       substring(c."image_url" from '[^/]+$'),
       c."date_submitted"
FROM "cases" AS c
WHERE c."image_url" IS NOT NULL AND c."image_url" <> ''
  AND NOT EXISTS (SELECT 1 FROM "evidence" e WHERE e."case_id" = c."id" AND e."file_url" = c."image_url");

DROP FUNCTION "iris_add_business_days"(DATE, INTEGER);
DROP TABLE "case_monitoring";
ALTER TABLE "cases" DROP COLUMN "image_url";
ALTER TABLE "cases" DROP COLUMN "respondent_contact";
ALTER TABLE "cases" DROP COLUMN "incident_purok";
ALTER TABLE "cases" DROP COLUMN "referred_to";
ALTER TABLE "cases" DROP COLUMN "archived_reason";

-- Category was previously a five-value enum, which collapsed the resident-facing choices.
ALTER TABLE "cases"
  ALTER COLUMN "category" TYPE TEXT USING CASE "category"::text
    WHEN 'DISPUTE' THEN 'Community Dispute'
    WHEN 'INJURY' THEN 'Violence or Threats'
    WHEN 'VAWC' THEN 'Harassment & Abuse'
    WHEN 'ORDINANCE_VIOLATION' THEN 'Public Disturbance'
    ELSE 'Community Dispute'
  END;
DROP TYPE "CaseCategory";

ALTER TABLE "cases"
  ALTER COLUMN "incident_date" TYPE DATE USING "incident_date"::date,
  ALTER COLUMN "incident_latitude" TYPE DECIMAL(9, 6) USING ROUND("incident_latitude"::numeric, 6),
  ALTER COLUMN "incident_longitude" TYPE DECIMAL(10, 6) USING ROUND("incident_longitude"::numeric, 6);

ALTER TYPE "CaseStatus" RENAME TO "CaseReviewStatus";
ALTER TYPE "CaseProcessStatus" RENAME TO "CaseStatus";

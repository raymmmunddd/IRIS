ALTER TABLE "cases" ADD COLUMN "case_number" TEXT;

CREATE TABLE "case_monthly_sequences" (
  "year" INTEGER NOT NULL,
  "month" INTEGER NOT NULL,
  "last_number" INTEGER NOT NULL,
  CONSTRAINT "case_monthly_sequences_pkey" PRIMARY KEY ("year", "month"),
  CONSTRAINT "case_monthly_sequences_month_check" CHECK ("month" BETWEEN 1 AND 12),
  CONSTRAINT "case_monthly_sequences_number_check" CHECK ("last_number" >= 0)
);

WITH ranked_cases AS (
  SELECT
    "id",
    "filing_date",
    ROW_NUMBER() OVER (
      PARTITION BY EXTRACT(YEAR FROM "filing_date"), EXTRACT(MONTH FROM "filing_date")
      ORDER BY "filing_date", "date_submitted", "id"
    ) AS "case_sequence",
    CASE EXTRACT(MONTH FROM "filing_date")::INTEGER
      WHEN 1 THEN 'JANUARY'
      WHEN 2 THEN 'FEBRUARY'
      WHEN 3 THEN 'MARCH'
      WHEN 4 THEN 'APRIL'
      WHEN 5 THEN 'MAY'
      WHEN 6 THEN 'JUNE'
      WHEN 7 THEN 'JULY'
      WHEN 8 THEN 'AUGUST'
      WHEN 9 THEN 'SEPTEMBER'
      WHEN 10 THEN 'OCTOBER'
      WHEN 11 THEN 'NOVEMBER'
      ELSE 'DECEMBER'
    END AS "month_name"
  FROM "cases"
)
UPDATE "cases" AS "case"
SET "case_number" = ranked_cases."month_name" || '-' || ranked_cases."case_sequence"::TEXT || '-' || TO_CHAR(ranked_cases."filing_date", 'YY')
FROM ranked_cases
WHERE ranked_cases."id" = "case"."id";

INSERT INTO "case_monthly_sequences" ("year", "month", "last_number")
SELECT EXTRACT(YEAR FROM "filing_date")::INTEGER, EXTRACT(MONTH FROM "filing_date")::INTEGER, MAX("case_sequence")::INTEGER
FROM (
  SELECT "filing_date", ROW_NUMBER() OVER (
    PARTITION BY EXTRACT(YEAR FROM "filing_date"), EXTRACT(MONTH FROM "filing_date")
    ORDER BY "filing_date", "date_submitted", "id"
  ) AS "case_sequence"
  FROM "cases"
) AS numbered
GROUP BY EXTRACT(YEAR FROM "filing_date"), EXTRACT(MONTH FROM "filing_date");

ALTER TABLE "cases" ALTER COLUMN "case_number" SET NOT NULL;
CREATE UNIQUE INDEX "cases_case_number_key" ON "cases"("case_number");

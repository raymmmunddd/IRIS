ALTER TABLE "users"
ADD COLUMN "location_latitude" DOUBLE PRECISION,
ADD COLUMN "location_longitude" DOUBLE PRECISION,
ADD COLUMN "location_accuracy" DOUBLE PRECISION,
ADD COLUMN "location_address" TEXT,
ADD COLUMN "location_captured_at" TIMESTAMP(3);

ALTER TABLE "cases"
ADD COLUMN "incident_street" TEXT,
ADD COLUMN "incident_purok" INTEGER,
ADD COLUMN "incident_latitude" DOUBLE PRECISION,
ADD COLUMN "incident_longitude" DOUBLE PRECISION,
ADD COLUMN "incident_accuracy" DOUBLE PRECISION,
ADD COLUMN "incident_location" TEXT;

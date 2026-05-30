-- Add admin-governed branch store type approval status.
CREATE TYPE "BranchStoreTypeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');

ALTER TYPE "AuditResourceType" ADD VALUE IF NOT EXISTS 'STORE_TYPE';
ALTER TYPE "AuditResourceType" ADD VALUE IF NOT EXISTS 'BRANCH_STORE_TYPE';

-- Convert the legacy fixed enum columns to dynamic string codes before
-- creating the StoreType registry table that replaces the enum namespace.
ALTER TABLE "Merchant" ADD COLUMN "storeTypeCode" TEXT NOT NULL DEFAULT 'restaurant';
UPDATE "Merchant" SET "storeTypeCode" = lower("storeType"::TEXT);
ALTER TABLE "Merchant" DROP COLUMN "storeType";
ALTER TABLE "Merchant" RENAME COLUMN "storeTypeCode" TO "storeType";

ALTER TABLE "Branch" ADD COLUMN "storeTypeCode" TEXT NOT NULL DEFAULT 'restaurant';
UPDATE "Branch" SET "storeTypeCode" = lower("storeType"::TEXT);
ALTER TABLE "Branch" DROP COLUMN "storeType";
ALTER TABLE "Branch" RENAME COLUMN "storeTypeCode" TO "storeType";

DROP TYPE "StoreType";

CREATE TABLE "StoreType" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "iconUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "StoreType_pkey" PRIMARY KEY ("id")
);

INSERT INTO "StoreType" ("id", "code", "name", "isSystem", "sortOrder")
VALUES
  ('store_type_restaurant', 'restaurant', 'Restaurant', true, 10),
  ('store_type_grocery', 'grocery', 'Grocery', true, 20),
  ('store_type_clothing', 'clothing', 'Clothing', true, 30),
  ('store_type_skincare', 'skincare', 'Skincare', true, 40),
  ('store_type_convenience', 'convenience', 'Convenience', true, 50),
  ('store_type_pharmacy', 'pharmacy', 'Pharmacy', true, 60),
  ('store_type_beauty', 'beauty', 'Beauty', true, 70),
  ('store_type_fashion', 'fashion', 'Fashion', true, 80),
  ('store_type_electronics', 'electronics', 'Electronics', true, 90),
  ('store_type_home_living', 'home_living', 'Home & Living', true, 100),
  ('store_type_baby_kids', 'baby_kids', 'Baby & Kids', true, 110),
  ('store_type_pet_supplies', 'pet_supplies', 'Pet Supplies', true, 120),
  ('store_type_flowers_gifts', 'flowers_gifts', 'Flowers & Gifts', true, 130),
  ('store_type_bakery_dessert', 'bakery_dessert', 'Bakery & Dessert', true, 140),
  ('store_type_beverage_alcohol', 'beverage_alcohol', 'Beverage & Alcohol', true, 150),
  ('store_type_party_supplies', 'party_supplies', 'Party Supplies', true, 160),
  ('store_type_office_supplies', 'office_supplies', 'Office Supplies', true, 170),
  ('store_type_health_wellness', 'health_wellness', 'Health & Wellness', true, 180);

ALTER TABLE "Merchant" ADD COLUMN "primaryStoreTypeId" TEXT;
ALTER TABLE "Branch" ADD COLUMN "primaryStoreTypeId" TEXT;

UPDATE "Merchant" merchant
SET "primaryStoreTypeId" = store_type."id"
FROM "StoreType" store_type
WHERE store_type."code" = merchant."storeType";

UPDATE "Branch" branch
SET "primaryStoreTypeId" = store_type."id"
FROM "StoreType" store_type
WHERE store_type."code" = branch."storeType";

CREATE TABLE "BranchStoreType" (
  "branchId" TEXT NOT NULL,
  "storeTypeId" TEXT NOT NULL,
  "status" "BranchStoreTypeStatus" NOT NULL DEFAULT 'PENDING',
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "requestedByUserId" TEXT,
  "approvedByUserId" TEXT,
  "approvedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "hiddenAt" TIMESTAMP(3),
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BranchStoreType_pkey" PRIMARY KEY ("branchId", "storeTypeId")
);

INSERT INTO "BranchStoreType" (
  "branchId",
  "storeTypeId",
  "status",
  "isPrimary",
  "sortOrder",
  "approvedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  branch."id",
  store_type."id",
  'APPROVED'::"BranchStoreTypeStatus",
  true,
  0,
  CURRENT_TIMESTAMP,
  branch."createdAt",
  branch."updatedAt"
FROM "Branch" branch
JOIN "StoreType" store_type ON store_type."code" = branch."storeType"
ON CONFLICT ("branchId", "storeTypeId") DO NOTHING;

CREATE UNIQUE INDEX "StoreType_code_key" ON "StoreType"("code");
CREATE INDEX "StoreType_isActive_sortOrder_idx" ON "StoreType"("isActive", "sortOrder");
CREATE INDEX "StoreType_deletedAt_idx" ON "StoreType"("deletedAt");
CREATE INDEX "Merchant_storeType_idx" ON "Merchant"("storeType");
CREATE INDEX "Merchant_primaryStoreTypeId_idx" ON "Merchant"("primaryStoreTypeId");
CREATE INDEX "Branch_storeType_status_idx" ON "Branch"("storeType", "status");
CREATE INDEX "Branch_primaryStoreTypeId_status_idx" ON "Branch"("primaryStoreTypeId", "status");
CREATE INDEX "BranchStoreType_storeTypeId_status_idx" ON "BranchStoreType"("storeTypeId", "status");
CREATE INDEX "BranchStoreType_branchId_status_idx" ON "BranchStoreType"("branchId", "status");
CREATE INDEX "BranchStoreType_status_isPrimary_idx" ON "BranchStoreType"("status", "isPrimary");
CREATE INDEX "BranchStoreType_requestedByUserId_idx" ON "BranchStoreType"("requestedByUserId");
CREATE INDEX "BranchStoreType_approvedByUserId_idx" ON "BranchStoreType"("approvedByUserId");
CREATE UNIQUE INDEX "BranchStoreType_branchId_primary_unique" ON "BranchStoreType"("branchId") WHERE "isPrimary" = true;

ALTER TABLE "Merchant"
  ADD CONSTRAINT "Merchant_primaryStoreTypeId_fkey"
  FOREIGN KEY ("primaryStoreTypeId") REFERENCES "StoreType"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Branch"
  ADD CONSTRAINT "Branch_primaryStoreTypeId_fkey"
  FOREIGN KEY ("primaryStoreTypeId") REFERENCES "StoreType"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BranchStoreType"
  ADD CONSTRAINT "BranchStoreType_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BranchStoreType"
  ADD CONSTRAINT "BranchStoreType_storeTypeId_fkey"
  FOREIGN KEY ("storeTypeId") REFERENCES "StoreType"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BranchStoreType"
  ADD CONSTRAINT "BranchStoreType_requestedByUserId_fkey"
  FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BranchStoreType"
  ADD CONSTRAINT "BranchStoreType_approvedByUserId_fkey"
  FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

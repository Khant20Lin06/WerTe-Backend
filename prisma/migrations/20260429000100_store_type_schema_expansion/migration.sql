-- CreateEnum
CREATE TYPE "StoreType" AS ENUM ('RESTAURANT', 'GROCERY', 'CLOTHING', 'SKINCARE');

-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN "storeType" "StoreType" NOT NULL DEFAULT 'RESTAURANT';

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN "storeType" "StoreType" NOT NULL DEFAULT 'RESTAURANT';

-- CreateIndex
CREATE INDEX "Merchant_storeType_idx" ON "Merchant"("storeType");

-- CreateIndex
CREATE INDEX "Branch_storeType_status_idx" ON "Branch"("storeType", "status");

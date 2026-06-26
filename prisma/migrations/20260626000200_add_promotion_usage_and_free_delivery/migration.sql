-- AlterEnum
ALTER TYPE "PromotionDiscountType" ADD VALUE 'FREE_DELIVERY';

-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "perCustomerLimit" INTEGER;

-- CreateTable
CREATE TABLE "PromotionUsage" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "customerProfileId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromotionUsage_orderId_key" ON "PromotionUsage"("orderId");

-- CreateIndex
CREATE INDEX "PromotionUsage_promotionId_customerProfileId_idx" ON "PromotionUsage"("promotionId", "customerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionUsage_promotionId_customerProfileId_orderId_key" ON "PromotionUsage"("promotionId", "customerProfileId", "orderId");

-- AddForeignKey
ALTER TABLE "PromotionUsage" ADD CONSTRAINT "PromotionUsage_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

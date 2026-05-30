CREATE TYPE "PromotionDiscountType" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE');

CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "PromotionDiscountType" NOT NULL,
    "discountValue" DECIMAL(65,30) NOT NULL,
    "minimumSubtotalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "maximumDiscountAmount" DECIMAL(65,30),
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Order"
ADD COLUMN "promotionId" TEXT,
ADD COLUMN "promotionCodeSnapshot" TEXT,
ADD COLUMN "promotionNameSnapshot" TEXT,
ADD COLUMN "promotionDiscountTypeSnapshot" "PromotionDiscountType";

CREATE UNIQUE INDEX "Promotion_branchId_code_key" ON "Promotion"("branchId", "code");
CREATE INDEX "Promotion_branchId_isActive_idx" ON "Promotion"("branchId", "isActive");
CREATE INDEX "Promotion_branchId_startsAt_endsAt_idx" ON "Promotion"("branchId", "startsAt", "endsAt");
CREATE INDEX "Order_promotionId_idx" ON "Order"("promotionId");

ALTER TABLE "Promotion"
ADD CONSTRAINT "Promotion_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order"
ADD CONSTRAINT "Order_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

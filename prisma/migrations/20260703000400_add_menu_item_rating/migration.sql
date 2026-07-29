-- AlterEnum
ALTER TYPE "RatingTargetType" ADD VALUE 'MENU_ITEM';

-- DropIndex
DROP INDEX "Rating_orderId_raterType_targetType_key";

-- CreateIndex
CREATE UNIQUE INDEX "Rating_orderId_raterType_targetType_targetId_key" ON "Rating"("orderId", "raterType", "targetType", "targetId");

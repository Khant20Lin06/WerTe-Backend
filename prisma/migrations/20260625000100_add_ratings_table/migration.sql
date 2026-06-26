-- CreateEnum
CREATE TYPE "RaterType" AS ENUM ('CUSTOMER', 'RIDER');

-- CreateEnum
CREATE TYPE "RatingTargetType" AS ENUM ('RIDER', 'BRANCH', 'CUSTOMER');

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "raterType" "RaterType" NOT NULL,
    "raterId" TEXT NOT NULL,
    "targetType" "RatingTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_orderId_raterType_targetType_key" ON "Rating"("orderId", "raterType", "targetType");

-- CreateIndex
CREATE INDEX "Rating_targetType_targetId_idx" ON "Rating"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Rating_orderId_idx" ON "Rating"("orderId");

-- CreateIndex
CREATE INDEX "Rating_raterId_raterType_idx" ON "Rating"("raterId", "raterType");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

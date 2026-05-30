-- CreateTable
CREATE TABLE "ItemVariantCombination" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "signature" TEXT NOT NULL,
    "isStockTracked" BOOLEAN NOT NULL DEFAULT false,
    "stockQuantity" INTEGER,
    "lowStockThreshold" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemVariantCombination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemVariantCombinationOption" (
    "combinationId" TEXT NOT NULL,
    "itemOptionId" TEXT NOT NULL,

    CONSTRAINT "ItemVariantCombinationOption_pkey" PRIMARY KEY ("combinationId","itemOptionId")
);

-- AlterTable
ALTER TABLE "OrderItem"
ADD COLUMN "selectedVariantCombinationId" TEXT,
ADD COLUMN "selectedVariantCombinationNameSnapshot" TEXT,
ADD COLUMN "variantCombinationStockTrackedSnapshot" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "ItemVariantCombination_menuItemId_signature_key"
ON "ItemVariantCombination"("menuItemId", "signature");

-- CreateIndex
CREATE INDEX "ItemVariantCombination_menuItemId_idx"
ON "ItemVariantCombination"("menuItemId");

-- CreateIndex
CREATE INDEX "ItemVariantCombination_menuItemId_isActive_idx"
ON "ItemVariantCombination"("menuItemId", "isActive");

-- CreateIndex
CREATE INDEX "ItemVariantCombination_menuItemId_sortOrder_idx"
ON "ItemVariantCombination"("menuItemId", "sortOrder");

-- CreateIndex
CREATE INDEX "ItemVariantCombination_menuItemId_sku_idx"
ON "ItemVariantCombination"("menuItemId", "sku");

-- CreateIndex
CREATE INDEX "ItemVariantCombination_menuItemId_isStockTracked_idx"
ON "ItemVariantCombination"("menuItemId", "isStockTracked");

-- CreateIndex
CREATE INDEX "ItemVariantCombinationOption_itemOptionId_idx"
ON "ItemVariantCombinationOption"("itemOptionId");

-- AddForeignKey
ALTER TABLE "ItemVariantCombination"
ADD CONSTRAINT "ItemVariantCombination_menuItemId_fkey"
FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantCombinationOption"
ADD CONSTRAINT "ItemVariantCombinationOption_combinationId_fkey"
FOREIGN KEY ("combinationId") REFERENCES "ItemVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantCombinationOption"
ADD CONSTRAINT "ItemVariantCombinationOption_itemOptionId_fkey"
FOREIGN KEY ("itemOptionId") REFERENCES "ItemOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

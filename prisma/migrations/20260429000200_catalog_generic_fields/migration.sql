-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN "imageUrlsJson" JSONB;
ALTER TABLE "MenuItem" ADD COLUMN "sku" TEXT;
ALTER TABLE "MenuItem" ADD COLUMN "barcode" TEXT;
ALTER TABLE "MenuItem" ADD COLUMN "brand" TEXT;
ALTER TABLE "MenuItem" ADD COLUMN "attributesJson" JSONB;

-- CreateIndex
CREATE INDEX "MenuItem_branchId_sku_idx" ON "MenuItem"("branchId", "sku");

-- CreateIndex
CREATE INDEX "MenuItem_branchId_brand_idx" ON "MenuItem"("branchId", "brand");

-- CreateIndex
CREATE INDEX "MenuItem_barcode_idx" ON "MenuItem"("barcode");

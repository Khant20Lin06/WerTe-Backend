ALTER TABLE "MenuItem"
  ADD COLUMN "isStockTracked" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "stockQuantity" INTEGER,
  ADD COLUMN "lowStockThreshold" INTEGER;

CREATE INDEX "MenuItem_branchId_isStockTracked_idx" ON "MenuItem"("branchId", "isStockTracked");

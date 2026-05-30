CREATE TYPE "ItemOptionGroupKind" AS ENUM ('ADD_ON', 'VARIANT_SELECTOR');

ALTER TABLE "ItemOptionGroup"
ADD COLUMN "kind" "ItemOptionGroupKind" NOT NULL DEFAULT 'ADD_ON';

ALTER TABLE "ItemOption"
ADD COLUMN "isStockTracked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "stockQuantity" INTEGER,
ADD COLUMN "lowStockThreshold" INTEGER;

CREATE INDEX "ItemOption_groupId_isStockTracked_idx"
ON "ItemOption"("groupId", "isStockTracked");

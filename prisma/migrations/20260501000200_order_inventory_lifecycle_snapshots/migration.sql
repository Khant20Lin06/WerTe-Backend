ALTER TABLE "OrderItem"
ADD COLUMN "menuItemStockTrackedSnapshot" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "OrderItemOption"
ADD COLUMN "itemOptionStockTrackedSnapshot" BOOLEAN NOT NULL DEFAULT false;

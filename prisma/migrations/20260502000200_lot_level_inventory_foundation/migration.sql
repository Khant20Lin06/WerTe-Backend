CREATE TABLE "MenuItemInventoryLot" (
  "id" TEXT NOT NULL,
  "menuItemId" TEXT NOT NULL,
  "batchNo" TEXT NOT NULL,
  "expiryDate" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "receivedQuantity" INTEGER NOT NULL,
  "remainingQuantity" INTEGER NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MenuItemInventoryLot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItemInventoryLotAllocation" (
  "id" TEXT NOT NULL,
  "orderItemId" TEXT NOT NULL,
  "inventoryLotId" TEXT NOT NULL,
  "batchNoSnapshot" TEXT NOT NULL,
  "expiryDateSnapshot" TIMESTAMP(3),
  "quantity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OrderItemInventoryLotAllocation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MenuItemInventoryLot_menuItemId_batchNo_key"
ON "MenuItemInventoryLot"("menuItemId", "batchNo");

CREATE INDEX "MenuItemInventoryLot_menuItemId_idx"
ON "MenuItemInventoryLot"("menuItemId");

CREATE INDEX "MenuItemInventoryLot_menuItemId_expiryDate_idx"
ON "MenuItemInventoryLot"("menuItemId", "expiryDate");

CREATE INDEX "MenuItemInventoryLot_menuItemId_remainingQuantity_idx"
ON "MenuItemInventoryLot"("menuItemId", "remainingQuantity");

CREATE UNIQUE INDEX "OrderItemInventoryLotAllocation_orderItemId_inventoryLotId_key"
ON "OrderItemInventoryLotAllocation"("orderItemId", "inventoryLotId");

CREATE INDEX "OrderItemInventoryLotAllocation_orderItemId_idx"
ON "OrderItemInventoryLotAllocation"("orderItemId");

CREATE INDEX "OrderItemInventoryLotAllocation_inventoryLotId_idx"
ON "OrderItemInventoryLotAllocation"("inventoryLotId");

ALTER TABLE "MenuItemInventoryLot"
ADD CONSTRAINT "MenuItemInventoryLot_menuItemId_fkey"
FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItemInventoryLotAllocation"
ADD CONSTRAINT "OrderItemInventoryLotAllocation_orderItemId_fkey"
FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderItemInventoryLotAllocation"
ADD CONSTRAINT "OrderItemInventoryLotAllocation_inventoryLotId_fkey"
FOREIGN KEY ("inventoryLotId") REFERENCES "MenuItemInventoryLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "MenuCategoryStoreType" (
  "categoryId" TEXT NOT NULL,
  "storeTypeId" TEXT NOT NULL,

  CONSTRAINT "MenuCategoryStoreType_pkey" PRIMARY KEY ("categoryId", "storeTypeId")
);

CREATE TABLE "MenuItemStoreType" (
  "itemId" TEXT NOT NULL,
  "storeTypeId" TEXT NOT NULL,

  CONSTRAINT "MenuItemStoreType_pkey" PRIMARY KEY ("itemId", "storeTypeId")
);

CREATE INDEX "MenuCategoryStoreType_storeTypeId_idx" ON "MenuCategoryStoreType"("storeTypeId");
CREATE INDEX "MenuItemStoreType_storeTypeId_idx" ON "MenuItemStoreType"("storeTypeId");

ALTER TABLE "MenuCategoryStoreType"
ADD CONSTRAINT "MenuCategoryStoreType_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MenuCategoryStoreType"
ADD CONSTRAINT "MenuCategoryStoreType_storeTypeId_fkey"
FOREIGN KEY ("storeTypeId") REFERENCES "StoreType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MenuItemStoreType"
ADD CONSTRAINT "MenuItemStoreType_itemId_fkey"
FOREIGN KEY ("itemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MenuItemStoreType"
ADD CONSTRAINT "MenuItemStoreType_storeTypeId_fkey"
FOREIGN KEY ("storeTypeId") REFERENCES "StoreType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { BranchCatalogRecord } from '../entities/branch-catalog.entity';
import { ItemOptionGroupOwnershipRecord } from '../entities/item-option-group-ownership.entity';
import { ItemOptionOwnershipRecord } from '../entities/item-option-ownership.entity';
import { ItemVariantCombinationOwnershipRecord } from '../entities/item-variant-combination-ownership.entity';
import { MenuItemInventoryLotRecord } from '../entities/menu-item-inventory-lot.entity';
import { MenuCategoryOwnershipRecord } from '../entities/menu-category-ownership.entity';
import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
type MenuDatabaseClient = PrismaService | Prisma.TransactionClient;
declare const approvedBranchStoreTypeInclude: {
    storeType: {
        select: {
            id: true;
            code: true;
            name: true;
            sortOrder: true;
        };
    };
};
export type ApprovedBranchStoreTypeRecord = Prisma.BranchStoreTypeGetPayload<{
    include: typeof approvedBranchStoreTypeInclude;
}>;
export declare class MenusRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findCategoryById(id: string, client?: MenuDatabaseClient): Promise<MenuCategoryOwnershipRecord | null>;
    listCategoriesByBranchId(branchId: string): Promise<MenuCategoryOwnershipRecord[]>;
    createCategory(data: Prisma.MenuCategoryUncheckedCreateInput, client?: MenuDatabaseClient): Promise<MenuCategoryOwnershipRecord>;
    updateCategory(id: string, data: Prisma.MenuCategoryUpdateInput, client?: MenuDatabaseClient): Promise<MenuCategoryOwnershipRecord>;
    findHighestCategorySortOrderByBranchId(branchId: string, client?: MenuDatabaseClient): Promise<{
        sortOrder: number;
    } | null>;
    findItemById(id: string, client?: MenuDatabaseClient): Promise<MenuItemOwnershipRecord | null>;
    listItemsByBranchId(branchId: string): Promise<MenuItemOwnershipRecord[]>;
    listItemsByIds(ids: string[], client?: MenuDatabaseClient): Promise<MenuItemOwnershipRecord[]>;
    createItem(data: Prisma.MenuItemUncheckedCreateInput, client?: MenuDatabaseClient): Promise<MenuItemOwnershipRecord>;
    updateItem(id: string, data: Prisma.MenuItemUpdateInput, client?: MenuDatabaseClient): Promise<MenuItemOwnershipRecord>;
    decrementTrackedItemStock(itemId: string, quantity: number, client?: MenuDatabaseClient): Promise<boolean>;
    adjustTrackedItemStock(itemId: string, delta: number, client?: MenuDatabaseClient): Promise<boolean>;
    incrementItemStock(itemId: string, quantity: number, client?: MenuDatabaseClient): Promise<number>;
    findHighestItemSortOrderByBranchId(branchId: string, client?: MenuDatabaseClient): Promise<{
        sortOrder: number;
    } | null>;
    findOptionGroupById(id: string): Promise<ItemOptionGroupOwnershipRecord | null>;
    listOptionGroupsByMenuItemId(menuItemId: string): Promise<ItemOptionGroupOwnershipRecord[]>;
    createOptionGroup(data: Prisma.ItemOptionGroupUncheckedCreateInput, client?: MenuDatabaseClient): Promise<ItemOptionGroupOwnershipRecord>;
    updateOptionGroup(id: string, data: Prisma.ItemOptionGroupUpdateInput, client?: MenuDatabaseClient): Promise<ItemOptionGroupOwnershipRecord>;
    findHighestOptionGroupSortOrderByMenuItemId(menuItemId: string, client?: MenuDatabaseClient): Promise<{
        sortOrder: number;
    } | null>;
    findOptionById(id: string, client?: MenuDatabaseClient): Promise<ItemOptionOwnershipRecord | null>;
    listOptionsByOptionGroupId(optionGroupId: string): Promise<ItemOptionOwnershipRecord[]>;
    listOptionsByBranchId(branchId: string, client?: MenuDatabaseClient): Promise<ItemOptionOwnershipRecord[]>;
    createOption(data: Prisma.ItemOptionUncheckedCreateInput, client?: MenuDatabaseClient): Promise<ItemOptionOwnershipRecord>;
    updateOption(id: string, data: Prisma.ItemOptionUpdateInput, client?: MenuDatabaseClient): Promise<ItemOptionOwnershipRecord>;
    decrementTrackedOptionStock(optionId: string, quantity: number, client?: MenuDatabaseClient): Promise<boolean>;
    adjustTrackedOptionStock(optionId: string, delta: number, client?: MenuDatabaseClient): Promise<boolean>;
    incrementOptionStock(optionId: string, quantity: number, client?: MenuDatabaseClient): Promise<number>;
    findHighestOptionSortOrderByOptionGroupId(optionGroupId: string, client?: MenuDatabaseClient): Promise<{
        sortOrder: number;
    } | null>;
    findVariantCombinationById(id: string, client?: MenuDatabaseClient): Promise<ItemVariantCombinationOwnershipRecord | null>;
    listVariantCombinationsByMenuItemId(menuItemId: string, client?: MenuDatabaseClient): Promise<ItemVariantCombinationOwnershipRecord[]>;
    listVariantCombinationsByMenuItemIds(menuItemIds: string[], client?: MenuDatabaseClient): Promise<ItemVariantCombinationOwnershipRecord[]>;
    findVariantCombinationByMenuItemIdAndSignature(menuItemId: string, signature: string, client?: MenuDatabaseClient): Promise<ItemVariantCombinationOwnershipRecord | null>;
    findActiveVariantCombinationByMenuItemIdAndSignature(menuItemId: string, signature: string, client?: MenuDatabaseClient): Promise<ItemVariantCombinationOwnershipRecord | null>;
    createVariantCombination(data: Prisma.ItemVariantCombinationUncheckedCreateInput, client?: MenuDatabaseClient): Promise<ItemVariantCombinationOwnershipRecord>;
    updateVariantCombination(id: string, data: Prisma.ItemVariantCombinationUpdateInput, client?: MenuDatabaseClient): Promise<ItemVariantCombinationOwnershipRecord>;
    findHighestVariantCombinationSortOrderByMenuItemId(menuItemId: string, client?: MenuDatabaseClient): Promise<{
        sortOrder: number;
    } | null>;
    replaceVariantCombinationOptions(combinationId: string, optionIds: string[], client?: MenuDatabaseClient): Promise<void>;
    decrementTrackedVariantCombinationStock(combinationId: string, quantity: number, client?: MenuDatabaseClient): Promise<boolean>;
    incrementVariantCombinationStock(combinationId: string, quantity: number, client?: MenuDatabaseClient): Promise<number>;
    findItemInventoryLotById(id: string, client?: MenuDatabaseClient): Promise<MenuItemInventoryLotRecord | null>;
    findItemInventoryLotByMenuItemIdAndBatchNo(menuItemId: string, batchNo: string, client?: MenuDatabaseClient): Promise<MenuItemInventoryLotRecord | null>;
    listItemInventoryLotsByMenuItemId(menuItemId: string, client?: MenuDatabaseClient): Promise<MenuItemInventoryLotRecord[]>;
    createItemInventoryLot(data: Prisma.MenuItemInventoryLotUncheckedCreateInput, client?: MenuDatabaseClient): Promise<MenuItemInventoryLotRecord>;
    updateItemInventoryLot(id: string, data: Prisma.MenuItemInventoryLotUpdateInput, client?: MenuDatabaseClient): Promise<MenuItemInventoryLotRecord>;
    countItemInventoryLotsByMenuItemId(menuItemId: string, client?: MenuDatabaseClient): Promise<number>;
    countRemainingItemInventoryLotsByMenuItemId(menuItemId: string, client?: MenuDatabaseClient): Promise<number>;
    adjustItemInventoryLotQuantity(lotId: string, delta: number, client?: MenuDatabaseClient): Promise<boolean>;
    decrementItemInventoryLotQuantity(lotId: string, quantity: number, client?: MenuDatabaseClient): Promise<boolean>;
    incrementItemInventoryLotRemainingQuantity(lotId: string, quantity: number, client?: MenuDatabaseClient): Promise<number>;
    findBranchCatalogByBranchId(branchId: string): Promise<BranchCatalogRecord | null>;
    listApprovedStoreTypesByBranchId(branchId: string, client?: MenuDatabaseClient): Promise<ApprovedBranchStoreTypeRecord[]>;
    replaceCategoryStoreTypes(categoryId: string, storeTypeIds: string[], client?: MenuDatabaseClient): Promise<void>;
    replaceItemStoreTypes(itemId: string, storeTypeIds: string[], client?: MenuDatabaseClient): Promise<void>;
    deleteCategory(id: string, client?: MenuDatabaseClient): Promise<MenuCategoryOwnershipRecord>;
    deleteItem(id: string, client?: MenuDatabaseClient): Promise<MenuItemOwnershipRecord>;
    deleteOptionGroup(id: string, client?: MenuDatabaseClient): Promise<ItemOptionGroupOwnershipRecord>;
    deleteOption(id: string, client?: MenuDatabaseClient): Promise<ItemOptionOwnershipRecord>;
}
export {};

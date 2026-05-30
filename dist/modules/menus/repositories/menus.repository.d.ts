import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { BranchCatalogRecord } from '../entities/branch-catalog.entity';
import { ItemOptionGroupOwnershipRecord } from '../entities/item-option-group-ownership.entity';
import { ItemOptionOwnershipRecord } from '../entities/item-option-ownership.entity';
import { MenuCategoryOwnershipRecord } from '../entities/menu-category-ownership.entity';
import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
type MenuDatabaseClient = PrismaService | Prisma.TransactionClient;
export declare class MenusRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findCategoryById(id: string): Promise<MenuCategoryOwnershipRecord | null>;
    listCategoriesByBranchId(branchId: string): Promise<MenuCategoryOwnershipRecord[]>;
    createCategory(data: Prisma.MenuCategoryUncheckedCreateInput, client?: MenuDatabaseClient): Promise<MenuCategoryOwnershipRecord>;
    updateCategory(id: string, data: Prisma.MenuCategoryUpdateInput, client?: MenuDatabaseClient): Promise<MenuCategoryOwnershipRecord>;
    findHighestCategorySortOrderByBranchId(branchId: string, client?: MenuDatabaseClient): Promise<{
        sortOrder: number;
    } | null>;
    findItemById(id: string): Promise<MenuItemOwnershipRecord | null>;
    listItemsByBranchId(branchId: string): Promise<MenuItemOwnershipRecord[]>;
    createItem(data: Prisma.MenuItemUncheckedCreateInput, client?: MenuDatabaseClient): Promise<MenuItemOwnershipRecord>;
    updateItem(id: string, data: Prisma.MenuItemUpdateInput, client?: MenuDatabaseClient): Promise<MenuItemOwnershipRecord>;
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
    findOptionById(id: string): Promise<ItemOptionOwnershipRecord | null>;
    listOptionsByOptionGroupId(optionGroupId: string): Promise<ItemOptionOwnershipRecord[]>;
    createOption(data: Prisma.ItemOptionUncheckedCreateInput, client?: MenuDatabaseClient): Promise<ItemOptionOwnershipRecord>;
    updateOption(id: string, data: Prisma.ItemOptionUpdateInput, client?: MenuDatabaseClient): Promise<ItemOptionOwnershipRecord>;
    findHighestOptionSortOrderByOptionGroupId(optionGroupId: string, client?: MenuDatabaseClient): Promise<{
        sortOrder: number;
    } | null>;
    findBranchCatalogByBranchId(branchId: string): Promise<BranchCatalogRecord | null>;
}
export {};

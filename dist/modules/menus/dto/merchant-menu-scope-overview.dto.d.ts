import { BranchCatalogEntity } from '../entities/branch-catalog.entity';
import { MenuScopedStoreTypeDto } from './menu-scoped-store-type.dto';
export declare enum MerchantMenuScopeMode {
    ALL_APPROVED_STORE_TYPES = "ALL_APPROVED_STORE_TYPES",
    SELECTED_STORE_TYPES = "SELECTED_STORE_TYPES"
}
export declare class MerchantMenuScopeTotalsDto {
    totalCategories: number;
    scopedCategories: number;
    unscopedCategories: number;
    totalItems: number;
    scopedItems: number;
    unscopedItems: number;
}
export declare class MerchantMenuScopeUsageDto {
    storeType: MenuScopedStoreTypeDto;
    scopedCategoryCount: number;
    scopedItemCount: number;
}
export declare class MerchantMenuCategoryScopeSummaryDto {
    categoryId: string;
    name: string;
    sortOrder: number;
    isActive: boolean;
    scopeMode: MerchantMenuScopeMode;
    storeTypes: MenuScopedStoreTypeDto[];
    itemCount: number;
    scopedItemCount: number;
    unscopedItemCount: number;
}
export declare class MerchantMenuItemScopeSummaryDto {
    itemId: string;
    categoryId: string | null;
    categoryName: string | null;
    name: string;
    sortOrder: number;
    isAvailable: boolean;
    isStockTracked: boolean;
    isInStock: boolean;
    isLowStock: boolean;
    scopeMode: MerchantMenuScopeMode;
    storeTypes: MenuScopedStoreTypeDto[];
}
export declare class MerchantMenuScopeOverviewDto {
    branchId: string;
    branchName: string;
    township: string;
    approvedStoreTypes: MenuScopedStoreTypeDto[];
    totals: MerchantMenuScopeTotalsDto;
    storeTypeUsage: MerchantMenuScopeUsageDto[];
    categories: MerchantMenuCategoryScopeSummaryDto[];
    items: MerchantMenuItemScopeSummaryDto[];
}
export declare function toMerchantMenuScopeOverviewDto(branchCatalog: BranchCatalogEntity): MerchantMenuScopeOverviewDto;

import { ItemOptionGroupKind } from '@prisma/client';
import { BranchCatalogEntity } from '../entities/branch-catalog.entity';
import { MenuScopedStoreTypeDto } from './menu-scoped-store-type.dto';
export declare class CatalogOptionDto {
    optionId: string;
    name: string;
    priceDelta: string;
    isStockTracked: boolean;
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    isInStock: boolean;
    isLowStock: boolean;
    sortOrder: number;
    isActive: boolean;
}
export declare class CatalogOptionGroupDto {
    optionGroupId: string;
    name: string;
    description?: string | null;
    kind: ItemOptionGroupKind;
    minSelect: number;
    maxSelect: number;
    sortOrder: number;
    isActive: boolean;
    options: CatalogOptionDto[];
}
export declare class CatalogVariantCombinationSelectionDto {
    optionId: string;
    optionName: string;
    optionSortOrder: number;
    optionGroupId: string;
    optionGroupName: string;
    optionGroupSortOrder: number;
}
export declare class CatalogVariantCombinationDto {
    combinationId: string;
    name: string;
    sku?: string | null;
    isStockTracked: boolean;
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    isInStock: boolean;
    isLowStock: boolean;
    sortOrder: number;
    isActive: boolean;
    selectedOptions: CatalogVariantCombinationSelectionDto[];
}
export declare class CatalogMenuItemDto {
    itemId: string;
    categoryId?: string | null;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    imageUrls: string[];
    sku?: string | null;
    barcode?: string | null;
    brand?: string | null;
    attributes?: Record<string, unknown> | null;
    basePrice: string;
    isStockTracked: boolean;
    stockQuantity?: number | null;
    lowStockThreshold?: number | null;
    isInStock: boolean;
    isLowStock: boolean;
    sortOrder: number;
    isAvailable: boolean;
    storeTypes: MenuScopedStoreTypeDto[];
    optionGroups: CatalogOptionGroupDto[];
    variantCombinations: CatalogVariantCombinationDto[];
}
export declare class CatalogMenuCategoryDto {
    categoryId: string;
    name: string;
    description?: string | null;
    sortOrder: number;
    isActive: boolean;
    storeTypes: MenuScopedStoreTypeDto[];
    items: CatalogMenuItemDto[];
}
export declare class BranchCatalogDto {
    branchId: string;
    merchantId: string;
    merchantUserId: string;
    branchName: string;
    township: string;
    branchStatus: string;
    categories: CatalogMenuCategoryDto[];
    uncategorizedItems: CatalogMenuItemDto[];
}
export declare function toBranchCatalogDto(branchCatalog: BranchCatalogEntity): BranchCatalogDto;

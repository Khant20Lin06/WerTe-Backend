import { BranchCatalogEntity } from '../entities/branch-catalog.entity';
export declare class CatalogOptionDto {
    optionId: string;
    name: string;
    priceDelta: string;
    sortOrder: number;
    isActive: boolean;
}
export declare class CatalogOptionGroupDto {
    optionGroupId: string;
    name: string;
    description?: string | null;
    minSelect: number;
    maxSelect: number;
    sortOrder: number;
    isActive: boolean;
    options: CatalogOptionDto[];
}
export declare class CatalogMenuItemDto {
    itemId: string;
    categoryId?: string | null;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    basePrice: string;
    sortOrder: number;
    isAvailable: boolean;
    optionGroups: CatalogOptionGroupDto[];
}
export declare class CatalogMenuCategoryDto {
    categoryId: string;
    name: string;
    description?: string | null;
    sortOrder: number;
    isActive: boolean;
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

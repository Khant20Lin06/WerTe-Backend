import { ItemVariantCombinationOwnershipRecord } from '../entities/item-variant-combination-ownership.entity';
export declare class ItemVariantCombinationSelectedOptionDto {
    optionId: string;
    optionName: string;
    optionSortOrder: number;
    optionGroupId: string;
    optionGroupName: string;
    optionGroupSortOrder: number;
}
export declare class ItemVariantCombinationDto {
    id: string;
    branchId: string;
    menuItemId: string;
    name: string;
    sku?: string | null;
    isStockTracked: boolean;
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    isInStock: boolean;
    isLowStock: boolean;
    sortOrder: number;
    isActive: boolean;
    selectedOptions: ItemVariantCombinationSelectedOptionDto[];
    createdAt: string;
    updatedAt: string;
}
export declare function toItemVariantCombinationDto(combination: ItemVariantCombinationOwnershipRecord): ItemVariantCombinationDto;

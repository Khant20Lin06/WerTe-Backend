import { ItemOptionOwnershipRecord } from '../entities/item-option-ownership.entity';
export declare class ItemOptionDto {
    id: string;
    branchId: string;
    menuItemId: string;
    optionGroupId: string;
    name: string;
    priceDelta: string;
    isStockTracked: boolean;
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    isInStock: boolean;
    isLowStock: boolean;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare function toItemOptionDto(option: ItemOptionOwnershipRecord): ItemOptionDto;

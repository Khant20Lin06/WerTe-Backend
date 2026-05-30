import { ItemOptionOwnershipRecord } from '../entities/item-option-ownership.entity';
export declare class ItemOptionDto {
    id: string;
    branchId: string;
    menuItemId: string;
    optionGroupId: string;
    name: string;
    priceDelta: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare function toItemOptionDto(option: ItemOptionOwnershipRecord): ItemOptionDto;

import { ItemOptionGroupOwnershipRecord } from '../entities/item-option-group-ownership.entity';
export declare class ItemOptionGroupDto {
    id: string;
    branchId: string;
    menuItemId: string;
    name: string;
    description?: string | null;
    minSelect: number;
    maxSelect: number;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare function toItemOptionGroupDto(group: ItemOptionGroupOwnershipRecord): ItemOptionGroupDto;

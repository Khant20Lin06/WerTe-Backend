import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
export declare class MenuItemDto {
    id: string;
    branchId: string;
    categoryId?: string | null;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    basePrice: string;
    sortOrder: number;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare function toMenuItemDto(item: MenuItemOwnershipRecord): MenuItemDto;

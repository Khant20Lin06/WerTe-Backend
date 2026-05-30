import { MenuCategoryOwnershipRecord } from '../entities/menu-category-ownership.entity';
export declare class MenuCategoryDto {
    id: string;
    branchId: string;
    name: string;
    description?: string | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare function toMenuCategoryDto(category: MenuCategoryOwnershipRecord): MenuCategoryDto;

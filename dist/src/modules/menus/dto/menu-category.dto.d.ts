import { MenuCategoryOwnershipRecord } from '../entities/menu-category-ownership.entity';
import { MenuScopedStoreTypeDto } from './menu-scoped-store-type.dto';
export declare class MenuCategoryDto {
    id: string;
    branchId: string;
    name: string;
    description?: string | null;
    sortOrder: number;
    isActive: boolean;
    storeTypes: MenuScopedStoreTypeDto[];
    createdAt: string;
    updatedAt: string;
}
export declare function toMenuCategoryDto(category: MenuCategoryOwnershipRecord): MenuCategoryDto;

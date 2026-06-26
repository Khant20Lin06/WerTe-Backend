import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
import { MenuScopedStoreTypeDto } from './menu-scoped-store-type.dto';
export declare class MenuItemDto {
    id: string;
    branchId: string;
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
    createdAt: string;
    updatedAt: string;
}
export declare function toMenuItemDto(item: MenuItemOwnershipRecord): MenuItemDto;

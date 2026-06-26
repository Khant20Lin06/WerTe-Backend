export declare class CreateMenuItemDto {
    categoryId?: string;
    name: string;
    description?: string;
    imageUrl?: string;
    imageUrls?: string[];
    sku?: string;
    barcode?: string;
    brand?: string;
    attributes?: Record<string, unknown>;
    basePrice: number;
    isStockTracked?: boolean;
    stockQuantity?: number;
    lowStockThreshold?: number;
    sortOrder?: number;
    isAvailable?: boolean;
    storeTypeIds?: string[];
}

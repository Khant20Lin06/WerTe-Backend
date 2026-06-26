export declare class CreateItemVariantCombinationDto {
    name?: string;
    sku?: string;
    selectedOptionIds: string[];
    isStockTracked?: boolean;
    stockQuantity?: number;
    lowStockThreshold?: number;
    sortOrder?: number;
    isActive?: boolean;
}

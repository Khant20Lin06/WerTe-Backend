export declare enum MerchantInventoryAttentionLevel {
    LOW_STOCK = "LOW_STOCK",
    OUT_OF_STOCK = "OUT_OF_STOCK"
}
export declare class MerchantInventoryOverviewTotalsDto {
    trackedItemCount: number;
    lowStockItemCount: number;
    outOfStockItemCount: number;
    trackedOptionCount: number;
    lowStockOptionCount: number;
    outOfStockOptionCount: number;
}
export declare class MerchantInventoryAttentionItemDto {
    itemId: string;
    categoryId: string | null;
    categoryName: string | null;
    name: string;
    sku: string | null;
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    attentionLevel: MerchantInventoryAttentionLevel;
}
export declare class MerchantInventoryAttentionOptionDto {
    optionId: string;
    optionGroupId: string;
    optionGroupName: string;
    menuItemId: string;
    menuItemName: string;
    name: string;
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    attentionLevel: MerchantInventoryAttentionLevel;
}
export declare class MerchantInventoryOverviewDto {
    branchId: string;
    branchName: string;
    township: string;
    totals: MerchantInventoryOverviewTotalsDto;
    attentionItems: MerchantInventoryAttentionItemDto[];
    attentionOptions: MerchantInventoryAttentionOptionDto[];
}

import { MerchantInventoryAttentionLevel } from './merchant-inventory-overview.dto';
export declare class MerchantRestockSuggestionSummaryDto {
    itemSuggestionCount: number;
    optionSuggestionCount: number;
    totalSuggestionCount: number;
}
export declare class MerchantRestockSuggestionItemDto {
    itemId: string;
    categoryId: string | null;
    categoryName: string | null;
    name: string;
    sku: string | null;
    currentStockQuantity: number | null;
    lowStockThreshold: number | null;
    targetStockQuantity: number;
    suggestedRestockQuantity: number;
    attentionLevel: MerchantInventoryAttentionLevel;
    lastAdjustedAt: string | null;
    lastAdjustmentReasonCode: string | null;
}
export declare class MerchantRestockSuggestionOptionDto {
    optionId: string;
    optionGroupId: string;
    optionGroupName: string;
    menuItemId: string;
    menuItemName: string;
    name: string;
    currentStockQuantity: number | null;
    lowStockThreshold: number | null;
    targetStockQuantity: number;
    suggestedRestockQuantity: number;
    attentionLevel: MerchantInventoryAttentionLevel;
    lastAdjustedAt: string | null;
    lastAdjustmentReasonCode: string | null;
}
export declare class MerchantRestockSuggestionsDto {
    branchId: string;
    branchName: string;
    generatedAt: string;
    summary: MerchantRestockSuggestionSummaryDto;
    itemSuggestions: MerchantRestockSuggestionItemDto[];
    optionSuggestions: MerchantRestockSuggestionOptionDto[];
}

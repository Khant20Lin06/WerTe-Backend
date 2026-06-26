export type MenuVerticalStoreTypeSummary = {
    id: string;
    code: string;
    name: string;
    sortOrder: number;
};
export type MenuVerticalCatalogRuleProfile = {
    storeTypeId: string;
    storeTypeCode: string;
    storeTypeName: string;
    sortOrder: number;
    requiredFields: string[];
    requiresStockTracking: boolean;
    requiredAttributeKeysAnyOf: string[];
    notes: string[];
};
type MenuVerticalCatalogRuleInput = {
    sku?: string | null;
    brand?: string | null;
    attributes?: Record<string, unknown> | null;
    isStockTracked: boolean;
};
export declare function buildMenuVerticalCatalogRuleProfiles(storeTypes: MenuVerticalStoreTypeSummary[]): MenuVerticalCatalogRuleProfile[];
export declare function assertMenuVerticalCatalogRules(storeTypes: MenuVerticalStoreTypeSummary[], item: MenuVerticalCatalogRuleInput): void;
export {};

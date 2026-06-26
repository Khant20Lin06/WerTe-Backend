import { MenuVerticalCatalogRuleProfile } from '../utils/menu-vertical-catalog-rule.util';
export declare class MenuItemRuleProfileDto {
    storeTypeId: string;
    storeTypeCode: string;
    storeTypeName: string;
    sortOrder: number;
    requiredFields: string[];
    requiresStockTracking: boolean;
    requiredAttributeKeysAnyOf: string[];
    notes: string[];
}
export declare function toMenuItemRuleProfileDto(profile: MenuVerticalCatalogRuleProfile): MenuItemRuleProfileDto;

import { ApiProperty } from '@nestjs/swagger';

import { MenuVerticalCatalogRuleProfile } from '../utils/menu-vertical-catalog-rule.util';

export class MenuItemRuleProfileDto {
  @ApiProperty({ example: 'store_type_pharmacy' })
  storeTypeId!: string;

  @ApiProperty({ example: 'pharmacy' })
  storeTypeCode!: string;

  @ApiProperty({ example: 'Pharmacy' })
  storeTypeName!: string;

  @ApiProperty({ example: 20 })
  sortOrder!: number;

  @ApiProperty({
    example: ['sku', 'brand'],
    type: [String],
  })
  requiredFields!: string[];

  @ApiProperty({ example: true })
  requiresStockTracking!: boolean;

  @ApiProperty({
    example: ['dosageStrength', 'dosageForm', 'packSize'],
    type: [String],
  })
  requiredAttributeKeysAnyOf!: string[];

  @ApiProperty({
    example: ['Pharmacy items should identify dosage or pack metadata before they are published.'],
    type: [String],
  })
  notes!: string[];
}

export function toMenuItemRuleProfileDto(
  profile: MenuVerticalCatalogRuleProfile,
): MenuItemRuleProfileDto {
  return {
    storeTypeId: profile.storeTypeId,
    storeTypeCode: profile.storeTypeCode,
    storeTypeName: profile.storeTypeName,
    sortOrder: profile.sortOrder,
    requiredFields: profile.requiredFields,
    requiresStockTracking: profile.requiresStockTracking,
    requiredAttributeKeysAnyOf: profile.requiredAttributeKeysAnyOf,
    notes: profile.notes,
  };
}

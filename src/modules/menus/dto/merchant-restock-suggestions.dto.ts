import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MerchantInventoryAttentionLevel } from './merchant-inventory-overview.dto';

export class MerchantRestockSuggestionSummaryDto {
  @ApiProperty({
    description: 'Total tracked menu items that currently need restocking.',
    example: 3,
  })
  itemSuggestionCount!: number;

  @ApiProperty({
    description: 'Total tracked item options that currently need restocking.',
    example: 2,
  })
  optionSuggestionCount!: number;

  @ApiProperty({
    description: 'Combined suggestion count across items and options.',
    example: 5,
  })
  totalSuggestionCount!: number;
}

export class MerchantRestockSuggestionItemDto {
  @ApiProperty({
    description: 'Menu item identifier.',
    example: 'item_1',
  })
  itemId!: string;

  @ApiPropertyOptional({
    description: 'Optional category identifier.',
    example: 'cat_1',
  })
  categoryId!: string | null;

  @ApiPropertyOptional({
    description: 'Optional category name.',
    example: 'Popular',
  })
  categoryName!: string | null;

  @ApiProperty({
    description: 'Menu item name.',
    example: 'Mohinga',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional merchant SKU.',
    example: 'SKU-MHG-001',
  })
  sku!: string | null;

  @ApiProperty({
    description: 'Current tracked stock quantity.',
    example: 2,
    nullable: true,
  })
  currentStockQuantity!: number | null;

  @ApiPropertyOptional({
    description: 'Configured low-stock threshold.',
    example: 3,
  })
  lowStockThreshold!: number | null;

  @ApiProperty({
    description: 'Suggested target stock quantity after restocking.',
    example: 6,
  })
  targetStockQuantity!: number;

  @ApiProperty({
    description: 'Suggested quantity to add back into stock.',
    example: 4,
  })
  suggestedRestockQuantity!: number;

  @ApiProperty({
    description: 'Current attention level for this inventory row.',
    enum: MerchantInventoryAttentionLevel,
  })
  attentionLevel!: MerchantInventoryAttentionLevel;

  @ApiPropertyOptional({
    description: 'Most recent adjustment timestamp for this inventory row.',
    example: '2026-05-01T10:00:00.000Z',
  })
  lastAdjustedAt!: string | null;

  @ApiPropertyOptional({
    description: 'Most recent adjustment reason code for this inventory row.',
    example: 'manual_restock_after_return',
  })
  lastAdjustmentReasonCode!: string | null;
}

export class MerchantRestockSuggestionOptionDto {
  @ApiProperty({
    description: 'Item option identifier.',
    example: 'option_1',
  })
  optionId!: string;

  @ApiProperty({
    description: 'Parent option group identifier.',
    example: 'group_1',
  })
  optionGroupId!: string;

  @ApiProperty({
    description: 'Parent option group name.',
    example: 'Choose extras',
  })
  optionGroupName!: string;

  @ApiProperty({
    description: 'Parent menu item identifier.',
    example: 'item_1',
  })
  menuItemId!: string;

  @ApiProperty({
    description: 'Parent menu item name.',
    example: 'Mohinga',
  })
  menuItemName!: string;

  @ApiProperty({
    description: 'Option display name.',
    example: 'Extra fish cake',
  })
  name!: string;

  @ApiProperty({
    description: 'Current tracked stock quantity.',
    example: 1,
    nullable: true,
  })
  currentStockQuantity!: number | null;

  @ApiPropertyOptional({
    description: 'Configured low-stock threshold.',
    example: 2,
  })
  lowStockThreshold!: number | null;

  @ApiProperty({
    description: 'Suggested target stock quantity after restocking.',
    example: 4,
  })
  targetStockQuantity!: number;

  @ApiProperty({
    description: 'Suggested quantity to add back into stock.',
    example: 3,
  })
  suggestedRestockQuantity!: number;

  @ApiProperty({
    description: 'Current attention level for this option inventory row.',
    enum: MerchantInventoryAttentionLevel,
  })
  attentionLevel!: MerchantInventoryAttentionLevel;

  @ApiPropertyOptional({
    description: 'Most recent adjustment timestamp for this option row.',
    example: '2026-05-01T10:00:00.000Z',
  })
  lastAdjustedAt!: string | null;

  @ApiPropertyOptional({
    description: 'Most recent adjustment reason code for this option row.',
    example: 'manual_writeoff_damaged_stock',
  })
  lastAdjustmentReasonCode!: string | null;
}

export class MerchantRestockSuggestionsDto {
  @ApiProperty({
    description: 'Branch identifier.',
    example: 'branch_1',
  })
  branchId!: string;

  @ApiProperty({
    description: 'Branch display name.',
    example: 'Downtown Branch',
  })
  branchName!: string;

  @ApiProperty({
    description: 'Timestamp used when the suggestions were generated.',
    example: '2026-05-01T10:00:00.000Z',
  })
  generatedAt!: string;

  @ApiProperty({
    description: 'Suggestion summary counts.',
    type: MerchantRestockSuggestionSummaryDto,
  })
  summary!: MerchantRestockSuggestionSummaryDto;

  @ApiProperty({
    description: 'Tracked menu item restock suggestions.',
    type: MerchantRestockSuggestionItemDto,
    isArray: true,
  })
  itemSuggestions!: MerchantRestockSuggestionItemDto[];

  @ApiProperty({
    description: 'Tracked item option restock suggestions.',
    type: MerchantRestockSuggestionOptionDto,
    isArray: true,
  })
  optionSuggestions!: MerchantRestockSuggestionOptionDto[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MerchantInventoryAttentionLevel {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export class MerchantInventoryOverviewTotalsDto {
  @ApiProperty({
    description: 'Tracked menu items in the branch.',
    example: 14,
  })
  trackedItemCount!: number;

  @ApiProperty({
    description: 'Tracked menu items currently below or at threshold but still in stock.',
    example: 3,
  })
  lowStockItemCount!: number;

  @ApiProperty({
    description: 'Tracked menu items that are out of stock.',
    example: 1,
  })
  outOfStockItemCount!: number;

  @ApiProperty({
    description: 'Tracked item options in the branch.',
    example: 8,
  })
  trackedOptionCount!: number;

  @ApiProperty({
    description: 'Tracked item options currently below or at threshold but still in stock.',
    example: 2,
  })
  lowStockOptionCount!: number;

  @ApiProperty({
    description: 'Tracked item options that are out of stock.',
    example: 1,
  })
  outOfStockOptionCount!: number;
}

export class MerchantInventoryAttentionItemDto {
  @ApiProperty({
    description: 'Item identifier.',
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
    description: 'Menu item display name.',
    example: 'Mohinga',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional item SKU.',
    example: 'SKU-MHG-001',
  })
  sku!: string | null;

  @ApiProperty({
    description: 'Current tracked stock quantity.',
    example: 2,
    nullable: true,
  })
  stockQuantity!: number | null;

  @ApiPropertyOptional({
    description: 'Low-stock threshold.',
    example: 3,
  })
  lowStockThreshold!: number | null;

  @ApiProperty({
    description: 'Attention level derived from tracked stock state.',
    enum: MerchantInventoryAttentionLevel,
  })
  attentionLevel!: MerchantInventoryAttentionLevel;
}

export class MerchantInventoryAttentionOptionDto {
  @ApiProperty({
    description: 'Option identifier.',
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
    description: 'Parent menu item display name.',
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
    example: 0,
    nullable: true,
  })
  stockQuantity!: number | null;

  @ApiPropertyOptional({
    description: 'Low-stock threshold.',
    example: 2,
  })
  lowStockThreshold!: number | null;

  @ApiProperty({
    description: 'Attention level derived from tracked stock state.',
    enum: MerchantInventoryAttentionLevel,
  })
  attentionLevel!: MerchantInventoryAttentionLevel;
}

export class MerchantInventoryOverviewDto {
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
    description: 'Branch township.',
    example: 'Botahtaung',
  })
  township!: string;

  @ApiProperty({
    description: 'Tracked inventory totals and attention counts.',
    type: MerchantInventoryOverviewTotalsDto,
  })
  totals!: MerchantInventoryOverviewTotalsDto;

  @ApiProperty({
    description: 'Tracked menu items requiring attention.',
    type: MerchantInventoryAttentionItemDto,
    isArray: true,
  })
  attentionItems!: MerchantInventoryAttentionItemDto[];

  @ApiProperty({
    description: 'Tracked item options requiring attention.',
    type: MerchantInventoryAttentionOptionDto,
    isArray: true,
  })
  attentionOptions!: MerchantInventoryAttentionOptionDto[];
}

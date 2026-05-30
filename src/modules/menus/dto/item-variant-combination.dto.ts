import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  ItemVariantCombinationOwnershipRecord,
  buildItemVariantCombinationOwnership,
} from '../entities/item-variant-combination-ownership.entity';

export class ItemVariantCombinationSelectedOptionDto {
  @ApiProperty({
    description: 'Item option identifier that participates in the combination.',
    example: 'option_size_s',
  })
  optionId!: string;

  @ApiProperty({
    description: 'Selected option display name.',
    example: 'Small',
  })
  optionName!: string;

  @ApiProperty({
    description: 'Option sort order within its option group.',
    example: 0,
  })
  optionSortOrder!: number;

  @ApiProperty({
    description: 'Option group identifier that owns the selected option.',
    example: 'group_size',
  })
  optionGroupId!: string;

  @ApiProperty({
    description: 'Option group display name.',
    example: 'Size',
  })
  optionGroupName!: string;

  @ApiProperty({
    description: 'Option group sort order within the menu item.',
    example: 0,
  })
  optionGroupSortOrder!: number;
}

export class ItemVariantCombinationDto {
  @ApiProperty({
    description: 'Variant combination identifier.',
    example: 'variant_combo_1',
  })
  id!: string;

  @ApiProperty({
    description: 'Branch identifier that owns the combination.',
    example: 'branch_1',
  })
  branchId!: string;

  @ApiProperty({
    description: 'Menu item identifier that owns the combination.',
    example: 'item_1',
  })
  menuItemId!: string;

  @ApiProperty({
    description: 'Merchant-facing combination label.',
    example: 'Small / Red / Cotton',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional branch-local SKU for the combination.',
    example: 'SKU-TSHIRT-S-RED-COTTON',
  })
  sku?: string | null;

  @ApiProperty({
    description: 'Whether stock is tracked at the full combination level.',
    example: true,
  })
  isStockTracked!: boolean;

  @ApiProperty({
    description: 'Current tracked stock quantity when enabled.',
    example: 6,
    nullable: true,
  })
  stockQuantity!: number | null;

  @ApiProperty({
    description: 'Low-stock threshold when combination stock tracking is enabled.',
    example: 2,
    nullable: true,
  })
  lowStockThreshold!: number | null;

  @ApiProperty({
    description: 'Whether the combination has stock available or is not stock-tracked.',
    example: true,
  })
  isInStock!: boolean;

  @ApiProperty({
    description: 'Whether the tracked stock quantity is at or below the threshold.',
    example: false,
  })
  isLowStock!: boolean;

  @ApiProperty({
    description: 'Menu-item-local sort order for the combination.',
    example: 0,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Whether the combination is active.',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Selected variant options that make up the combination.',
    type: () => ItemVariantCombinationSelectedOptionDto,
    isArray: true,
  })
  selectedOptions!: ItemVariantCombinationSelectedOptionDto[];

  @ApiProperty({
    description: 'Combination creation timestamp.',
    example: '2026-05-02T10:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Combination last update timestamp.',
    example: '2026-05-02T10:00:00.000Z',
  })
  updatedAt!: string;
}

export function toItemVariantCombinationDto(
  combination: ItemVariantCombinationOwnershipRecord,
): ItemVariantCombinationDto {
  const entity = buildItemVariantCombinationOwnership(combination);

  return {
    id: combination.id,
    branchId: entity.branchId,
    menuItemId: entity.menuItemId,
    name: entity.name,
    sku: entity.sku ?? null,
    isStockTracked: entity.isStockTracked,
    stockQuantity: entity.stockQuantity ?? null,
    lowStockThreshold: entity.lowStockThreshold ?? null,
    isInStock: entity.isInStock,
    isLowStock: entity.isLowStock,
    sortOrder: entity.sortOrder,
    isActive: entity.isActive,
    selectedOptions: entity.selectedOptions.map((selectedOption) => ({
      optionId: selectedOption.optionId,
      optionName: selectedOption.optionName,
      optionSortOrder: selectedOption.optionSortOrder,
      optionGroupId: selectedOption.optionGroupId,
      optionGroupName: selectedOption.optionGroupName,
      optionGroupSortOrder: selectedOption.optionGroupSortOrder,
    })),
    createdAt: combination.createdAt.toISOString(),
    updatedAt: combination.updatedAt.toISOString(),
  };
}

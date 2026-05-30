import { ApiProperty } from '@nestjs/swagger';

import { ItemOptionOwnershipRecord } from '../entities/item-option-ownership.entity';

export class ItemOptionDto {
  @ApiProperty({
    description: 'Item option identifier.',
    example: 'option_1',
  })
  id!: string;

  @ApiProperty({
    description: 'Branch identifier that owns the option.',
    example: 'branch_1',
  })
  branchId!: string;

  @ApiProperty({
    description: 'Menu item identifier that owns the option.',
    example: 'item_1',
  })
  menuItemId!: string;

  @ApiProperty({
    description: 'Option group identifier that owns the option.',
    example: 'group_1',
  })
  optionGroupId!: string;

  @ApiProperty({
    description: 'Option display name.',
    example: 'Thin rice noodle',
  })
  name!: string;

  @ApiProperty({
    description: 'Price delta serialized as string.',
    example: '0',
  })
  priceDelta!: string;

  @ApiProperty({
    description: 'Whether option-level stock tracking is enabled.',
    example: true,
  })
  isStockTracked!: boolean;

  @ApiProperty({
    description: 'Current option stock quantity when tracking is enabled.',
    example: 8,
    nullable: true,
  })
  stockQuantity!: number | null;

  @ApiProperty({
    description: 'Low-stock threshold when tracking is enabled.',
    example: 2,
    nullable: true,
  })
  lowStockThreshold!: number | null;

  @ApiProperty({
    description: 'Whether the option has stock available or is not tracked.',
    example: true,
  })
  isInStock!: boolean;

  @ApiProperty({
    description: 'Whether the tracked quantity is at or below the threshold.',
    example: false,
  })
  isLowStock!: boolean;

  @ApiProperty({
    description: 'Option-group-local sort order for the option.',
    example: 0,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Whether the option is active.',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Option creation timestamp.',
    example: '2026-04-19T09:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Option last update timestamp.',
    example: '2026-04-19T09:00:00.000Z',
  })
  updatedAt!: string;
}

export function toItemOptionDto(option: ItemOptionOwnershipRecord): ItemOptionDto {
  return {
    id: option.id,
    branchId: option.group.menuItem.branch.id,
    menuItemId: option.group.menuItem.id,
    optionGroupId: option.group.id,
    name: option.name,
    priceDelta: option.priceDelta.toString(),
    isStockTracked: option.isStockTracked,
    stockQuantity: option.stockQuantity ?? null,
    lowStockThreshold: option.lowStockThreshold ?? null,
    isInStock: isInStock(option),
    isLowStock: isLowStock(option),
    sortOrder: option.sortOrder,
    isActive: option.isActive,
    createdAt: option.createdAt.toISOString(),
    updatedAt: option.updatedAt.toISOString(),
  };
}

function isInStock(option: ItemOptionOwnershipRecord): boolean {
  if (!option.isStockTracked) {
    return true;
  }

  return (option.stockQuantity ?? 0) > 0;
}

function isLowStock(option: ItemOptionOwnershipRecord): boolean {
  if (
    !option.isStockTracked ||
    option.stockQuantity === null ||
    option.lowStockThreshold === null
  ) {
    return false;
  }

  return option.stockQuantity <= option.lowStockThreshold;
}

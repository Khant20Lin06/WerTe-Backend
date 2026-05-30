import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
import { MenuScopedStoreTypeDto } from './menu-scoped-store-type.dto';

export class MenuItemDto {
  @ApiProperty({
    description: 'Menu item identifier.',
    example: 'item_1',
  })
  id!: string;

  @ApiProperty({
    description: 'Branch identifier that owns the item.',
    example: 'branch_1',
  })
  branchId!: string;

  @ApiPropertyOptional({
    description: 'Optional category identifier for the item.',
    example: 'cat_1',
  })
  categoryId?: string | null;

  @ApiProperty({
    description: 'Menu item display name.',
    example: 'Mohinga',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional menu item description.',
    example: 'Signature breakfast item',
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Optional image URL for the item.',
    example: 'https://cdn.example.com/menu/mohinga.png',
  })
  imageUrl?: string | null;

  @ApiProperty({
    description: 'Additional product image URLs.',
    example: ['https://cdn.example.com/products/cleanser-front.png'],
    type: [String],
  })
  imageUrls!: string[];

  @ApiPropertyOptional({
    description: 'Branch-local stock keeping unit.',
    example: 'SKU-CLEANSER-100ML',
  })
  sku?: string | null;

  @ApiPropertyOptional({
    description: 'Barcode, UPC, EAN, or local scan code.',
    example: '8851234567890',
  })
  barcode?: string | null;

  @ApiPropertyOptional({
    description: 'Product brand.',
    example: 'Glow Lab',
  })
  brand?: string | null;

  @ApiPropertyOptional({
    description: 'Flexible product attributes.',
    example: {
      size: '100ml',
      skinType: 'oily',
    },
    type: Object,
  })
  attributes?: Record<string, unknown> | null;

  @ApiProperty({
    description: 'Base price serialized as string.',
    example: '2500',
  })
  basePrice!: string;

  @ApiProperty({
    description: 'Whether branch-level stock tracking is enabled for this item.',
    example: true,
  })
  isStockTracked!: boolean;

  @ApiPropertyOptional({
    description: 'Current stock quantity when stock tracking is enabled.',
    example: 24,
  })
  stockQuantity?: number | null;

  @ApiPropertyOptional({
    description: 'Low-stock alert threshold for merchant operations.',
    example: 5,
  })
  lowStockThreshold?: number | null;

  @ApiProperty({
    description: 'Whether the item has stock available or is not stock-tracked.',
    example: true,
  })
  isInStock!: boolean;

  @ApiProperty({
    description: 'Whether the tracked stock quantity is at or below the threshold.',
    example: false,
  })
  isLowStock!: boolean;

  @ApiProperty({
    description: 'Branch-local sort order for the item.',
    example: 1,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Whether the item is available for ordering.',
    example: true,
  })
  isAvailable!: boolean;

  @ApiProperty({
    description:
      'Approved store types this item is scoped to. An empty array means the item is visible across all approved store types for the branch.',
    type: MenuScopedStoreTypeDto,
    isArray: true,
  })
  storeTypes!: MenuScopedStoreTypeDto[];

  @ApiProperty({
    description: 'Item creation timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Item last update timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  updatedAt!: string;
}

export function toMenuItemDto(item: MenuItemOwnershipRecord): MenuItemDto {
  return {
    id: item.id,
    branchId: item.branch.id,
    categoryId: item.category?.id ?? null,
    name: item.name,
    description: item.description,
    imageUrl: item.imageUrl,
    imageUrls: toStringArray(item.imageUrlsJson),
    sku: item.sku,
    barcode: item.barcode,
    brand: item.brand,
    attributes: toJsonObject(item.attributesJson),
    basePrice: item.basePrice.toString(),
    isStockTracked: item.isStockTracked,
    stockQuantity: item.stockQuantity,
    lowStockThreshold: item.lowStockThreshold,
    isInStock: isInStock(item),
    isLowStock: isLowStock(item),
    sortOrder: item.sortOrder,
    isAvailable: item.isAvailable,
    storeTypes: item.storeTypes.map((assignment) => ({
      id: assignment.storeType.id,
      code: assignment.storeType.code,
      name: assignment.storeType.name,
      sortOrder: assignment.storeType.sortOrder,
    })),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function isInStock(item: MenuItemOwnershipRecord): boolean {
  if (!item.isStockTracked) {
    return true;
  }

  return (item.stockQuantity ?? 0) > 0;
}

function isLowStock(item: MenuItemOwnershipRecord): boolean {
  if (!item.isStockTracked || item.stockQuantity === null || item.lowStockThreshold === null) {
    return false;
  }

  return item.stockQuantity <= item.lowStockThreshold;
}

function toStringArray(value: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function toJsonObject(value: Prisma.JsonValue | null): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

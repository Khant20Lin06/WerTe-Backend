import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsBoolean,
  IsArray,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMenuItemDto {
  @ApiPropertyOptional({
    description: 'Optional category identifier for the item.',
    example: 'cat_1',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'Menu item display name.',
    example: 'Mohinga',
    maxLength: 160,
  })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional item description.',
    example: 'Signature breakfast item',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Optional image URL for the item.',
    example: 'https://cdn.example.com/menu/mohinga.png',
    maxLength: 2048,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional product image URLs for retail-style catalogs.',
    example: [
      'https://cdn.example.com/products/cleanser-front.png',
      'https://cdn.example.com/products/cleanser-back.png',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({
    description: 'Branch-local stock keeping unit for retail catalogs.',
    example: 'SKU-CLEANSER-100ML',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  sku?: string;

  @ApiPropertyOptional({
    description: 'Barcode, UPC, EAN, or local scan code.',
    example: '8851234567890',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Product brand for grocery, clothing, skincare, or retail items.',
    example: 'Glow Lab',
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  brand?: string;

  @ApiPropertyOptional({
    description:
      'Flexible product attributes, such as size, color, weight, skin type, or material.',
    example: {
      size: '100ml',
      skinType: 'oily',
      origin: 'Thailand',
    },
    type: Object,
  })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;

  @ApiProperty({
    description: 'Base price for the item.',
    example: 2500,
  })
  @Type(() => Number)
  @IsNumber()
  basePrice!: number;

  @ApiPropertyOptional({
    description: 'Whether this item uses branch-level inventory tracking.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isStockTracked?: boolean;

  @ApiPropertyOptional({
    description:
      'Current stock quantity. Providing this value enables stock tracking when isStockTracked is omitted.',
    example: 24,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({
    description: 'Low-stock alert threshold for merchant operations.',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({
    description: 'Explicit branch-local sort order. When omitted, the next slot is assigned automatically.',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the item is available for ordering.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({
    description:
      'Optional approved branch store type identifiers that scope the item. Omit or pass an empty array to keep the item visible for all store types.',
    example: ['store_type_beauty'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(191, { each: true })
  storeTypeIds?: string[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemOptionGroupKind } from '@prisma/client';

import {
  BranchCatalogEntity,
  CatalogMenuCategoryEntity,
  CatalogMenuItemEntity,
  CatalogOptionEntity,
  CatalogOptionGroupEntity,
  CatalogVariantCombinationEntity,
  CatalogVariantCombinationSelectionEntity,
} from '../entities/branch-catalog.entity';
import { MenuScopedStoreTypeDto } from './menu-scoped-store-type.dto';

export class CatalogOptionDto {
  @ApiProperty({
    description: 'Catalog option identifier.',
    example: 'option_1',
  })
  optionId!: string;

  @ApiProperty({
    description: 'Option display name.',
    example: 'Thin rice noodle',
  })
  name!: string;

  @ApiProperty({
    description: 'Price delta serialized as string.',
    example: '500',
  })
  priceDelta!: string;

  @ApiProperty({
    description: 'Whether stock is tracked for the option-level variant or add-on.',
    example: true,
  })
  isStockTracked!: boolean;

  @ApiProperty({
    description: 'Current option stock quantity when tracking is enabled.',
    example: 4,
    nullable: true,
  })
  stockQuantity!: number | null;

  @ApiProperty({
    description: 'Low-stock threshold when tracking is enabled.',
    example: 1,
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
    description: 'Option sort order within the option group.',
    example: 0,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Whether the option is active.',
    example: true,
  })
  isActive!: boolean;
}

export class CatalogOptionGroupDto {
  @ApiProperty({
    description: 'Catalog option group identifier.',
    example: 'group_1',
  })
  optionGroupId!: string;

  @ApiProperty({
    description: 'Option group display name.',
    example: 'Choose noodle type',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional option group description.',
    example: 'Required selection',
  })
  description?: string | null;

  @ApiProperty({
    description: 'Whether the option group behaves as an add-on picker or variant selector.',
    enum: ItemOptionGroupKind,
    example: ItemOptionGroupKind.VARIANT_SELECTOR,
  })
  kind!: ItemOptionGroupKind;

  @ApiProperty({
    description: 'Minimum required selections.',
    example: 1,
  })
  minSelect!: number;

  @ApiProperty({
    description: 'Maximum allowed selections.',
    example: 1,
  })
  maxSelect!: number;

  @ApiProperty({
    description: 'Option group sort order within the menu item.',
    example: 0,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Whether the option group is active.',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Visible options within the option group.',
    type: () => CatalogOptionDto,
    isArray: true,
  })
  options!: CatalogOptionDto[];
}

export class CatalogVariantCombinationSelectionDto {
  @ApiProperty({
    description: 'Option identifier that participates in the variant combination.',
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
    description: 'Option group identifier for the selected option.',
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

export class CatalogVariantCombinationDto {
  @ApiProperty({
    description: 'Variant combination identifier.',
    example: 'variant_combo_1',
  })
  combinationId!: string;

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
    description: 'Whether stock is tracked for the full variant combination.',
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
    description: 'Low-stock threshold when combination-level stock tracking is enabled.',
    example: 2,
    nullable: true,
  })
  lowStockThreshold!: number | null;

  @ApiProperty({
    description: 'Whether the combination has stock available or is not tracked.',
    example: true,
  })
  isInStock!: boolean;

  @ApiProperty({
    description: 'Whether the tracked quantity is at or below the threshold.',
    example: false,
  })
  isLowStock!: boolean;

  @ApiProperty({
    description: 'Combination sort order within the menu item.',
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
    type: () => CatalogVariantCombinationSelectionDto,
    isArray: true,
  })
  selectedOptions!: CatalogVariantCombinationSelectionDto[];
}

export class CatalogMenuItemDto {
  @ApiProperty({
    description: 'Catalog menu item identifier.',
    example: 'item_1',
  })
  itemId!: string;

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
    description: 'Optional item description.',
    example: 'Signature breakfast item',
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Optional item image URL.',
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
    description: 'Item sort order within the branch or category.',
    example: 1,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Whether the item is currently available for ordering.',
    example: true,
  })
  isAvailable!: boolean;

  @ApiProperty({
    description:
      'Average customer rating for the item (1-5). Null when no ratings exist.',
    example: 4.5,
    nullable: true,
  })
  averageRating!: number | null;

  @ApiProperty({
    description: 'Total number of customer ratings for the item.',
    example: 12,
  })
  reviewCount!: number;

  @ApiProperty({
    description:
      'Approved store types this item is scoped to. An empty array means the item is visible across all approved store types for the branch.',
    type: () => MenuScopedStoreTypeDto,
    isArray: true,
  })
  storeTypes!: MenuScopedStoreTypeDto[];

  @ApiProperty({
    description: 'Visible option groups within the item.',
    type: () => CatalogOptionGroupDto,
    isArray: true,
  })
  optionGroups!: CatalogOptionGroupDto[];

  @ApiProperty({
    description: 'Visible full variant combinations defined for the item.',
    type: () => CatalogVariantCombinationDto,
    isArray: true,
  })
  variantCombinations!: CatalogVariantCombinationDto[];
}

export class CatalogMenuCategoryDto {
  @ApiProperty({
    description: 'Catalog category identifier.',
    example: 'cat_1',
  })
  categoryId!: string;

  @ApiProperty({
    description: 'Category display name.',
    example: 'Popular',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional category description.',
    example: 'Most ordered items',
  })
  description?: string | null;

  @ApiProperty({
    description: 'Category sort order within the branch.',
    example: 0,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Whether the category is active.',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description:
      'Approved store types this category is scoped to. An empty array means the category is visible across all approved store types for the branch.',
    type: () => MenuScopedStoreTypeDto,
    isArray: true,
  })
  storeTypes!: MenuScopedStoreTypeDto[];

  @ApiProperty({
    description: 'Visible items in the category.',
    type: () => CatalogMenuItemDto,
    isArray: true,
  })
  items!: CatalogMenuItemDto[];
}

export class BranchCatalogDto {
  @ApiProperty({
    description: 'Branch identifier.',
    example: 'branch_1',
  })
  branchId!: string;

  @ApiProperty({
    description: 'Merchant identifier that owns the branch.',
    example: 'merchant_1',
  })
  merchantId!: string;

  @ApiProperty({
    description: 'Merchant user identifier that owns the branch.',
    example: 'usr_merchant_1',
  })
  merchantUserId!: string;

  @ApiProperty({
    description: 'Branch display name.',
    example: 'Downtown Branch',
  })
  branchName!: string;

  @ApiProperty({
    description: 'Branch township for display and locality context.',
    example: 'Botahtaung',
  })
  township!: string;

  @ApiProperty({
    description: 'Current branch status.',
    example: 'ACTIVE',
  })
  branchStatus!: string;

  @ApiProperty({
    description: 'Visible categories for the branch catalog.',
    type: () => CatalogMenuCategoryDto,
    isArray: true,
  })
  categories!: CatalogMenuCategoryDto[];

  @ApiProperty({
    description: 'Visible items without a category.',
    type: () => CatalogMenuItemDto,
    isArray: true,
  })
  uncategorizedItems!: CatalogMenuItemDto[];
}

function toCatalogOptionDto(option: CatalogOptionEntity): CatalogOptionDto {
  return {
    optionId: option.optionId,
    name: option.name,
    priceDelta: option.priceDelta,
    isStockTracked: option.isStockTracked,
    stockQuantity: option.stockQuantity ?? null,
    lowStockThreshold: option.lowStockThreshold ?? null,
    isInStock: option.isInStock,
    isLowStock: option.isLowStock,
    sortOrder: option.sortOrder,
    isActive: option.isActive,
  };
}

function toCatalogOptionGroupDto(
  group: CatalogOptionGroupEntity,
): CatalogOptionGroupDto {
  return {
    optionGroupId: group.optionGroupId,
    name: group.name,
    description: group.description,
    kind: group.kind,
    minSelect: group.minSelect,
    maxSelect: group.maxSelect,
    sortOrder: group.sortOrder,
    isActive: group.isActive,
    options: group.options.map((option) => toCatalogOptionDto(option)),
  };
}

function toCatalogVariantCombinationSelectionDto(
  selectedOption: CatalogVariantCombinationSelectionEntity,
): CatalogVariantCombinationSelectionDto {
  return {
    optionId: selectedOption.optionId,
    optionName: selectedOption.optionName,
    optionSortOrder: selectedOption.optionSortOrder,
    optionGroupId: selectedOption.optionGroupId,
    optionGroupName: selectedOption.optionGroupName,
    optionGroupSortOrder: selectedOption.optionGroupSortOrder,
  };
}

function toCatalogVariantCombinationDto(
  combination: CatalogVariantCombinationEntity,
): CatalogVariantCombinationDto {
  return {
    combinationId: combination.combinationId,
    name: combination.name,
    sku: combination.sku,
    isStockTracked: combination.isStockTracked,
    stockQuantity: combination.stockQuantity ?? null,
    lowStockThreshold: combination.lowStockThreshold ?? null,
    isInStock: combination.isInStock,
    isLowStock: combination.isLowStock,
    sortOrder: combination.sortOrder,
    isActive: combination.isActive,
    selectedOptions: combination.selectedOptions.map((selectedOption) =>
      toCatalogVariantCombinationSelectionDto(selectedOption),
    ),
  };
}

function toCatalogMenuItemDto(item: CatalogMenuItemEntity): CatalogMenuItemDto {
  return {
    itemId: item.itemId,
    categoryId: item.categoryId,
    name: item.name,
    description: item.description,
    imageUrl: item.imageUrl,
    imageUrls: item.imageUrls,
    sku: item.sku,
    barcode: item.barcode,
    brand: item.brand,
    attributes: item.attributes,
    basePrice: item.basePrice,
    isStockTracked: item.isStockTracked,
    stockQuantity: item.stockQuantity,
    lowStockThreshold: item.lowStockThreshold,
    isInStock: item.isInStock,
    isLowStock: item.isLowStock,
    sortOrder: item.sortOrder,
    isAvailable: item.isAvailable,
    averageRating: item.averageRating ?? null,
    reviewCount: item.reviewCount ?? 0,
    storeTypes: item.scopedStoreTypes.map((storeType) => ({
      id: storeType.id,
      code: storeType.code,
      name: storeType.name,
      sortOrder: storeType.sortOrder,
    })),
    optionGroups: item.optionGroups.map((group) => toCatalogOptionGroupDto(group)),
    variantCombinations: item.variantCombinations.map((combination) =>
      toCatalogVariantCombinationDto(combination),
    ),
  };
}

function toCatalogMenuCategoryDto(
  category: CatalogMenuCategoryEntity,
): CatalogMenuCategoryDto {
  return {
    categoryId: category.categoryId,
    name: category.name,
    description: category.description,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    storeTypes: category.scopedStoreTypes.map((storeType) => ({
      id: storeType.id,
      code: storeType.code,
      name: storeType.name,
      sortOrder: storeType.sortOrder,
    })),
    items: category.items.map((item) => toCatalogMenuItemDto(item)),
  };
}

export function toBranchCatalogDto(branchCatalog: BranchCatalogEntity): BranchCatalogDto {
  return {
    branchId: branchCatalog.branchId,
    merchantId: branchCatalog.merchantId,
    merchantUserId: branchCatalog.merchantUserId,
    branchName: branchCatalog.branchName,
    township: branchCatalog.township,
    branchStatus: branchCatalog.branchStatus,
    categories: branchCatalog.categories.map((category) =>
      toCatalogMenuCategoryDto(category),
    ),
    uncategorizedItems: branchCatalog.uncategorizedItems.map((item) =>
      toCatalogMenuItemDto(item),
    ),
  };
}

import { ApiProperty } from '@nestjs/swagger';

import { BranchCatalogEntity } from '../entities/branch-catalog.entity';
import { MenuScopedStoreTypeDto } from './menu-scoped-store-type.dto';

export enum MerchantMenuScopeMode {
  ALL_APPROVED_STORE_TYPES = 'ALL_APPROVED_STORE_TYPES',
  SELECTED_STORE_TYPES = 'SELECTED_STORE_TYPES',
}

export class MerchantMenuScopeTotalsDto {
  @ApiProperty({
    description: 'Total categories in the branch catalog.',
    example: 4,
  })
  totalCategories!: number;

  @ApiProperty({
    description: 'Categories explicitly scoped to selected store types.',
    example: 2,
  })
  scopedCategories!: number;

  @ApiProperty({
    description: 'Categories visible across all approved store types.',
    example: 2,
  })
  unscopedCategories!: number;

  @ApiProperty({
    description: 'Total items in the branch catalog.',
    example: 12,
  })
  totalItems!: number;

  @ApiProperty({
    description: 'Items explicitly scoped to selected store types.',
    example: 5,
  })
  scopedItems!: number;

  @ApiProperty({
    description: 'Items visible across all approved store types.',
    example: 7,
  })
  unscopedItems!: number;
}

export class MerchantMenuScopeUsageDto {
  @ApiProperty({
    description: 'Approved branch store type.',
    type: MenuScopedStoreTypeDto,
  })
  storeType!: MenuScopedStoreTypeDto;

  @ApiProperty({
    description: 'Number of categories explicitly scoped to this store type.',
    example: 2,
  })
  scopedCategoryCount!: number;

  @ApiProperty({
    description: 'Number of items explicitly scoped to this store type.',
    example: 5,
  })
  scopedItemCount!: number;
}

export class MerchantMenuCategoryScopeSummaryDto {
  @ApiProperty({
    description: 'Category identifier.',
    example: 'cat_1',
  })
  categoryId!: string;

  @ApiProperty({
    description: 'Category display name.',
    example: 'Popular',
  })
  name!: string;

  @ApiProperty({
    description: 'Category sort order.',
    example: 0,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Whether the category is active.',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Whether the category is visible to all approved store types or a selected subset.',
    enum: MerchantMenuScopeMode,
  })
  scopeMode!: MerchantMenuScopeMode;

  @ApiProperty({
    description:
      'Selected approved store types when the category is explicitly scoped. Empty means visible across all approved store types.',
    type: MenuScopedStoreTypeDto,
    isArray: true,
  })
  storeTypes!: MenuScopedStoreTypeDto[];

  @ApiProperty({
    description: 'Number of items currently attached to the category.',
    example: 3,
  })
  itemCount!: number;

  @ApiProperty({
    description: 'Number of attached items with explicit store type scopes.',
    example: 2,
  })
  scopedItemCount!: number;

  @ApiProperty({
    description: 'Number of attached items visible across all approved store types.',
    example: 1,
  })
  unscopedItemCount!: number;
}

export class MerchantMenuItemScopeSummaryDto {
  @ApiProperty({
    description: 'Menu item identifier.',
    example: 'item_1',
  })
  itemId!: string;

  @ApiProperty({
    description: 'Optional category identifier.',
    example: 'cat_1',
    nullable: true,
  })
  categoryId!: string | null;

  @ApiProperty({
    description: 'Optional category display name.',
    example: 'Popular',
    nullable: true,
  })
  categoryName!: string | null;

  @ApiProperty({
    description: 'Menu item display name.',
    example: 'Mohinga',
  })
  name!: string;

  @ApiProperty({
    description: 'Menu item sort order.',
    example: 1,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Whether the item is currently available.',
    example: true,
  })
  isAvailable!: boolean;

  @ApiProperty({
    description: 'Whether stock tracking is enabled for the item.',
    example: true,
  })
  isStockTracked!: boolean;

  @ApiProperty({
    description: 'Whether the item is currently in stock.',
    example: true,
  })
  isInStock!: boolean;

  @ApiProperty({
    description: 'Whether the tracked quantity is currently low.',
    example: false,
  })
  isLowStock!: boolean;

  @ApiProperty({
    description: 'Whether the item is visible to all approved store types or a selected subset.',
    enum: MerchantMenuScopeMode,
  })
  scopeMode!: MerchantMenuScopeMode;

  @ApiProperty({
    description:
      'Selected approved store types when the item is explicitly scoped. Empty means visible across all approved store types.',
    type: MenuScopedStoreTypeDto,
    isArray: true,
  })
  storeTypes!: MenuScopedStoreTypeDto[];
}

export class MerchantMenuScopeOverviewDto {
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
    description: 'Branch township for operational context.',
    example: 'Botahtaung',
  })
  township!: string;

  @ApiProperty({
    description: 'Approved active store types that can be used for scoping in this branch.',
    type: MenuScopedStoreTypeDto,
    isArray: true,
  })
  approvedStoreTypes!: MenuScopedStoreTypeDto[];

  @ApiProperty({
    description: 'High-level scope totals across categories and items.',
    type: MerchantMenuScopeTotalsDto,
  })
  totals!: MerchantMenuScopeTotalsDto;

  @ApiProperty({
    description: 'Explicit scope usage counts per approved store type.',
    type: MerchantMenuScopeUsageDto,
    isArray: true,
  })
  storeTypeUsage!: MerchantMenuScopeUsageDto[];

  @ApiProperty({
    description: 'Category-level scope summary rows for merchant management screens.',
    type: MerchantMenuCategoryScopeSummaryDto,
    isArray: true,
  })
  categories!: MerchantMenuCategoryScopeSummaryDto[];

  @ApiProperty({
    description: 'Item-level scope summary rows for merchant management screens.',
    type: MerchantMenuItemScopeSummaryDto,
    isArray: true,
  })
  items!: MerchantMenuItemScopeSummaryDto[];
}

export function toMerchantMenuScopeOverviewDto(
  branchCatalog: BranchCatalogEntity,
): MerchantMenuScopeOverviewDto {
  const approvedStoreTypes = branchCatalog.approvedStoreTypes.map((storeType) => ({
    id: storeType.id,
    code: storeType.code,
    name: storeType.name,
    sortOrder: storeType.sortOrder,
  }));

  const categories = branchCatalog.categories.map((category) => {
    const scopedItemCount = category.items.filter(
      (item) => item.scopedStoreTypes.length > 0,
    ).length;

    return {
      categoryId: category.categoryId,
      name: category.name,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      scopeMode: toScopeMode(category.scopedStoreTypes),
      storeTypes: category.scopedStoreTypes.map((storeType) => ({
        id: storeType.id,
        code: storeType.code,
        name: storeType.name,
        sortOrder: storeType.sortOrder,
      })),
      itemCount: category.items.length,
      scopedItemCount,
      unscopedItemCount: category.items.length - scopedItemCount,
    };
  });

  const items = [
    ...branchCatalog.categories.flatMap((category) =>
      category.items.map((item) => ({
        itemId: item.itemId,
        categoryId: category.categoryId,
        categoryName: category.name,
        name: item.name,
        sortOrder: item.sortOrder,
        isAvailable: item.isAvailable,
        isStockTracked: item.isStockTracked,
        isInStock: item.isInStock,
        isLowStock: item.isLowStock,
        scopeMode: toScopeMode(item.scopedStoreTypes),
        storeTypes: item.scopedStoreTypes.map((storeType) => ({
          id: storeType.id,
          code: storeType.code,
          name: storeType.name,
          sortOrder: storeType.sortOrder,
        })),
      })),
    ),
    ...branchCatalog.uncategorizedItems.map((item) => ({
      itemId: item.itemId,
      categoryId: null,
      categoryName: null,
      name: item.name,
      sortOrder: item.sortOrder,
      isAvailable: item.isAvailable,
      isStockTracked: item.isStockTracked,
      isInStock: item.isInStock,
      isLowStock: item.isLowStock,
      scopeMode: toScopeMode(item.scopedStoreTypes),
      storeTypes: item.scopedStoreTypes.map((storeType) => ({
        id: storeType.id,
        code: storeType.code,
        name: storeType.name,
        sortOrder: storeType.sortOrder,
      })),
    })),
  ];

  const totalCategories = categories.length;
  const scopedCategories = categories.filter(
    (category) => category.scopeMode === MerchantMenuScopeMode.SELECTED_STORE_TYPES,
  ).length;
  const totalItems = items.length;
  const scopedItems = items.filter(
    (item) => item.scopeMode === MerchantMenuScopeMode.SELECTED_STORE_TYPES,
  ).length;

  const storeTypeUsage = approvedStoreTypes.map((storeType) => ({
    storeType,
    scopedCategoryCount: categories.filter((category) =>
      category.storeTypes.some((assignedStoreType) => assignedStoreType.id === storeType.id),
    ).length,
    scopedItemCount: items.filter((item) =>
      item.storeTypes.some((assignedStoreType) => assignedStoreType.id === storeType.id),
    ).length,
  }));

  return {
    branchId: branchCatalog.branchId,
    branchName: branchCatalog.branchName,
    township: branchCatalog.township,
    approvedStoreTypes,
    totals: {
      totalCategories,
      scopedCategories,
      unscopedCategories: totalCategories - scopedCategories,
      totalItems,
      scopedItems,
      unscopedItems: totalItems - scopedItems,
    },
    storeTypeUsage,
    categories,
    items,
  };
}

function toScopeMode(
  storeTypes: Array<{
    id: string;
    code: string;
    name: string;
    sortOrder: number;
  }>,
): MerchantMenuScopeMode {
  return storeTypes.length === 0
    ? MerchantMenuScopeMode.ALL_APPROVED_STORE_TYPES
    : MerchantMenuScopeMode.SELECTED_STORE_TYPES;
}

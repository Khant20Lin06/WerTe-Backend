import {
  BranchStatus,
  BranchStoreTypeStatus,
  ItemOptionGroupKind,
  Prisma,
} from '@prisma/client';

export const branchCatalogInclude = Prisma.validator<Prisma.BranchInclude>()({
  merchant: {
    select: {
      id: true,
      name: true,
      status: true,
      user: {
        select: {
          id: true,
          phone: true,
          role: true,
          status: true,
        },
      },
    },
  },
  storeTypes: {
    where: {
      status: BranchStoreTypeStatus.APPROVED,
      storeType: {
        isActive: true,
        deletedAt: null,
      },
    },
    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      storeType: {
        select: {
          id: true,
          code: true,
          name: true,
          sortOrder: true,
        },
      },
    },
  },
  menuCategories: {
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      storeTypes: {
        include: {
          storeType: {
            select: {
              id: true,
              code: true,
              name: true,
              sortOrder: true,
            },
          },
        },
        orderBy: [{ storeTypeId: 'asc' }],
      },
      menuItems: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          storeTypes: {
            include: {
              storeType: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  sortOrder: true,
                },
              },
            },
            orderBy: [{ storeTypeId: 'asc' }],
          },
          optionGroups: {
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            include: {
              options: {
                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
              },
            },
          },
          variantCombinations: {
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            include: {
              optionLinks: {
                include: {
                  itemOption: {
                    select: {
                      id: true,
                      name: true,
                      sortOrder: true,
                      isActive: true,
                      group: {
                        select: {
                          id: true,
                          name: true,
                          sortOrder: true,
                          isActive: true,
                        },
                      },
                    },
                  },
                },
                orderBy: [{ itemOptionId: 'asc' }],
              },
            },
          },
        },
      },
    },
  },
  menuItems: {
    where: {
      categoryId: null,
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      storeTypes: {
        include: {
          storeType: {
            select: {
              id: true,
              code: true,
              name: true,
              sortOrder: true,
            },
          },
        },
        orderBy: [{ storeTypeId: 'asc' }],
      },
      optionGroups: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          options: {
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          },
        },
      },
      variantCombinations: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          optionLinks: {
            include: {
              itemOption: {
                select: {
                  id: true,
                  name: true,
                  sortOrder: true,
                  isActive: true,
                  group: {
                    select: {
                      id: true,
                      name: true,
                      sortOrder: true,
                      isActive: true,
                    },
                  },
                },
              },
            },
            orderBy: [{ itemOptionId: 'asc' }],
          },
        },
      },
    },
  },
  staffAssignments: {
    select: { staffId: true },
  },
});

export type BranchCatalogRecord = Prisma.BranchGetPayload<{
  include: typeof branchCatalogInclude;
}>;

export class CatalogOptionEntity {
  optionId!: string;
  name!: string;
  priceDelta!: string;
  isStockTracked!: boolean;
  stockQuantity?: number | null;
  lowStockThreshold?: number | null;
  isInStock!: boolean;
  isLowStock!: boolean;
  sortOrder!: number;
  isActive!: boolean;
}

export class CatalogScopedStoreTypeEntity {
  id!: string;
  code!: string;
  name!: string;
  sortOrder!: number;
}

export class CatalogOptionGroupEntity {
  optionGroupId!: string;
  name!: string;
  description?: string | null;
  kind!: ItemOptionGroupKind;
  minSelect!: number;
  maxSelect!: number;
  sortOrder!: number;
  isActive!: boolean;
  options!: CatalogOptionEntity[];
}

export class CatalogVariantCombinationSelectionEntity {
  optionId!: string;
  optionName!: string;
  optionSortOrder!: number;
  optionGroupId!: string;
  optionGroupName!: string;
  optionGroupSortOrder!: number;
}

export class CatalogVariantCombinationEntity {
  combinationId!: string;
  name!: string;
  sku?: string | null;
  isStockTracked!: boolean;
  stockQuantity?: number | null;
  lowStockThreshold?: number | null;
  isInStock!: boolean;
  isLowStock!: boolean;
  sortOrder!: number;
  isActive!: boolean;
  selectedOptions!: CatalogVariantCombinationSelectionEntity[];
}

export class CatalogMenuItemEntity {
  itemId!: string;
  categoryId?: string | null;
  name!: string;
  description?: string | null;
  imageUrl?: string | null;
  imageUrls!: string[];
  sku?: string | null;
  barcode?: string | null;
  brand?: string | null;
  attributes?: Record<string, unknown> | null;
  basePrice!: string;
  isStockTracked!: boolean;
  stockQuantity?: number | null;
  lowStockThreshold?: number | null;
  isInStock!: boolean;
  isLowStock!: boolean;
  sortOrder!: number;
  isAvailable!: boolean;
  averageRating?: number | null;
  reviewCount!: number;
  scopedStoreTypes!: CatalogScopedStoreTypeEntity[];
  optionGroups!: CatalogOptionGroupEntity[];
  variantCombinations!: CatalogVariantCombinationEntity[];
}

export class CatalogMenuCategoryEntity {
  categoryId!: string;
  name!: string;
  description?: string | null;
  sortOrder!: number;
  isActive!: boolean;
  scopedStoreTypes!: CatalogScopedStoreTypeEntity[];
  items!: CatalogMenuItemEntity[];
}

export class BranchCatalogEntity {
  branchId!: string;
  merchantId!: string;
  merchantUserId!: string;
  branchName!: string;
  township!: string;
  branchStatus!: BranchStatus;
  approvedStoreTypes!: CatalogScopedStoreTypeEntity[];
  categories!: CatalogMenuCategoryEntity[];
  uncategorizedItems!: CatalogMenuItemEntity[];
}

type BuildBranchCatalogOptions = {
  activeOnly?: boolean;
  storeTypeCode?: string;
};

export function buildBranchCatalog(
  branch: BranchCatalogRecord,
  options?: BuildBranchCatalogOptions,
): BranchCatalogEntity {
  const activeOnly = options?.activeOnly ?? false;
  const normalizedStoreTypeCode = options?.storeTypeCode?.trim().toLowerCase();

  const buildOption = (
    option: BranchCatalogRecord['menuCategories'][number]['menuItems'][number]['optionGroups'][number]['options'][number],
  ): CatalogOptionEntity => ({
    optionId: option.id,
    name: option.name,
    priceDelta: option.priceDelta.toString(),
    isStockTracked: option.isStockTracked,
    stockQuantity: option.stockQuantity,
    lowStockThreshold: option.lowStockThreshold,
    isInStock: isOptionInStock(option),
    isLowStock: isOptionLowStock(option),
    sortOrder: option.sortOrder,
    isActive: option.isActive,
  });

  const buildOptionGroup = (
    group: BranchCatalogRecord['menuCategories'][number]['menuItems'][number]['optionGroups'][number],
  ): CatalogOptionGroupEntity => ({
    optionGroupId: group.id,
    name: group.name,
    description: group.description,
    kind: group.kind,
    minSelect: group.minSelect,
    maxSelect: group.maxSelect,
    sortOrder: group.sortOrder,
    isActive: group.isActive,
    options: group.options
      .filter((option) => !activeOnly || option.isActive)
      .map((option) => buildOption(option)),
  });

  const buildVariantCombination = (
    combination: BranchCatalogRecord['menuCategories'][number]['menuItems'][number]['variantCombinations'][number],
  ): CatalogVariantCombinationEntity => ({
    combinationId: combination.id,
    name: combination.name,
    sku: combination.sku,
    isStockTracked: combination.isStockTracked,
    stockQuantity: combination.stockQuantity,
    lowStockThreshold: combination.lowStockThreshold,
    isInStock: isVariantCombinationInStock(combination),
    isLowStock: isVariantCombinationLowStock(combination),
    sortOrder: combination.sortOrder,
    isActive: combination.isActive,
    selectedOptions: [...combination.optionLinks]
      .sort(
        (left, right) =>
          left.itemOption.group.sortOrder - right.itemOption.group.sortOrder ||
          left.itemOption.sortOrder - right.itemOption.sortOrder ||
          left.itemOption.id.localeCompare(right.itemOption.id),
      )
      .map((link) => ({
        optionId: link.itemOption.id,
        optionName: link.itemOption.name,
        optionSortOrder: link.itemOption.sortOrder,
        optionGroupId: link.itemOption.group.id,
        optionGroupName: link.itemOption.group.name,
        optionGroupSortOrder: link.itemOption.group.sortOrder,
      })),
  });

  const buildMenuItem = (
    item: BranchCatalogRecord['menuCategories'][number]['menuItems'][number],
  ): CatalogMenuItemEntity => ({
    itemId: item.id,
    categoryId: item.categoryId,
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
    averageRating: null,
    reviewCount: 0,
    scopedStoreTypes: item.storeTypes.map((assignment) => ({
      id: assignment.storeType.id,
      code: assignment.storeType.code,
      name: assignment.storeType.name,
      sortOrder: assignment.storeType.sortOrder,
    })),
    optionGroups: item.optionGroups
      .filter((group) => !activeOnly || group.isActive)
      .map((group) => buildOptionGroup(group)),
    variantCombinations: item.variantCombinations
      .filter((combination) =>
        isVariantCombinationVisible(combination, activeOnly),
      )
      .map((combination) => buildVariantCombination(combination)),
  });

  const categories = branch.menuCategories
    .filter(
      (category) =>
        (!activeOnly || category.isActive) &&
        matchesSelectedStoreType(category.storeTypes, normalizedStoreTypeCode),
    )
    .map((category) => ({
      categoryId: category.id,
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      scopedStoreTypes: category.storeTypes.map((assignment) => ({
        id: assignment.storeType.id,
        code: assignment.storeType.code,
        name: assignment.storeType.name,
        sortOrder: assignment.storeType.sortOrder,
      })),
      items: category.menuItems
        .filter(
          (item) =>
            (!activeOnly || item.isAvailable) &&
            matchesSelectedStoreType(item.storeTypes, normalizedStoreTypeCode),
        )
        .map((item) => buildMenuItem(item)),
    }));

  const uncategorizedItems = branch.menuItems
    .filter(
      (item) =>
        (!activeOnly || item.isAvailable) &&
        matchesSelectedStoreType(item.storeTypes, normalizedStoreTypeCode),
    )
    .map((item) => buildMenuItem(item));

  return {
    branchId: branch.id,
    merchantId: branch.merchant.id,
    merchantUserId: branch.merchant.user.id,
    branchName: branch.name,
    township: branch.township,
    branchStatus: branch.status,
    approvedStoreTypes: branch.storeTypes.map((assignment) => ({
      id: assignment.storeType.id,
      code: assignment.storeType.code,
      name: assignment.storeType.name,
      sortOrder: assignment.storeType.sortOrder,
    })),
    categories,
    uncategorizedItems,
  };
}

function matchesSelectedStoreType(
  storeTypes:
    | BranchCatalogRecord['storeTypes']
    | BranchCatalogRecord['menuCategories'][number]['storeTypes']
    | BranchCatalogRecord['menuItems'][number]['storeTypes'],
  selectedStoreTypeCode?: string,
): boolean {
  if (selectedStoreTypeCode === undefined) {
    return true;
  }

  if (storeTypes.length === 0) {
    return true;
  }

  return storeTypes.some(
    (assignment) =>
      assignment.storeType.code.toLowerCase() === selectedStoreTypeCode,
  );
}

function isInStock(
  item: BranchCatalogRecord['menuCategories'][number]['menuItems'][number],
): boolean {
  if (!item.isStockTracked) {
    return true;
  }

  return (item.stockQuantity ?? 0) > 0;
}

function isLowStock(
  item: BranchCatalogRecord['menuCategories'][number]['menuItems'][number],
): boolean {
  if (!item.isStockTracked || item.stockQuantity === null || item.lowStockThreshold === null) {
    return false;
  }

  return item.stockQuantity <= item.lowStockThreshold;
}

function isVariantCombinationVisible(
  combination:
    BranchCatalogRecord['menuCategories'][number]['menuItems'][number]['variantCombinations'][number],
  activeOnly: boolean,
): boolean {
  if (!activeOnly) {
    return true;
  }

  if (!combination.isActive) {
    return false;
  }

  return combination.optionLinks.every(
    (link) => link.itemOption.isActive && link.itemOption.group.isActive,
  );
}

function isVariantCombinationInStock(
  combination:
    BranchCatalogRecord['menuCategories'][number]['menuItems'][number]['variantCombinations'][number],
): boolean {
  if (!combination.isStockTracked) {
    return true;
  }

  return (combination.stockQuantity ?? 0) > 0;
}

function isVariantCombinationLowStock(
  combination:
    BranchCatalogRecord['menuCategories'][number]['menuItems'][number]['variantCombinations'][number],
): boolean {
  if (
    !combination.isStockTracked ||
    combination.stockQuantity === null ||
    combination.lowStockThreshold === null
  ) {
    return false;
  }

  return combination.stockQuantity <= combination.lowStockThreshold;
}

function isOptionInStock(
  option: BranchCatalogRecord['menuCategories'][number]['menuItems'][number]['optionGroups'][number]['options'][number],
): boolean {
  if (!option.isStockTracked) {
    return true;
  }

  return (option.stockQuantity ?? 0) > 0;
}

function isOptionLowStock(
  option: BranchCatalogRecord['menuCategories'][number]['menuItems'][number]['optionGroups'][number]['options'][number],
): boolean {
  if (
    !option.isStockTracked ||
    option.stockQuantity === null ||
    option.lowStockThreshold === null
  ) {
    return false;
  }

  return option.stockQuantity <= option.lowStockThreshold;
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

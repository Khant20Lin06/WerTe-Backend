import { Prisma, UserRole, UserStatus } from '@prisma/client';

export const menuItemOwnershipInclude =
  Prisma.validator<Prisma.MenuItemInclude>()({
    branch: {
      select: {
        id: true,
        merchantId: true,
        merchant: {
          select: {
            id: true,
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
      },
    },
    category: {
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    },
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
  });

export type MenuItemOwnershipRecord = Prisma.MenuItemGetPayload<{
  include: typeof menuItemOwnershipInclude;
}>;

export class MenuItemOwnershipEntity {
  itemId!: string;
  branchId!: string;
  merchantId!: string;
  merchantUserId!: string;
  phone!: string;
  role!: UserRole;
  userStatus!: UserStatus;
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
  storeTypes!: Array<{
    id: string;
    code: string;
    name: string;
    sortOrder: number;
  }>;
}

export function buildMenuItemOwnership(
  item: MenuItemOwnershipRecord,
): MenuItemOwnershipEntity {
  return {
    itemId: item.id,
    branchId: item.branch.id,
    merchantId: item.branch.merchant.id,
    merchantUserId: item.branch.merchant.user.id,
    phone: item.branch.merchant.user.phone,
    role: item.branch.merchant.user.role,
    userStatus: item.branch.merchant.user.status,
    categoryId: item.category?.id,
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

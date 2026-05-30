import { Prisma, UserRole, UserStatus } from '@prisma/client';

export const itemOptionOwnershipInclude =
  Prisma.validator<Prisma.ItemOptionInclude>()({
    group: {
      include: {
        menuItem: {
          include: {
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
          },
        },
      },
    },
  });

export type ItemOptionOwnershipRecord = Prisma.ItemOptionGetPayload<{
  include: typeof itemOptionOwnershipInclude;
}>;

export class ItemOptionOwnershipEntity {
  optionId!: string;
  optionGroupId!: string;
  menuItemId!: string;
  branchId!: string;
  merchantId!: string;
  merchantUserId!: string;
  phone!: string;
  role!: UserRole;
  userStatus!: UserStatus;
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

export function buildItemOptionOwnership(
  option: ItemOptionOwnershipRecord,
): ItemOptionOwnershipEntity {
  return {
    optionId: option.id,
    optionGroupId: option.group.id,
    menuItemId: option.group.menuItem.id,
    branchId: option.group.menuItem.branch.id,
    merchantId: option.group.menuItem.branch.merchant.id,
    merchantUserId: option.group.menuItem.branch.merchant.user.id,
    phone: option.group.menuItem.branch.merchant.user.phone,
    role: option.group.menuItem.branch.merchant.user.role,
    userStatus: option.group.menuItem.branch.merchant.user.status,
    name: option.name,
    priceDelta: option.priceDelta.toString(),
    isStockTracked: option.isStockTracked,
    stockQuantity: option.stockQuantity,
    lowStockThreshold: option.lowStockThreshold,
    isInStock: isInStock(option),
    isLowStock: isLowStock(option),
    sortOrder: option.sortOrder,
    isActive: option.isActive,
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

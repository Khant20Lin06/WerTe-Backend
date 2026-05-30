import { Prisma, UserRole, UserStatus } from '@prisma/client';

export const menuItemInventoryLotInclude =
  Prisma.validator<Prisma.MenuItemInventoryLotInclude>()({
    menuItem: {
      select: {
        id: true,
        name: true,
        isStockTracked: true,
        stockQuantity: true,
        lowStockThreshold: true,
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
  });

export type MenuItemInventoryLotRecord = Prisma.MenuItemInventoryLotGetPayload<{
  include: typeof menuItemInventoryLotInclude;
}>;

export class MenuItemInventoryLotEntity {
  lotId!: string;
  menuItemId!: string;
  menuItemName!: string;
  branchId!: string;
  merchantId!: string;
  merchantUserId!: string;
  phone!: string;
  role!: UserRole;
  userStatus!: UserStatus;
  batchNo!: string;
  expiryDate!: string | null;
  receivedAt!: string;
  receivedQuantity!: number;
  remainingQuantity!: number;
  note!: string | null;
  isExpired!: boolean;
  isDepleted!: boolean;
  createdAt!: string;
  updatedAt!: string;
}

export function buildMenuItemInventoryLot(
  lot: MenuItemInventoryLotRecord,
): MenuItemInventoryLotEntity {
  return {
    lotId: lot.id,
    menuItemId: lot.menuItem.id,
    menuItemName: lot.menuItem.name,
    branchId: lot.menuItem.branch.id,
    merchantId: lot.menuItem.branch.merchant.id,
    merchantUserId: lot.menuItem.branch.merchant.user.id,
    phone: lot.menuItem.branch.merchant.user.phone,
    role: lot.menuItem.branch.merchant.user.role,
    userStatus: lot.menuItem.branch.merchant.user.status,
    batchNo: lot.batchNo,
    expiryDate: lot.expiryDate?.toISOString() ?? null,
    receivedAt: lot.receivedAt.toISOString(),
    receivedQuantity: lot.receivedQuantity,
    remainingQuantity: lot.remainingQuantity,
    note: lot.note ?? null,
    isExpired:
      lot.expiryDate !== null && lot.expiryDate.getTime() < Date.now(),
    isDepleted: lot.remainingQuantity <= 0,
    createdAt: lot.createdAt.toISOString(),
    updatedAt: lot.updatedAt.toISOString(),
  };
}

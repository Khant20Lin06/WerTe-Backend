import { ItemOptionGroupKind, Prisma, UserRole, UserStatus } from '@prisma/client';

export const itemOptionGroupOwnershipInclude =
  Prisma.validator<Prisma.ItemOptionGroupInclude>()({
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
  });

export type ItemOptionGroupOwnershipRecord =
  Prisma.ItemOptionGroupGetPayload<{
    include: typeof itemOptionGroupOwnershipInclude;
  }>;

export class ItemOptionGroupOwnershipEntity {
  optionGroupId!: string;
  menuItemId!: string;
  branchId!: string;
  merchantId!: string;
  merchantUserId!: string;
  phone!: string;
  role!: UserRole;
  userStatus!: UserStatus;
  name!: string;
  description?: string | null;
  kind!: ItemOptionGroupKind;
  minSelect!: number;
  maxSelect!: number;
  sortOrder!: number;
  isActive!: boolean;
}

export function buildItemOptionGroupOwnership(
  group: ItemOptionGroupOwnershipRecord,
): ItemOptionGroupOwnershipEntity {
  return {
    optionGroupId: group.id,
    menuItemId: group.menuItem.id,
    branchId: group.menuItem.branch.id,
    merchantId: group.menuItem.branch.merchant.id,
    merchantUserId: group.menuItem.branch.merchant.user.id,
    phone: group.menuItem.branch.merchant.user.phone,
    role: group.menuItem.branch.merchant.user.role,
    userStatus: group.menuItem.branch.merchant.user.status,
    name: group.name,
    description: group.description,
    kind: group.kind,
    minSelect: group.minSelect,
    maxSelect: group.maxSelect,
    sortOrder: group.sortOrder,
    isActive: group.isActive,
  };
}

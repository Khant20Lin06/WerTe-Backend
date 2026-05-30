import { Prisma, UserRole, UserStatus } from '@prisma/client';

export const menuCategoryOwnershipInclude =
  Prisma.validator<Prisma.MenuCategoryInclude>()({
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

export type MenuCategoryOwnershipRecord = Prisma.MenuCategoryGetPayload<{
  include: typeof menuCategoryOwnershipInclude;
}>;

export class MenuCategoryOwnershipEntity {
  categoryId!: string;
  branchId!: string;
  merchantId!: string;
  merchantUserId!: string;
  phone!: string;
  role!: UserRole;
  userStatus!: UserStatus;
  name!: string;
  description?: string | null;
  sortOrder!: number;
  isActive!: boolean;
  storeTypes!: Array<{
    id: string;
    code: string;
    name: string;
    sortOrder: number;
  }>;
}

export function buildMenuCategoryOwnership(
  category: MenuCategoryOwnershipRecord,
): MenuCategoryOwnershipEntity {
  return {
    categoryId: category.id,
    branchId: category.branch.id,
    merchantId: category.branch.merchant.id,
    merchantUserId: category.branch.merchant.user.id,
    phone: category.branch.merchant.user.phone,
    role: category.branch.merchant.user.role,
    userStatus: category.branch.merchant.user.status,
    name: category.name,
    description: category.description,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    storeTypes: category.storeTypes.map((assignment) => ({
      id: assignment.storeType.id,
      code: assignment.storeType.code,
      name: assignment.storeType.name,
      sortOrder: assignment.storeType.sortOrder,
    })),
  };
}

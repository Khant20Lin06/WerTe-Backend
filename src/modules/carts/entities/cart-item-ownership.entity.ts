import {
  BranchStatus,
  CartStatus,
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';

export const cartItemOwnershipInclude = Prisma.validator<Prisma.CartItemInclude>()({
  cart: {
    select: {
      id: true,
      customerProfileId: true,
      branchId: true,
      status: true,
      customerProfile: {
        select: {
          id: true,
          userId: true,
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
      branch: {
        select: {
          id: true,
          merchantId: true,
          status: true,
          merchant: {
            select: {
              id: true,
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
        },
      },
    },
  },
  menuItem: {
    select: {
      id: true,
      branchId: true,
      categoryId: true,
      name: true,
      basePrice: true,
      isAvailable: true,
      branch: {
        select: {
          id: true,
          merchantId: true,
          status: true,
          merchant: {
            select: {
              id: true,
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
        },
      },
    },
  },
});

export type CartItemOwnershipRecord = Prisma.CartItemGetPayload<{
  include: typeof cartItemOwnershipInclude;
}>;

export class CartItemOwnershipEntity {
  cartItemId!: string;
  cartId!: string;
  customerProfileId!: string;
  userId!: string;
  phone!: string;
  role!: UserRole;
  userStatus!: UserStatus;
  branchId!: string;
  cartStatus!: CartStatus;
  branchStatus!: BranchStatus;
  merchantId!: string;
  merchantStatus!: MerchantStatus;
  menuItemId!: string;
  menuItemBranchId!: string;
  menuItemCategoryId?: string | null;
  menuItemName!: string;
  menuItemBasePrice!: string;
  menuItemIsAvailable!: boolean;
  quantity!: number;
  unitPriceSnapshot!: string;
  lineTotal!: string;
}

export function buildCartItemOwnership(
  cartItem: CartItemOwnershipRecord,
): CartItemOwnershipEntity {
  return {
    cartItemId: cartItem.id,
    cartId: cartItem.cart.id,
    customerProfileId: cartItem.cart.customerProfile.id,
    userId: cartItem.cart.customerProfile.user.id,
    phone: cartItem.cart.customerProfile.user.phone,
    role: cartItem.cart.customerProfile.user.role,
    userStatus: cartItem.cart.customerProfile.user.status,
    branchId: cartItem.cart.branch.id,
    cartStatus: cartItem.cart.status,
    branchStatus: cartItem.cart.branch.status,
    merchantId: cartItem.cart.branch.merchant.id,
    merchantStatus: cartItem.cart.branch.merchant.status,
    menuItemId: cartItem.menuItem.id,
    menuItemBranchId: cartItem.menuItem.branch.id,
    menuItemCategoryId: cartItem.menuItem.categoryId,
    menuItemName: cartItem.menuItem.name,
    menuItemBasePrice: cartItem.menuItem.basePrice.toString(),
    menuItemIsAvailable: cartItem.menuItem.isAvailable,
    quantity: cartItem.quantity,
    unitPriceSnapshot: cartItem.unitPriceSnapshot.toString(),
    lineTotal: cartItem.lineTotal.toString(),
  };
}

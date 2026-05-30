import {
  BranchStatus,
  CartStatus,
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';

export const cartItemOptionOwnershipInclude =
  Prisma.validator<Prisma.CartItemOptionInclude>()({
    cartItem: {
      select: {
        id: true,
        cartId: true,
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
      },
    },
    itemOption: {
      select: {
        id: true,
        name: true,
        isActive: true,
        group: {
          select: {
            id: true,
            name: true,
            isActive: true,
            menuItem: {
              select: {
                id: true,
                branchId: true,
                name: true,
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
          },
        },
      },
    },
  });

export type CartItemOptionOwnershipRecord = Prisma.CartItemOptionGetPayload<{
  include: typeof cartItemOptionOwnershipInclude;
}>;

export class CartItemOptionOwnershipEntity {
  cartItemOptionId!: string;
  cartItemId!: string;
  cartId!: string;
  customerProfileId!: string;
  userId!: string;
  phone!: string;
  role!: UserRole;
  userStatus!: UserStatus;
  branchId!: string;
  merchantId!: string;
  merchantStatus!: MerchantStatus;
  branchStatus!: BranchStatus;
  cartStatus!: CartStatus;
  itemOptionId!: string;
  itemOptionName!: string;
  itemOptionIsActive!: boolean;
  optionGroupId!: string;
  optionGroupName!: string;
  optionGroupIsActive!: boolean;
  menuItemId!: string;
  menuItemName!: string;
  menuItemIsAvailable!: boolean;
  nameSnapshot!: string;
  priceDeltaSnapshot!: string;
}

export function buildCartItemOptionOwnership(
  cartItemOption: CartItemOptionOwnershipRecord,
): CartItemOptionOwnershipEntity {
  return {
    cartItemOptionId: cartItemOption.id,
    cartItemId: cartItemOption.cartItem.id,
    cartId: cartItemOption.cartItem.cart.id,
    customerProfileId: cartItemOption.cartItem.cart.customerProfile.id,
    userId: cartItemOption.cartItem.cart.customerProfile.user.id,
    phone: cartItemOption.cartItem.cart.customerProfile.user.phone,
    role: cartItemOption.cartItem.cart.customerProfile.user.role,
    userStatus: cartItemOption.cartItem.cart.customerProfile.user.status,
    branchId: cartItemOption.cartItem.cart.branch.id,
    merchantId: cartItemOption.cartItem.cart.branch.merchant.id,
    merchantStatus: cartItemOption.cartItem.cart.branch.merchant.status,
    branchStatus: cartItemOption.cartItem.cart.branch.status,
    cartStatus: cartItemOption.cartItem.cart.status,
    itemOptionId: cartItemOption.itemOption.id,
    itemOptionName: cartItemOption.itemOption.name,
    itemOptionIsActive: cartItemOption.itemOption.isActive,
    optionGroupId: cartItemOption.itemOption.group.id,
    optionGroupName: cartItemOption.itemOption.group.name,
    optionGroupIsActive: cartItemOption.itemOption.group.isActive,
    menuItemId: cartItemOption.itemOption.group.menuItem.id,
    menuItemName: cartItemOption.itemOption.group.menuItem.name,
    menuItemIsAvailable: cartItemOption.itemOption.group.menuItem.isAvailable,
    nameSnapshot: cartItemOption.nameSnapshot,
    priceDeltaSnapshot: cartItemOption.priceDeltaSnapshot.toString(),
  };
}

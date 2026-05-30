import {
  BranchStatus,
  CartStatus,
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';

export const cartOwnershipInclude = Prisma.validator<Prisma.CartInclude>()({
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
});

export type CartOwnershipRecord = Prisma.CartGetPayload<{
  include: typeof cartOwnershipInclude;
}>;

export class CartOwnershipEntity {
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
  status!: CartStatus;
  totalQuantity!: number;
  subtotalAmount!: string;
  totalAmount!: string;
}

export function buildCartOwnership(cart: CartOwnershipRecord): CartOwnershipEntity {
  return {
    cartId: cart.id,
    customerProfileId: cart.customerProfile.id,
    userId: cart.customerProfile.user.id,
    phone: cart.customerProfile.user.phone,
    role: cart.customerProfile.user.role,
    userStatus: cart.customerProfile.user.status,
    branchId: cart.branch.id,
    merchantId: cart.branch.merchant.id,
    merchantStatus: cart.branch.merchant.status,
    branchStatus: cart.branch.status,
    status: cart.status,
    totalQuantity: cart.totalQuantity,
    subtotalAmount: cart.subtotalAmount.toString(),
    totalAmount: cart.totalAmount.toString(),
  };
}

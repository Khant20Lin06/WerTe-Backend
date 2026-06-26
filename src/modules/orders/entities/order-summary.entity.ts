import {
  BranchStatus,
  DeliveryType,
  MerchantStatus,
  OrderStatus,
  Prisma,
  RiderStatus,
  UserStatus,
} from '@prisma/client';

import {
  AppliedPromotionEntity,
  buildAppliedPromotionEntityFromSnapshot,
} from '../../promotions/entities/applied-promotion.entity';

export const orderSummaryInclude = Prisma.validator<Prisma.OrderInclude>()({
  customerProfile: {
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      user: {
        select: {
          id: true,
          phone: true,
          status: true,
        },
      },
    },
  },
  items: {
    select: {
      id: true,
      nameSnapshot: true,
      quantity: true,
      unitPriceSnapshot: true,
    },
  },
  branch: {
    select: {
      id: true,
      name: true,
      status: true,
      township: true,
      merchant: {
        select: {
          id: true,
          userId: true,
          name: true,
          status: true,
        },
      },
    },
  },
  delivery: {
    select: {
      id: true,
      riderId: true,
      etaMinutes: true,
      rider: {
        select: {
          id: true,
          userId: true,
          displayName: true,
          vehicleType: true,
          currentTownship: true,
          status: true,
          user: {
            select: {
              id: true,
              phone: true,
              status: true,
            },
          },
        },
      },
    },
  },
});

export type OrderSummaryRecord = Prisma.OrderGetPayload<{
  include: typeof orderSummaryInclude;
}>;

export class OrderSummaryItemEntity {
  orderItemId!: string;
  name!: string;
  quantity!: number;
  unitPrice!: string;
}

export class OrderSummaryCustomerEntity {
  customerProfileId!: string;
  userId!: string;
  phone!: string;
  userStatus!: UserStatus;
  fullName!: string | null;
  avatarUrl!: string | null;
}

export class OrderSummaryBranchEntity {
  branchId!: string;
  branchName!: string;
  branchStatus!: BranchStatus;
  township!: string;
  merchantId!: string;
  merchantUserId!: string;
  merchantName!: string;
  merchantStatus!: MerchantStatus;
}

export class OrderSummaryRiderEntity {
  riderId!: string;
  userId!: string;
  phone!: string;
  userStatus!: UserStatus;
  displayName!: string;
  vehicleType!: string;
  currentTownship!: string | null;
  status!: RiderStatus;
}

export class OrderSummaryDeliveryEntity {
  deliveryId!: string;
  riderId!: string | null;
  etaMinutes!: number | null;
  rider!: OrderSummaryRiderEntity | null;
}

export class OrderSummaryEntity {
  orderId!: string;
  orderCode!: string;
  customerProfileId!: string;
  branchId!: string;
  addressId!: string | null;
  cartId!: string | null;
  status!: OrderStatus;
  deliveryType!: DeliveryType;
  currencyCode!: string;
  appliedPromotion?: AppliedPromotionEntity | null;
  subtotalAmount!: string;
  discountAmount!: string;
  deliveryFee!: string;
  totalAmount!: string;
  placedAt!: string;
  updatedAt!: string;
  availableActions!: string[];
  summaryItems?: OrderSummaryItemEntity[];
  customer!: OrderSummaryCustomerEntity;
  branch!: OrderSummaryBranchEntity;
  delivery!: OrderSummaryDeliveryEntity | null;
}

export function buildOrderSummary(order: OrderSummaryRecord): OrderSummaryEntity {
  return {
    orderId: order.id,
    orderCode: order.orderCode,
    customerProfileId: order.customerProfileId,
    branchId: order.branchId,
    addressId: order.addressId,
    cartId: order.cartId,
    status: order.status,
    deliveryType: order.deliveryType,
    currencyCode: order.currencyCode,
    appliedPromotion: buildAppliedPromotionEntityFromSnapshot({
      promotionId: order.promotionId,
      promotionCodeSnapshot: order.promotionCodeSnapshot,
      promotionNameSnapshot: order.promotionNameSnapshot,
      promotionDiscountTypeSnapshot: order.promotionDiscountTypeSnapshot,
      discountAmount: order.discountAmount,
    }),
    subtotalAmount: order.subtotalAmount.toString(),
    discountAmount: order.discountAmount.toString(),
    deliveryFee: order.deliveryFee.toString(),
    totalAmount: order.totalAmount.toString(),
    placedAt: order.placedAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    availableActions: [],
    summaryItems: order.items.map((i) => ({
      orderItemId: i.id,
      name: i.nameSnapshot,
      quantity: i.quantity,
      unitPrice: i.unitPriceSnapshot.toString(),
    })),
    customer: {
      customerProfileId: order.customerProfile.id,
      userId: order.customerProfile.user.id,
      phone: order.customerProfile.user.phone,
      userStatus: order.customerProfile.user.status,
      fullName: order.customerProfile.fullName,
      avatarUrl: order.customerProfile.avatarUrl,
    },
    branch: {
      branchId: order.branch.id,
      branchName: order.branch.name,
      branchStatus: order.branch.status,
      township: order.branch.township,
      merchantId: order.branch.merchant.id,
      merchantUserId: order.branch.merchant.userId,
      merchantName: order.branch.merchant.name,
      merchantStatus: order.branch.merchant.status,
    },
    delivery:
      order.delivery === null
        ? null
        : {
            deliveryId: order.delivery.id,
            riderId: order.delivery.riderId,
            etaMinutes: order.delivery.etaMinutes,
            rider:
              order.delivery.rider === null
                ? null
                : {
                    riderId: order.delivery.rider.id,
                    userId: order.delivery.rider.user.id,
                    phone: order.delivery.rider.user.phone,
                    userStatus: order.delivery.rider.user.status,
                    displayName: order.delivery.rider.displayName,
                    vehicleType: order.delivery.rider.vehicleType,
                    currentTownship: order.delivery.rider.currentTownship,
                    status: order.delivery.rider.status,
                  },
          },
  };
}

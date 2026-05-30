import { ConversationType, OrderStatus, Prisma } from '@prisma/client';

export const conversationOrderContextSelect =
  Prisma.validator<Prisma.OrderSelect>()({
    id: true,
    orderCode: true,
    status: true,
    customerProfile: {
      select: {
        id: true,
        userId: true,
      },
    },
    branch: {
      select: {
        name: true,
        merchant: {
          select: {
            id: true,
            userId: true,
            name: true,
          },
        },
      },
    },
    delivery: {
      select: {
        rider: {
          select: {
            id: true,
            userId: true,
            displayName: true,
          },
        },
      },
    },
  });

export type ConversationOrderContextRecord = Prisma.OrderGetPayload<{
  select: typeof conversationOrderContextSelect;
}>;

export class ConversationOrderContextEntity {
  orderId!: string;
  orderCode!: string;
  status!: OrderStatus;
  customer!: {
    customerProfileId: string;
    userId: string;
  };
  merchant!: {
    merchantId: string;
    userId: string;
    merchantName: string;
  };
  branch!: {
    branchName: string;
  };
  rider!: {
    riderId: string;
    userId: string;
    displayName: string;
  } | null;
}

export function buildConversationOrderContext(
  record: ConversationOrderContextRecord,
): ConversationOrderContextEntity {
  return {
    orderId: record.id,
    orderCode: record.orderCode,
    status: record.status,
    customer: {
      customerProfileId: record.customerProfile.id,
      userId: record.customerProfile.userId,
    },
    merchant: {
      merchantId: record.branch.merchant.id,
      userId: record.branch.merchant.userId,
      merchantName: record.branch.merchant.name,
    },
    branch: {
      branchName: record.branch.name,
    },
    rider:
      record.delivery?.rider === null || record.delivery?.rider === undefined
        ? null
        : {
            riderId: record.delivery.rider.id,
            userId: record.delivery.rider.userId,
            displayName: record.delivery.rider.displayName,
          },
  };
}

export function supportsAssignedRiderConversation(
  type: ConversationType,
): boolean {
  return (
    type === ConversationType.ORDER_CHAT ||
    type === ConversationType.CUSTOMER_RIDER ||
    type === ConversationType.MERCHANT_RIDER ||
    type === ConversationType.RIDER_OPERATIONS
  );
}

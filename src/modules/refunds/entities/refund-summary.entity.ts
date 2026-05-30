import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  RefundStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

export const refundSummaryInclude =
  Prisma.validator<Prisma.RefundInclude>()({
    payment: {
      select: {
        id: true,
        customerProfileId: true,
        method: true,
        provider: true,
        status: true,
        amount: true,
        refundedAmount: true,
        currencyCode: true,
        providerReference: true,
        providerReceiptId: true,
      },
    },
    order: {
      select: {
        id: true,
        orderCode: true,
        status: true,
        customerProfileId: true,
        totalAmount: true,
        currencyCode: true,
      },
    },
    createdByUser: {
      select: {
        id: true,
        role: true,
        phone: true,
        status: true,
      },
    },
  });

export type RefundSummaryRecord = Prisma.RefundGetPayload<{
  include: typeof refundSummaryInclude;
}>;

export class RefundSummaryPaymentEntity {
  paymentId!: string;
  customerProfileId!: string;
  method!: PaymentMethod;
  provider!: PaymentProvider;
  status!: PaymentStatus;
  amount!: string;
  refundedAmount!: string;
  currencyCode!: string;
  providerReference!: string | null;
  providerReceiptId!: string | null;
}

export class RefundSummaryOrderEntity {
  orderId!: string;
  orderCode!: string;
  status!: string;
  customerProfileId!: string;
  totalAmount!: string;
  currencyCode!: string;
}

export class RefundSummaryCreatedByUserEntity {
  userId!: string;
  role!: UserRole;
  phone!: string;
  status!: UserStatus;
}

export class RefundSummaryEntity {
  refundId!: string;
  paymentId!: string;
  orderId!: string;
  createdByUserId!: string | null;
  status!: RefundStatus;
  amount!: string;
  currencyCode!: string;
  idempotencyKey!: string | null;
  providerReference!: string | null;
  reasonCode!: string | null;
  note!: string | null;
  failureCode!: string | null;
  failureMessage!: string | null;
  metadata!: Prisma.JsonValue | null;
  requestedAt!: string;
  succeededAt!: string | null;
  failedAt!: string | null;
  cancelledAt!: string | null;
  createdAt!: string;
  updatedAt!: string;
  payment!: RefundSummaryPaymentEntity;
  order!: RefundSummaryOrderEntity;
  createdByUser!: RefundSummaryCreatedByUserEntity | null;
}

export function buildRefundSummaryEntity(
  refund: RefundSummaryRecord,
): RefundSummaryEntity {
  return {
    refundId: refund.id,
    paymentId: refund.paymentId,
    orderId: refund.orderId,
    createdByUserId: refund.createdByUserId ?? null,
    status: refund.status,
    amount: refund.amount.toString(),
    currencyCode: refund.currencyCode,
    idempotencyKey: refund.idempotencyKey ?? null,
    providerReference: refund.providerReference ?? null,
    reasonCode: refund.reasonCode ?? null,
    note: refund.note ?? null,
    failureCode: refund.failureCode ?? null,
    failureMessage: refund.failureMessage ?? null,
    metadata: (refund.metadataJson as Prisma.JsonValue | null) ?? null,
    requestedAt: refund.requestedAt.toISOString(),
    succeededAt: refund.succeededAt?.toISOString() ?? null,
    failedAt: refund.failedAt?.toISOString() ?? null,
    cancelledAt: refund.cancelledAt?.toISOString() ?? null,
    createdAt: refund.createdAt.toISOString(),
    updatedAt: refund.updatedAt.toISOString(),
    payment: {
      paymentId: refund.payment.id,
      customerProfileId: refund.payment.customerProfileId,
      method: refund.payment.method,
      provider: refund.payment.provider,
      status: refund.payment.status,
      amount: refund.payment.amount.toString(),
      refundedAmount: refund.payment.refundedAmount.toString(),
      currencyCode: refund.payment.currencyCode,
      providerReference: refund.payment.providerReference ?? null,
      providerReceiptId: refund.payment.providerReceiptId ?? null,
    },
    order: {
      orderId: refund.order.id,
      orderCode: refund.order.orderCode,
      status: refund.order.status,
      customerProfileId: refund.order.customerProfileId,
      totalAmount: refund.order.totalAmount.toString(),
      currencyCode: refund.order.currencyCode,
    },
    createdByUser:
      refund.createdByUser === null
        ? null
        : {
            userId: refund.createdByUser.id,
            role: refund.createdByUser.role,
            phone: refund.createdByUser.phone,
            status: refund.createdByUser.status,
          },
  };
}

import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from '@prisma/client';

export const checkoutPaymentIntentSelect =
  Prisma.validator<Prisma.PaymentSelect>()({
    id: true,
    orderId: true,
    customerProfileId: true,
    method: true,
    provider: true,
    status: true,
    amount: true,
    currencyCode: true,
    idempotencyKey: true,
    providerReference: true,
    providerReceiptId: true,
    failureCode: true,
    failureMessage: true,
    requiresActionAt: true,
    succeededAt: true,
    failedAt: true,
    cancelledAt: true,
    expiredAt: true,
    createdAt: true,
    updatedAt: true,
  });

export type CheckoutPaymentIntentRecord = Prisma.PaymentGetPayload<{
  select: typeof checkoutPaymentIntentSelect;
}>;

export class CheckoutPaymentIntentEntity {
  paymentId!: string;
  orderId!: string;
  customerProfileId!: string;
  method!: PaymentMethod;
  provider!: PaymentProvider;
  status!: PaymentStatus;
  amount!: string;
  currencyCode!: string;
  idempotencyKey!: string | null;
  providerReference!: string | null;
  providerReceiptId!: string | null;
  failureCode!: string | null;
  failureMessage!: string | null;
  requiresActionAt!: string | null;
  succeededAt!: string | null;
  failedAt!: string | null;
  cancelledAt!: string | null;
  expiredAt!: string | null;
  requiresCustomerAction!: boolean;
  createdAt!: string;
  updatedAt!: string;
}

export function buildCheckoutPaymentIntentEntity(
  payment: CheckoutPaymentIntentRecord,
): CheckoutPaymentIntentEntity {
  return {
    paymentId: payment.id,
    orderId: payment.orderId,
    customerProfileId: payment.customerProfileId,
    method: payment.method,
    provider: payment.provider,
    status: payment.status,
    amount: payment.amount.toString(),
    currencyCode: payment.currencyCode,
    idempotencyKey: payment.idempotencyKey ?? null,
    providerReference: payment.providerReference ?? null,
    providerReceiptId: payment.providerReceiptId ?? null,
    failureCode: payment.failureCode ?? null,
    failureMessage: payment.failureMessage ?? null,
    requiresActionAt: payment.requiresActionAt?.toISOString() ?? null,
    succeededAt: payment.succeededAt?.toISOString() ?? null,
    failedAt: payment.failedAt?.toISOString() ?? null,
    cancelledAt: payment.cancelledAt?.toISOString() ?? null,
    expiredAt: payment.expiredAt?.toISOString() ?? null,
    requiresCustomerAction: payment.status === PaymentStatus.REQUIRES_ACTION,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

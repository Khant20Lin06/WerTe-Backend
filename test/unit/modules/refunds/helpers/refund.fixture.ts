import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  RefundStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { RefundAttemptEntity } from '../../../../../src/modules/refunds/entities/refund-attempt.entity';
import { RefundDetailEntity } from '../../../../../src/modules/refunds/entities/refund-detail.entity';
import { RefundSummaryEntity } from '../../../../../src/modules/refunds/entities/refund-summary.entity';

export function makeRefundSummary(
  overrides?: Partial<RefundSummaryEntity>,
): RefundSummaryEntity {
  return {
    refundId: 'refund_1',
    paymentId: 'payment_1',
    orderId: 'order_1',
    createdByUserId: 'usr_admin_1',
    status: RefundStatus.SUCCEEDED,
    amount: '1500',
    currencyCode: 'MMK',
    idempotencyKey: 'refund-idem-1',
    providerReference: 'refund_ref_1',
    reasonCode: 'customer_support',
    note: 'Goodwill refund',
    failureCode: null,
    failureMessage: null,
    metadata: null,
    requestedAt: '2026-04-24T09:00:00.000Z',
    succeededAt: '2026-04-24T09:10:00.000Z',
    failedAt: null,
    cancelledAt: null,
    createdAt: '2026-04-24T09:00:00.000Z',
    updatedAt: '2026-04-24T09:10:00.000Z',
    payment: {
      paymentId: 'payment_1',
      customerProfileId: 'cust_prof_1',
      method: PaymentMethod.CARD,
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PARTIALLY_REFUNDED,
      amount: '6500',
      refundedAmount: '1500',
      currencyCode: 'MMK',
      providerReference: 'pi_123',
      providerReceiptId: 'receipt_123',
    },
    order: {
      orderId: 'order_1',
      orderCode: 'ORD-001',
      status: 'DELIVERED',
      customerProfileId: 'cust_prof_1',
      totalAmount: '6500',
      currencyCode: 'MMK',
    },
    createdByUser: {
      userId: 'usr_admin_1',
      role: UserRole.ADMIN,
      phone: '099999999',
      status: UserStatus.ACTIVE,
    },
    ...overrides,
  };
}

export function makeRefundAttempt(
  overrides?: Partial<RefundAttemptEntity>,
): RefundAttemptEntity {
  return {
    refundAttemptId: 'refund_attempt_1',
    refundId: 'refund_1',
    provider: PaymentProvider.STRIPE,
    status: RefundStatus.SUCCEEDED,
    providerReference: 'refund_ref_1',
    requestPayload: null,
    responsePayload: null,
    failureCode: null,
    failureMessage: null,
    attemptedAt: '2026-04-24T09:10:00.000Z',
    createdAt: '2026-04-24T09:10:00.000Z',
    updatedAt: '2026-04-24T09:10:00.000Z',
    ...overrides,
  };
}

export function makeRefundDetail(
  overrides?: Partial<RefundDetailEntity>,
): RefundDetailEntity {
  return {
    ...makeRefundSummary(),
    attempts: [makeRefundAttempt()],
    ...overrides,
  };
}

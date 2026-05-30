import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  RefundStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { PaymentAttemptEntity } from '../../../../../src/modules/payments/entities/payment-attempt.entity';
import { PaymentDetailEntity } from '../../../../../src/modules/payments/entities/payment-detail.entity';
import {
  PaymentSummaryEntity,
  PaymentSummaryRefundEntity,
} from '../../../../../src/modules/payments/entities/payment-summary.entity';

export function makePaymentRelatedRefund(
  overrides?: Partial<PaymentSummaryRefundEntity>,
): PaymentSummaryRefundEntity {
  return {
    refundId: 'refund_1',
    status: RefundStatus.SUCCEEDED,
    amount: '1500',
    currencyCode: 'MMK',
    providerReference: 'refund_ref_1',
    reasonCode: 'customer_support',
    note: 'Goodwill refund',
    requestedAt: '2026-04-24T09:00:00.000Z',
    succeededAt: '2026-04-24T09:10:00.000Z',
    failedAt: null,
    cancelledAt: null,
    createdByUserId: 'usr_admin_1',
    createdByUserRole: UserRole.ADMIN,
    createdByUserPhone: '099999999',
    ...overrides,
  };
}

export function makePaymentSummary(
  overrides?: Partial<PaymentSummaryEntity>,
): PaymentSummaryEntity {
  return {
    paymentId: 'payment_1',
    orderId: 'order_1',
    customerProfileId: 'cust_prof_1',
    method: PaymentMethod.CARD,
    provider: PaymentProvider.STRIPE,
    status: PaymentStatus.SUCCEEDED,
    amount: '6500',
    refundedAmount: '1500',
    currencyCode: 'MMK',
    idempotencyKey: 'payment-idem-1',
    providerReference: 'pi_123',
    providerReceiptId: 'receipt_123',
    failureCode: null,
    failureMessage: null,
    metadata: null,
    requiresActionAt: null,
    succeededAt: '2026-04-24T08:10:00.000Z',
    failedAt: null,
    cancelledAt: null,
    expiredAt: null,
    createdAt: '2026-04-24T08:00:00.000Z',
    updatedAt: '2026-04-24T08:10:00.000Z',
    customer: {
      customerProfileId: 'cust_prof_1',
      userId: 'usr_customer_1',
      phone: '09123456789',
      userStatus: UserStatus.ACTIVE,
      fullName: 'Mg Mg',
      avatarUrl: null,
    },
    order: {
      orderId: 'order_1',
      orderCode: 'ORD-001',
      status: 'PLACED',
      totalAmount: '6500',
      currencyCode: 'MMK',
      placedAt: '2026-04-24T08:00:00.000Z',
      branchId: 'branch_1',
      branchName: 'Downtown Branch',
      merchantId: 'merchant_1',
      merchantUserId: 'usr_merchant_1',
      merchantName: 'Demo Merchant',
    },
    refunds: [makePaymentRelatedRefund()],
    ...overrides,
  };
}

export function makePaymentAttempt(
  overrides?: Partial<PaymentAttemptEntity>,
): PaymentAttemptEntity {
  return {
    paymentAttemptId: 'payment_attempt_1',
    paymentId: 'payment_1',
    provider: PaymentProvider.STRIPE,
    status: PaymentStatus.SUCCEEDED,
    providerReference: 'pi_123',
    requestPayload: null,
    responsePayload: null,
    failureCode: null,
    failureMessage: null,
    attemptedAt: '2026-04-24T08:10:00.000Z',
    createdAt: '2026-04-24T08:10:00.000Z',
    updatedAt: '2026-04-24T08:10:00.000Z',
    ...overrides,
  };
}

export function makePaymentDetail(
  overrides?: Partial<PaymentDetailEntity>,
): PaymentDetailEntity {
  return {
    ...makePaymentSummary(),
    attempts: [makePaymentAttempt()],
    ...overrides,
  };
}

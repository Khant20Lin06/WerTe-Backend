import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  RefundStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { RefundsRepository } from '../../../../src/modules/refunds/repositories/refunds.repository';
import { RefundsService } from '../../../../src/modules/refunds/services/refunds.service';

describe('RefundsService', () => {
  let service: RefundsService;
  let repository: jest.Mocked<RefundsRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findOrderRefund: jest.fn(),
      findCustomerRefund: jest.fn(),
      findOrderRefunds: jest.fn(),
      findCustomerOrderRefunds: jest.fn(),
      findPaymentRefunds: jest.fn(),
      findRefundAttempts: jest.fn(),
    } as unknown as jest.Mocked<RefundsRepository>;

    service = new RefundsService(repository);
  });

  it('maps order refunds into refund summary entities', async () => {
    repository.findOrderRefunds.mockResolvedValue([
      {
        id: 'refund-1',
        paymentId: 'payment-1',
        orderId: 'order-1',
        createdByUserId: 'admin-1',
        status: RefundStatus.PROCESSING,
        amount: { toString: () => '1500' },
        currencyCode: 'MMK',
        idempotencyKey: 'refund-idem-1',
        providerReference: 're_1',
        reasonCode: 'customer_support',
        note: 'Goodwill adjustment',
        failureCode: null,
        failureMessage: null,
        metadataJson: { source: 'admin' },
        requestedAt: new Date('2026-04-24T03:00:00.000Z'),
        succeededAt: null,
        failedAt: null,
        cancelledAt: null,
        createdAt: new Date('2026-04-24T03:00:00.000Z'),
        updatedAt: new Date('2026-04-24T03:01:00.000Z'),
        payment: {
          id: 'payment-1',
          customerProfileId: 'customer-profile-1',
          method: PaymentMethod.DIGITAL_WALLET,
          provider: PaymentProvider.WAVE_PAY,
          status: PaymentStatus.PARTIALLY_REFUNDED,
          amount: { toString: () => '12000' },
          refundedAmount: { toString: () => '1500' },
          currencyCode: 'MMK',
          providerReference: 'payment-ref-1',
          providerReceiptId: 'receipt-1',
        },
        order: {
          id: 'order-1',
          orderCode: 'ORD-001',
          status: 'DELIVERED',
          customerProfileId: 'customer-profile-1',
          totalAmount: { toString: () => '12000' },
          currencyCode: 'MMK',
        },
        createdByUser: {
          id: 'admin-1',
          role: UserRole.ADMIN,
          phone: '+959333333333',
          status: UserStatus.ACTIVE,
        },
      },
    ] as never[]);

    await expect(service.listOrderRefunds('order-1')).resolves.toMatchObject([
      {
        refundId: 'refund-1',
        payment: {
          provider: PaymentProvider.WAVE_PAY,
          status: PaymentStatus.PARTIALLY_REFUNDED,
        },
        createdByUser: {
          role: UserRole.ADMIN,
        },
      },
    ]);
  });

  it('maps refund attempts into readable retry history entities', async () => {
    repository.findRefundAttempts.mockResolvedValue([
      {
        id: 'refund-attempt-1',
        refundId: 'refund-1',
        provider: PaymentProvider.WAVE_PAY,
        status: RefundStatus.FAILED,
        providerReference: 're_1',
        requestPayloadJson: { amount: 1500 },
        responsePayloadJson: { error: 'timeout' },
        failureCode: 'timeout',
        failureMessage: 'Provider timeout',
        attemptedAt: new Date('2026-04-24T03:02:00.000Z'),
        createdAt: new Date('2026-04-24T03:02:00.000Z'),
        updatedAt: new Date('2026-04-24T03:02:05.000Z'),
      },
    ] as never[]);

    await expect(service.listRefundAttempts('refund-1')).resolves.toMatchObject([
      {
        refundAttemptId: 'refund-attempt-1',
        provider: PaymentProvider.WAVE_PAY,
        status: RefundStatus.FAILED,
        failureCode: 'timeout',
      },
    ]);
  });
});

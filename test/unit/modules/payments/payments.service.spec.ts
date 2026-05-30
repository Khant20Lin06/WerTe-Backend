import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  RefundStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { PaymentsRepository } from '../../../../src/modules/payments/repositories/payments.repository';
import { PaymentsService } from '../../../../src/modules/payments/services/payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let repository: jest.Mocked<PaymentsRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findOrderPayment: jest.fn(),
      findCustomerPayment: jest.fn(),
      findOrderPayments: jest.fn(),
      findCustomerOrderPayments: jest.fn(),
      findLatestOrderPayment: jest.fn(),
      findPaymentAttempts: jest.fn(),
    } as unknown as jest.Mocked<PaymentsRepository>;

    service = new PaymentsService(repository);
  });

  it('maps customer order payments into payment summary entities', async () => {
    repository.findCustomerOrderPayments.mockResolvedValue([
      {
        id: 'payment-1',
        orderId: 'order-1',
        customerProfileId: 'customer-profile-1',
        method: PaymentMethod.CARD,
        provider: PaymentProvider.STRIPE,
        status: PaymentStatus.SUCCEEDED,
        amount: { toString: () => '12000' },
        refundedAmount: { toString: () => '1000' },
        currencyCode: 'MMK',
        idempotencyKey: 'idem-1',
        providerReference: 'pi_1',
        providerReceiptId: 'rcpt_1',
        failureCode: null,
        failureMessage: null,
        metadataJson: { source: 'checkout' },
        requiresActionAt: null,
        succeededAt: new Date('2026-04-24T01:00:00.000Z'),
        failedAt: null,
        cancelledAt: null,
        expiredAt: null,
        createdAt: new Date('2026-04-24T00:59:00.000Z'),
        updatedAt: new Date('2026-04-24T01:00:00.000Z'),
        customerProfile: {
          id: 'customer-profile-1',
          fullName: 'Khant Lin',
          avatarUrl: null,
          user: {
            id: 'user-1',
            phone: '+959111111111',
            status: UserStatus.ACTIVE,
          },
        },
        order: {
          id: 'order-1',
          orderCode: 'ORD-001',
          status: 'PLACED',
          totalAmount: { toString: () => '12000' },
          currencyCode: 'MMK',
          placedAt: new Date('2026-04-24T00:58:00.000Z'),
          branch: {
            id: 'branch-1',
            name: 'Downtown Branch',
            merchant: {
              id: 'merchant-1',
              userId: 'merchant-user-1',
              name: 'Demo Merchant',
            },
          },
        },
        refunds: [
          {
            id: 'refund-1',
            status: RefundStatus.SUCCEEDED,
            amount: { toString: () => '1000' },
            currencyCode: 'MMK',
            providerReference: 're_1',
            reasonCode: 'partial_refund',
            note: null,
            requestedAt: new Date('2026-04-24T02:00:00.000Z'),
            succeededAt: new Date('2026-04-24T02:10:00.000Z'),
            failedAt: null,
            cancelledAt: null,
            createdByUser: {
              id: 'admin-1',
              role: UserRole.ADMIN,
              phone: '+959222222222',
            },
          },
        ],
      },
    ] as never[]);

    await expect(
      service.listCustomerOrderPayments('order-1', 'customer-profile-1'),
    ).resolves.toMatchObject([
      {
        paymentId: 'payment-1',
        order: {
          orderCode: 'ORD-001',
          branchName: 'Downtown Branch',
        },
        refunds: [
          {
            refundId: 'refund-1',
            status: RefundStatus.SUCCEEDED,
            createdByUserRole: UserRole.ADMIN,
          },
        ],
      },
    ]);
  });

  it('maps payment attempts into chronologically readable entities', async () => {
    repository.findPaymentAttempts.mockResolvedValue([
      {
        id: 'attempt-1',
        paymentId: 'payment-1',
        provider: PaymentProvider.STRIPE,
        status: PaymentStatus.REQUIRES_ACTION,
        providerReference: 'pi_1',
        requestPayloadJson: { amount: 12000 },
        responsePayloadJson: { nextAction: 'redirect' },
        failureCode: null,
        failureMessage: null,
        attemptedAt: new Date('2026-04-24T01:00:00.000Z'),
        createdAt: new Date('2026-04-24T01:00:00.000Z'),
        updatedAt: new Date('2026-04-24T01:00:01.000Z'),
      },
    ] as never[]);

    await expect(service.listPaymentAttempts('payment-1')).resolves.toMatchObject([
      {
        paymentAttemptId: 'attempt-1',
        paymentId: 'payment-1',
        provider: PaymentProvider.STRIPE,
        status: PaymentStatus.REQUIRES_ACTION,
      },
    ]);
  });
});

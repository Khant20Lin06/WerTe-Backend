import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from '@prisma/client';

import { CheckoutPaymentIntentService } from '../../../../src/modules/payments/services/checkout-payment-intent.service';
import { PaymentsRepository } from '../../../../src/modules/payments/repositories/payments.repository';

describe('CheckoutPaymentIntentService', () => {
  let service: CheckoutPaymentIntentService;
  let repository: jest.Mocked<PaymentsRepository>;

  beforeEach(() => {
    repository = {
      createCheckoutPaymentIntent: jest.fn(),
      findCheckoutPaymentIntentByIdempotencyKey: jest.fn(),
    } as unknown as jest.Mocked<PaymentsRepository>;

    service = new CheckoutPaymentIntentService(repository);
  });

  it('creates a pending COD payment intent by default for checkout submissions', async () => {
    repository.createCheckoutPaymentIntent.mockResolvedValue({
      id: 'payment_1',
      orderId: 'order_1',
      customerProfileId: 'cust_prof_1',
      method: PaymentMethod.CASH_ON_DELIVERY,
      provider: PaymentProvider.COD,
      status: PaymentStatus.PENDING,
      amount: new Prisma.Decimal('6500'),
      currencyCode: 'MMK',
      idempotencyKey: 'idem_1',
      providerReference: null,
      providerReceiptId: null,
      failureCode: null,
      failureMessage: null,
      requiresActionAt: null,
      succeededAt: null,
      failedAt: null,
      cancelledAt: null,
      expiredAt: null,
      createdAt: new Date('2026-04-24T04:00:00.000Z'),
      updatedAt: new Date('2026-04-24T04:00:00.000Z'),
    } as never);

    await expect(
      service.createCheckoutPaymentIntent({
        orderId: 'order_1',
        orderCode: 'ORD-001',
        customerProfileId: 'cust_prof_1',
        amount: new Prisma.Decimal('6500'),
        currencyCode: 'MMK',
        idempotencyKey: 'idem_1',
      }),
    ).resolves.toMatchObject({
      paymentId: 'payment_1',
      provider: PaymentProvider.COD,
      status: PaymentStatus.PENDING,
      requiresCustomerAction: false,
    });

    expect(repository.createCheckoutPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        method: PaymentMethod.CASH_ON_DELIVERY,
        provider: PaymentProvider.COD,
        status: PaymentStatus.PENDING,
      }),
      undefined,
    );
  });

  it('creates a REQUIRES_ACTION intent for external checkout methods', async () => {
    repository.createCheckoutPaymentIntent.mockResolvedValue({
      id: 'payment_2',
      orderId: 'order_1',
      customerProfileId: 'cust_prof_1',
      method: PaymentMethod.CARD,
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.REQUIRES_ACTION,
      amount: new Prisma.Decimal('6500'),
      currencyCode: 'MMK',
      idempotencyKey: 'idem_2',
      providerReference: null,
      providerReceiptId: null,
      failureCode: null,
      failureMessage: null,
      requiresActionAt: new Date('2026-04-24T04:10:00.000Z'),
      succeededAt: null,
      failedAt: null,
      cancelledAt: null,
      expiredAt: null,
      createdAt: new Date('2026-04-24T04:10:00.000Z'),
      updatedAt: new Date('2026-04-24T04:10:00.000Z'),
    } as never);

    await expect(
      service.createCheckoutPaymentIntent({
        orderId: 'order_1',
        orderCode: 'ORD-001',
        customerProfileId: 'cust_prof_1',
        amount: new Prisma.Decimal('6500'),
        currencyCode: 'MMK',
        idempotencyKey: 'idem_2',
        paymentMethod: PaymentMethod.CARD,
        paymentProvider: PaymentProvider.STRIPE,
      }),
    ).resolves.toMatchObject({
      paymentId: 'payment_2',
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.REQUIRES_ACTION,
      requiresCustomerAction: true,
    });

    expect(repository.createCheckoutPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        method: PaymentMethod.CARD,
        provider: PaymentProvider.STRIPE,
        status: PaymentStatus.REQUIRES_ACTION,
      }),
      undefined,
    );
  });

  it('rejects incompatible COD provider combinations', async () => {
    await expect(
      service.createCheckoutPaymentIntent({
        orderId: 'order_1',
        orderCode: 'ORD-001',
        customerProfileId: 'cust_prof_1',
        amount: new Prisma.Decimal('6500'),
        currencyCode: 'MMK',
        idempotencyKey: 'idem_3',
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        paymentProvider: PaymentProvider.STRIPE,
      }),
    ).rejects.toMatchObject({
      status: 422,
    });

    expect(repository.createCheckoutPaymentIntent).not.toHaveBeenCalled();
  });
});

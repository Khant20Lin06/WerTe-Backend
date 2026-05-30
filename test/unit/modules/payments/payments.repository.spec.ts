import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import {
  checkoutPaymentIntentSelect,
} from '../../../../src/modules/payments/entities/checkout-payment-intent.entity';
import {
  paymentAttemptSelect,
} from '../../../../src/modules/payments/entities/payment-attempt.entity';
import {
  paymentProviderEventSelect,
} from '../../../../src/modules/payments/entities/payment-provider-event.entity';
import {
  paymentSummaryInclude,
} from '../../../../src/modules/payments/entities/payment-summary.entity';
import { PaymentsRepository } from '../../../../src/modules/payments/repositories/payments.repository';

function makeRepository() {
  const prisma = {
    payment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    paymentAttempt: {
      findMany: jest.fn(),
    },
    paymentProviderEvent: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;

  return {
    prisma,
    repository: new PaymentsRepository(prisma),
  };
}

describe('PaymentsRepository', () => {
  it('loads payment detail by id with the shared summary include', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

    await repository.findById('payment_1');

    expect(prisma.payment.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'payment_1',
      },
      include: paymentSummaryInclude,
    });
  });

  it('lists order payments in descending create order for admin/read surfaces', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.payment.findMany as jest.Mock).mockResolvedValue([]);

    await repository.findOrderPayments('order_1');

    expect(prisma.payment.findMany).toHaveBeenCalledWith({
      where: {
        orderId: 'order_1',
      },
      include: paymentSummaryInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  });

  it('filters customer order payments by order and customer profile ownership', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.payment.findMany as jest.Mock).mockResolvedValue([]);

    await repository.findCustomerOrderPayments('order_1', 'customer_profile_1');

    expect(prisma.payment.findMany).toHaveBeenCalledWith({
      where: {
        orderId: 'order_1',
        customerProfileId: 'customer_profile_1',
      },
      include: paymentSummaryInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  });

  it('loads payment attempts in chronological attempt order', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.paymentAttempt.findMany as jest.Mock).mockResolvedValue([]);

    await repository.findPaymentAttempts('payment_1');

    expect(prisma.paymentAttempt.findMany).toHaveBeenCalledWith({
      where: {
        paymentId: 'payment_1',
      },
      select: paymentAttemptSelect,
      orderBy: [{ attemptedAt: 'asc' }, { id: 'asc' }],
    });
  });

  it('loads latest payment by provider reference for webhook matching', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.payment.findFirst as jest.Mock).mockResolvedValue(null);

    await repository.findLatestByProviderReference('STRIPE', 'pi_123');

    expect(prisma.payment.findFirst).toHaveBeenCalledWith({
      where: {
        provider: 'STRIPE',
        providerReference: 'pi_123',
      },
      include: paymentSummaryInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    });
  });

  it('loads checkout payment intents by idempotency key using the dedicated select', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

    await repository.findCheckoutPaymentIntentByIdempotencyKey('idem_1');

    expect(prisma.payment.findUnique).toHaveBeenCalledWith({
      where: {
        idempotencyKey: 'idem_1',
      },
      select: checkoutPaymentIntentSelect,
    });
  });

  it('creates checkout payment intents with a nested attempt and the dedicated select', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.payment.create as jest.Mock).mockResolvedValue({});

    await repository.createCheckoutPaymentIntent({
      orderId: 'order_1',
      customerProfileId: 'customer_profile_1',
      method: 'CASH_ON_DELIVERY',
      provider: 'COD',
      status: 'PENDING',
      amount: { toString: () => '6500' } as never,
      currencyCode: 'MMK',
      idempotencyKey: 'idem_1',
      metadataJson: { initiatedFrom: 'checkout' },
      requestPayloadJson: { amount: '6500' },
      responsePayloadJson: { nextAction: 'await_collection' },
    });

    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: {
        orderId: 'order_1',
        customerProfileId: 'customer_profile_1',
        method: 'CASH_ON_DELIVERY',
        provider: 'COD',
        status: 'PENDING',
        amount: expect.anything(),
        currencyCode: 'MMK',
        idempotencyKey: 'idem_1',
        metadataJson: { initiatedFrom: 'checkout' },
        requiresActionAt: null,
        attempts: {
          create: {
            provider: 'COD',
            status: 'PENDING',
            requestPayloadJson: { amount: '6500' },
            responsePayloadJson: { nextAction: 'await_collection' },
          },
        },
      },
      select: checkoutPaymentIntentSelect,
    });
  });

  it('transitions payment status with a nested lifecycle attempt for confirmation/failure flows', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.payment.create as jest.Mock).mockResolvedValue({});
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue({});
    (prisma.payment.findFirst as jest.Mock).mockResolvedValue({});
    (prisma.payment.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.payment.update as jest.Mock).mockResolvedValue({});

    await repository.transitionPaymentStatus({
      paymentId: 'payment_1',
      provider: 'STRIPE',
      status: 'SUCCEEDED',
      metadataJson: { providerWebhook: true },
      providerReference: 'pi_123',
      providerReceiptId: 'receipt_123',
      requestPayloadJson: { paymentId: 'payment_1' },
      responsePayloadJson: { outcome: 'succeeded' },
      occurredAt: new Date('2026-04-24T08:00:00.000Z'),
    });

    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: {
        id: 'payment_1',
      },
      data: {
        provider: 'STRIPE',
        status: 'SUCCEEDED',
        metadataJson: { providerWebhook: true },
        providerReference: 'pi_123',
        providerReceiptId: 'receipt_123',
        failureCode: null,
        failureMessage: null,
        requiresActionAt: null,
        succeededAt: new Date('2026-04-24T08:00:00.000Z'),
        failedAt: null,
        cancelledAt: null,
        expiredAt: null,
        attempts: {
          create: {
            provider: 'STRIPE',
            status: 'SUCCEEDED',
            providerReference: 'pi_123',
            requestPayloadJson: { paymentId: 'payment_1' },
            responsePayloadJson: { outcome: 'succeeded' },
            failureCode: null,
            failureMessage: null,
            attemptedAt: new Date('2026-04-24T08:00:00.000Z'),
          },
        },
      },
      include: paymentSummaryInclude,
    });
  });

  it('updates payment refund totals after successful refund settlement', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.payment.update as jest.Mock).mockResolvedValue({});

    await repository.updateRefundState({
      paymentId: 'payment_1',
      refundedAmount: { toString: () => '3000' } as never,
      status: 'PARTIALLY_REFUNDED',
    });

    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: {
        id: 'payment_1',
      },
      data: {
        refundedAmount: expect.anything(),
        status: 'PARTIALLY_REFUNDED',
      },
      include: paymentSummaryInclude,
    });
  });

  it('loads payment provider events by provider event id for replay protection', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.paymentProviderEvent.findUnique as jest.Mock).mockResolvedValue(null);

    await repository.findPaymentProviderEventByProviderEventId('STRIPE', 'evt_1');

    expect(prisma.paymentProviderEvent.findUnique).toHaveBeenCalledWith({
      where: {
        provider_providerEventId: {
          provider: 'STRIPE',
          providerEventId: 'evt_1',
        },
      },
      select: paymentProviderEventSelect,
    });
  });

  it('loads payment provider events by internal event id for processing', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.paymentProviderEvent.findUnique as jest.Mock).mockResolvedValue(null);

    await repository.findPaymentProviderEventById('payment_provider_event_1');

    expect(prisma.paymentProviderEvent.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'payment_provider_event_1',
      },
      select: paymentProviderEventSelect,
    });
  });

  it('lists processable payment provider events for reconciliation', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.paymentProviderEvent.findMany as jest.Mock).mockResolvedValue([]);

    await repository.listProcessablePaymentProviderEvents(25);

    expect(prisma.paymentProviderEvent.findMany).toHaveBeenCalledWith({
      where: {
        verificationStatus: {
          in: ['VERIFIED', 'SKIPPED'],
        },
        processingStatus: {
          in: ['RECEIVED', 'FAILED', 'IGNORED'],
        },
      },
      select: paymentProviderEventSelect,
      orderBy: [{ receivedAt: 'asc' }, { id: 'asc' }],
      take: 25,
    });
  });

  it('creates payment provider events with raw and normalized payload snapshots', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.paymentProviderEvent.create as jest.Mock).mockResolvedValue({});

    await repository.createPaymentProviderEvent({
      provider: 'STRIPE',
      providerEventId: 'evt_1',
      eventType: 'payment_intent.succeeded',
      paymentId: 'payment_1',
      orderId: 'order_1',
      providerReference: 'pi_123',
      normalizedStatus: 'SUCCEEDED',
      verificationStatus: 'VERIFIED',
      processingStatus: 'RECEIVED',
      signatureHeader: 'v1=signature',
      headersJson: { 'stripe-signature': 'v1=signature' },
      rawPayloadJson: { id: 'evt_1' },
      normalizedPayloadJson: { paymentId: 'payment_1' },
      receivedAt: new Date('2026-04-25T08:00:00.000Z'),
    });

    expect(prisma.paymentProviderEvent.create).toHaveBeenCalledWith({
      data: {
        provider: 'STRIPE',
        providerEventId: 'evt_1',
        eventType: 'payment_intent.succeeded',
        paymentId: 'payment_1',
        orderId: 'order_1',
        providerReference: 'pi_123',
        normalizedStatus: 'SUCCEEDED',
        verificationStatus: 'VERIFIED',
        processingStatus: 'RECEIVED',
        signatureHeader: 'v1=signature',
        headersJson: { 'stripe-signature': 'v1=signature' },
        rawPayloadJson: { id: 'evt_1' },
        normalizedPayloadJson: { paymentId: 'payment_1' },
        processingMetadataJson: undefined,
        failureCode: null,
        failureMessage: null,
        receivedAt: new Date('2026-04-25T08:00:00.000Z'),
        failedAt: null,
      },
      select: paymentProviderEventSelect,
    });
  });

  it('updates payment provider event processing state with lifecycle metadata', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.paymentProviderEvent.update as jest.Mock).mockResolvedValue({});

    await repository.updatePaymentProviderEventProcessingState({
      paymentProviderEventId: 'payment_provider_event_1',
      processingStatus: 'PROCESSED',
      paymentId: 'payment_1',
      orderId: 'order_1',
      providerReference: 'pi_123',
      processingMetadataJson: { outcome: 'processed' },
      occurredAt: new Date('2026-04-25T09:00:00.000Z'),
    });

    expect(prisma.paymentProviderEvent.update).toHaveBeenCalledWith({
      where: {
        id: 'payment_provider_event_1',
      },
      data: {
        paymentId: 'payment_1',
        orderId: 'order_1',
        providerReference: 'pi_123',
        processingStatus: 'PROCESSED',
        processingMetadataJson: { outcome: 'processed' },
        failureCode: null,
        failureMessage: null,
        processedAt: new Date('2026-04-25T09:00:00.000Z'),
        failedAt: null,
        ignoredAt: null,
      },
      select: paymentProviderEventSelect,
    });
  });
});

import { HttpStatus } from '@nestjs/common';
import {
  PaymentProvider,
  PaymentStatus,
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
} from '@prisma/client';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { PaymentsRepository } from '../../../../src/modules/payments/repositories/payments.repository';
import { PaymentLifecycleService } from '../../../../src/modules/payments/services/payment-lifecycle.service';
import { PaymentProviderEventProcessorService } from '../../../../src/modules/payments/services/payment-provider-event-processor.service';

function makePaymentProviderEventRecord(overrides?: Record<string, unknown>): any {
  return {
    id: 'payment_provider_event_1',
    provider: PaymentProvider.STRIPE,
    providerEventId: 'evt_1',
    eventType: 'payment_intent.succeeded',
    paymentId: 'payment_1',
    orderId: 'order_1',
    providerReference: 'pi_123',
    normalizedStatus: PaymentStatus.SUCCEEDED,
    verificationStatus: ProviderEventVerificationStatus.VERIFIED,
    processingStatus: ProviderEventProcessingStatus.RECEIVED,
    signatureHeader: 'v1=signature',
    headersJson: { 'stripe-signature': 'v1=signature' },
    rawPayloadJson: { id: 'evt_1' },
    normalizedPayloadJson: { paymentId: 'payment_1' },
    processingMetadataJson: null,
    failureCode: null,
    failureMessage: null,
    receivedAt: new Date('2026-04-25T08:00:00.000Z'),
    processedAt: null,
    failedAt: null,
    ignoredAt: null,
    createdAt: new Date('2026-04-25T08:00:00.000Z'),
    updatedAt: new Date('2026-04-25T08:00:00.000Z'),
    ...overrides,
  };
}

function makePaymentRecord(overrides?: Record<string, unknown>): any {
  return {
    id: 'payment_1',
    orderId: 'order_1',
    provider: PaymentProvider.STRIPE,
    providerReference: 'pi_123',
    status: PaymentStatus.REQUIRES_ACTION,
    ...overrides,
  };
}

function makePaymentSummary(overrides?: Record<string, unknown>): any {
  return {
    paymentId: 'payment_1',
    orderId: 'order_1',
    providerReference: 'pi_123',
    status: PaymentStatus.SUCCEEDED,
    order: {
      status: 'PLACED',
    },
    ...overrides,
  };
}

function makeRepository() {
  return {
    findPaymentProviderEventById: jest.fn(),
    findById: jest.fn(),
    findLatestByProviderReference: jest.fn(),
    updatePaymentProviderEventProcessingState: jest.fn(
      async (payload: {
        processingStatus: ProviderEventProcessingStatus;
        failureCode?: string | null;
        failureMessage?: string | null;
        occurredAt?: Date;
      }) =>
        makePaymentProviderEventRecord({
          processingStatus: payload.processingStatus,
          failureCode: payload.failureCode ?? null,
          failureMessage: payload.failureMessage ?? null,
          processedAt:
            payload.processingStatus === ProviderEventProcessingStatus.PROCESSED
              ? payload.occurredAt
              : null,
          failedAt:
            payload.processingStatus === ProviderEventProcessingStatus.FAILED
              ? payload.occurredAt
              : null,
          ignoredAt:
            payload.processingStatus === ProviderEventProcessingStatus.IGNORED
              ? payload.occurredAt
              : null,
        }),
    ),
  } as unknown as jest.Mocked<PaymentsRepository>;
}

function makeLifecycleService() {
  return {
    confirmCurrentPayment: jest.fn().mockResolvedValue(makePaymentSummary()),
    failCurrentPayment: jest.fn().mockResolvedValue(
      makePaymentSummary({
        status: PaymentStatus.FAILED,
      }),
    ),
    cancelCurrentPayment: jest.fn().mockResolvedValue(
      makePaymentSummary({
        status: PaymentStatus.CANCELLED,
      }),
    ),
    expireCurrentPayment: jest.fn().mockResolvedValue(
      makePaymentSummary({
        status: PaymentStatus.EXPIRED,
      }),
    ),
  } as unknown as jest.Mocked<PaymentLifecycleService>;
}

describe('PaymentProviderEventProcessorService', () => {
  const occurredAt = new Date('2026-04-25T09:00:00.000Z');

  it('confirms succeeded provider events and marks them processed', async () => {
    const paymentsRepository = makeRepository();
    const paymentLifecycleService = makeLifecycleService();
    paymentsRepository.findPaymentProviderEventById.mockResolvedValue(
      makePaymentProviderEventRecord() as never,
    );
    paymentsRepository.findById.mockResolvedValue(makePaymentRecord() as never);
    const service = new PaymentProviderEventProcessorService(
      paymentsRepository,
      paymentLifecycleService,
    );

    const result = await service.processPaymentProviderEvent({
      paymentProviderEventId: 'payment_provider_event_1',
      occurredAt,
    });

    expect(paymentLifecycleService.confirmCurrentPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'system:payment-provider-webhook',
      }),
      expect.objectContaining({
        paymentId: 'payment_1',
        providerReference: 'pi_123',
        reasonCode: 'provider_payment_succeeded',
        metadata: expect.objectContaining({
          providerWebhook: true,
          paymentProviderEventId: 'payment_provider_event_1',
        }),
      }),
      {
        skipAdminFinanceAccess: true,
      },
    );
    expect(
      paymentsRepository.updatePaymentProviderEventProcessingState,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentProviderEventId: 'payment_provider_event_1',
        processingStatus: ProviderEventProcessingStatus.PROCESSED,
        paymentId: 'payment_1',
        orderId: 'order_1',
        occurredAt,
      }),
    );
    expect(result.processingStatus).toBe(ProviderEventProcessingStatus.PROCESSED);
  });

  it('matches missing payment ids by provider reference and fails payments from failed events', async () => {
    const paymentsRepository = makeRepository();
    const paymentLifecycleService = makeLifecycleService();
    paymentsRepository.findPaymentProviderEventById.mockResolvedValue(
      makePaymentProviderEventRecord({
        eventType: 'payment_intent.payment_failed',
        paymentId: null,
        normalizedStatus: PaymentStatus.FAILED,
      }) as never,
    );
    paymentsRepository.findLatestByProviderReference.mockResolvedValue(
      makePaymentRecord() as never,
    );
    const service = new PaymentProviderEventProcessorService(
      paymentsRepository,
      paymentLifecycleService,
    );

    await service.processPaymentProviderEvent({
      paymentProviderEventId: 'payment_provider_event_1',
      occurredAt,
    });

    expect(paymentsRepository.findById).not.toHaveBeenCalled();
    expect(paymentsRepository.findLatestByProviderReference).toHaveBeenCalledWith(
      PaymentProvider.STRIPE,
      'pi_123',
    );
    expect(paymentLifecycleService.failCurrentPayment).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        paymentId: 'payment_1',
        failureCode: 'provider_payment_failed',
        failureMessage: 'Provider reported payment failure.',
      }),
      {
        skipAdminFinanceAccess: true,
      },
    );
  });

  it('expires payments when provider events report expiration', async () => {
    const paymentsRepository = makeRepository();
    const paymentLifecycleService = makeLifecycleService();
    paymentsRepository.findPaymentProviderEventById.mockResolvedValue(
      makePaymentProviderEventRecord({
        eventType: 'payment_intent.expired',
        normalizedStatus: PaymentStatus.EXPIRED,
      }) as never,
    );
    paymentsRepository.findById.mockResolvedValue(makePaymentRecord() as never);
    const service = new PaymentProviderEventProcessorService(
      paymentsRepository,
      paymentLifecycleService,
    );

    await service.processPaymentProviderEvent({
      paymentProviderEventId: 'payment_provider_event_1',
      occurredAt,
    });

    expect(paymentLifecycleService.expireCurrentPayment).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        reasonCode: 'provider_payment_expired',
        note: 'Provider reported payment expiration.',
      }),
      {
        skipAdminFinanceAccess: true,
      },
    );
  });

  it('ignores non-terminal payment statuses without touching lifecycle services', async () => {
    const paymentsRepository = makeRepository();
    const paymentLifecycleService = makeLifecycleService();
    paymentsRepository.findPaymentProviderEventById.mockResolvedValue(
      makePaymentProviderEventRecord({
        normalizedStatus: PaymentStatus.PROCESSING,
      }) as never,
    );
    const service = new PaymentProviderEventProcessorService(
      paymentsRepository,
      paymentLifecycleService,
    );

    const result = await service.processPaymentProviderEvent({
      paymentProviderEventId: 'payment_provider_event_1',
      occurredAt,
    });

    expect(paymentLifecycleService.confirmCurrentPayment).not.toHaveBeenCalled();
    expect(
      paymentsRepository.updatePaymentProviderEventProcessingState,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        processingStatus: ProviderEventProcessingStatus.IGNORED,
        failureCode: 'non_terminal_payment_status',
      }),
    );
    expect(result.processingStatus).toBe(ProviderEventProcessingStatus.IGNORED);
  });

  it('returns already terminal provider events without replaying lifecycle work', async () => {
    const paymentsRepository = makeRepository();
    const paymentLifecycleService = makeLifecycleService();
    paymentsRepository.findPaymentProviderEventById.mockResolvedValue(
      makePaymentProviderEventRecord({
        processingStatus: ProviderEventProcessingStatus.PROCESSED,
        processedAt: occurredAt,
      }) as never,
    );
    const service = new PaymentProviderEventProcessorService(
      paymentsRepository,
      paymentLifecycleService,
    );

    const result = await service.processPaymentProviderEvent({
      paymentProviderEventId: 'payment_provider_event_1',
      occurredAt,
    });

    expect(paymentLifecycleService.confirmCurrentPayment).not.toHaveBeenCalled();
    expect(
      paymentsRepository.updatePaymentProviderEventProcessingState,
    ).not.toHaveBeenCalled();
    expect(result.processingStatus).toBe(ProviderEventProcessingStatus.PROCESSED);
  });

  it('retries failed provider events when reconciliation asks for terminal retry', async () => {
    const paymentsRepository = makeRepository();
    const paymentLifecycleService = makeLifecycleService();
    paymentsRepository.findPaymentProviderEventById.mockResolvedValue(
      makePaymentProviderEventRecord({
        processingStatus: ProviderEventProcessingStatus.FAILED,
        failedAt: occurredAt,
      }) as never,
    );
    paymentsRepository.findById.mockResolvedValue(makePaymentRecord() as never);
    const service = new PaymentProviderEventProcessorService(
      paymentsRepository,
      paymentLifecycleService,
    );

    await service.processPaymentProviderEvent({
      paymentProviderEventId: 'payment_provider_event_1',
      occurredAt,
      retryTerminal: true,
    });

    expect(paymentLifecycleService.confirmCurrentPayment).toHaveBeenCalled();
    expect(
      paymentsRepository.updatePaymentProviderEventProcessingState,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        processingStatus: ProviderEventProcessingStatus.PROCESSED,
      }),
    );
  });

  it('marks lifecycle failures as failed and rethrows the original error', async () => {
    const paymentsRepository = makeRepository();
    const paymentLifecycleService = makeLifecycleService();
    const error = new AppException(
      'This payment can no longer be confirmed.',
      HttpStatus.CONFLICT,
    );
    paymentsRepository.findPaymentProviderEventById.mockResolvedValue(
      makePaymentProviderEventRecord() as never,
    );
    paymentsRepository.findById.mockResolvedValue(makePaymentRecord() as never);
    paymentLifecycleService.confirmCurrentPayment.mockRejectedValue(error);
    const service = new PaymentProviderEventProcessorService(
      paymentsRepository,
      paymentLifecycleService,
    );

    await expect(
      service.processPaymentProviderEvent({
        paymentProviderEventId: 'payment_provider_event_1',
        occurredAt,
      }),
    ).rejects.toBe(error);

    expect(
      paymentsRepository.updatePaymentProviderEventProcessingState,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        processingStatus: ProviderEventProcessingStatus.FAILED,
        failureCode: 'CONFLICT',
        failureMessage: 'This payment can no longer be confirmed.',
      }),
    );
  });
});

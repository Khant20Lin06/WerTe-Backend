import { HttpStatus } from '@nestjs/common';
import {
  PaymentProvider,
  PaymentStatus,
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
  RefundStatus,
} from '@prisma/client';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { RefundsRepository } from '../../../../src/modules/refunds/repositories/refunds.repository';
import { RefundOperationsService } from '../../../../src/modules/refunds/services/refund-operations.service';
import { RefundProviderEventProcessorService } from '../../../../src/modules/refunds/services/refund-provider-event-processor.service';

function makeRefundProviderEventRecord(overrides?: Record<string, unknown>): any {
  return {
    id: 'refund_provider_event_1',
    provider: PaymentProvider.STRIPE,
    providerEventId: 'evt_refund_1',
    eventType: 'refund.succeeded',
    refundId: 'refund_1',
    paymentId: 'payment_1',
    orderId: 'order_1',
    providerReference: 're_123',
    normalizedStatus: RefundStatus.SUCCEEDED,
    verificationStatus: ProviderEventVerificationStatus.VERIFIED,
    processingStatus: ProviderEventProcessingStatus.RECEIVED,
    signatureHeader: 'v1=signature',
    headersJson: { 'stripe-signature': 'v1=signature' },
    rawPayloadJson: { id: 'evt_refund_1' },
    normalizedPayloadJson: { refundId: 'refund_1' },
    processingMetadataJson: null,
    failureCode: null,
    failureMessage: null,
    receivedAt: new Date('2026-04-25T09:00:00.000Z'),
    processedAt: null,
    failedAt: null,
    ignoredAt: null,
    createdAt: new Date('2026-04-25T09:00:00.000Z'),
    updatedAt: new Date('2026-04-25T09:00:00.000Z'),
    ...overrides,
  };
}

function makeRefundRecord(overrides?: Record<string, unknown>): any {
  return {
    id: 'refund_1',
    paymentId: 'payment_1',
    orderId: 'order_1',
    providerReference: 're_123',
    status: RefundStatus.PENDING,
    payment: {
      provider: PaymentProvider.STRIPE,
    },
    ...overrides,
  };
}

function makeRefundSummary(overrides?: Record<string, unknown>): any {
  return {
    refundId: 'refund_1',
    paymentId: 'payment_1',
    orderId: 'order_1',
    providerReference: 're_123',
    status: RefundStatus.SUCCEEDED,
    payment: {
      status: PaymentStatus.PARTIALLY_REFUNDED,
    },
    order: {
      status: 'DELIVERED',
    },
    ...overrides,
  };
}

function makeRepository() {
  return {
    findRefundProviderEventById: jest.fn(),
    findById: jest.fn(),
    findLatestByProviderReference: jest.fn(),
    updateRefundProviderEventProcessingState: jest.fn(
      async (payload: {
        processingStatus: ProviderEventProcessingStatus;
        failureCode?: string | null;
        failureMessage?: string | null;
        occurredAt?: Date;
      }) =>
        makeRefundProviderEventRecord({
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
  } as unknown as jest.Mocked<RefundsRepository>;
}

function makeRefundOperationsService() {
  return {
    succeedCurrentAdminRefund: jest.fn().mockResolvedValue(makeRefundSummary()),
    failCurrentAdminRefund: jest.fn().mockResolvedValue(
      makeRefundSummary({
        status: RefundStatus.FAILED,
      }),
    ),
    cancelCurrentAdminRefund: jest.fn().mockResolvedValue(
      makeRefundSummary({
        status: RefundStatus.CANCELLED,
      }),
    ),
  } as unknown as jest.Mocked<RefundOperationsService>;
}

describe('RefundProviderEventProcessorService', () => {
  const occurredAt = new Date('2026-04-25T10:00:00.000Z');

  it('succeeds refund provider events and marks them processed', async () => {
    const refundsRepository = makeRepository();
    const refundOperationsService = makeRefundOperationsService();
    refundsRepository.findRefundProviderEventById.mockResolvedValue(
      makeRefundProviderEventRecord() as never,
    );
    refundsRepository.findById.mockResolvedValue(makeRefundRecord() as never);
    const service = new RefundProviderEventProcessorService(
      refundsRepository,
      refundOperationsService,
    );

    const result = await service.processRefundProviderEvent({
      refundProviderEventId: 'refund_provider_event_1',
      occurredAt,
    });

    expect(refundOperationsService.succeedCurrentAdminRefund).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'system:refund-provider-webhook',
      }),
      expect.objectContaining({
        refundId: 'refund_1',
        providerReference: 're_123',
        reasonCode: 'provider_refund_succeeded',
        metadata: expect.objectContaining({
          providerWebhook: true,
          refundProviderEventId: 'refund_provider_event_1',
        }),
      }),
      {
        skipAdminFinanceAccess: true,
      },
    );
    expect(
      refundsRepository.updateRefundProviderEventProcessingState,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        refundProviderEventId: 'refund_provider_event_1',
        processingStatus: ProviderEventProcessingStatus.PROCESSED,
        refundId: 'refund_1',
        paymentId: 'payment_1',
        orderId: 'order_1',
        occurredAt,
      }),
    );
    expect(result.processingStatus).toBe(ProviderEventProcessingStatus.PROCESSED);
  });

  it('matches missing refund ids by provider reference and fails refunds from failed events', async () => {
    const refundsRepository = makeRepository();
    const refundOperationsService = makeRefundOperationsService();
    refundsRepository.findRefundProviderEventById.mockResolvedValue(
      makeRefundProviderEventRecord({
        eventType: 'refund.failed',
        refundId: null,
        normalizedStatus: RefundStatus.FAILED,
      }) as never,
    );
    refundsRepository.findLatestByProviderReference.mockResolvedValue(
      makeRefundRecord() as never,
    );
    const service = new RefundProviderEventProcessorService(
      refundsRepository,
      refundOperationsService,
    );

    await service.processRefundProviderEvent({
      refundProviderEventId: 'refund_provider_event_1',
      occurredAt,
    });

    expect(refundsRepository.findById).not.toHaveBeenCalled();
    expect(refundsRepository.findLatestByProviderReference).toHaveBeenCalledWith(
      PaymentProvider.STRIPE,
      're_123',
    );
    expect(refundOperationsService.failCurrentAdminRefund).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        refundId: 'refund_1',
        failureCode: 'provider_refund_failed',
        failureMessage: 'Provider reported refund failure.',
      }),
      {
        skipAdminFinanceAccess: true,
      },
    );
  });

  it('cancels refunds when provider events report cancellation', async () => {
    const refundsRepository = makeRepository();
    const refundOperationsService = makeRefundOperationsService();
    refundsRepository.findRefundProviderEventById.mockResolvedValue(
      makeRefundProviderEventRecord({
        eventType: 'refund.cancelled',
        normalizedStatus: RefundStatus.CANCELLED,
      }) as never,
    );
    refundsRepository.findById.mockResolvedValue(makeRefundRecord() as never);
    const service = new RefundProviderEventProcessorService(
      refundsRepository,
      refundOperationsService,
    );

    await service.processRefundProviderEvent({
      refundProviderEventId: 'refund_provider_event_1',
      occurredAt,
    });

    expect(
      refundOperationsService.cancelCurrentAdminRefund,
    ).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        reasonCode: 'provider_refund_cancelled',
        note: 'Provider reported refund cancellation.',
      }),
      {
        skipAdminFinanceAccess: true,
      },
    );
  });

  it('ignores non-terminal refund statuses without touching lifecycle services', async () => {
    const refundsRepository = makeRepository();
    const refundOperationsService = makeRefundOperationsService();
    refundsRepository.findRefundProviderEventById.mockResolvedValue(
      makeRefundProviderEventRecord({
        normalizedStatus: RefundStatus.PROCESSING,
      }) as never,
    );
    const service = new RefundProviderEventProcessorService(
      refundsRepository,
      refundOperationsService,
    );

    const result = await service.processRefundProviderEvent({
      refundProviderEventId: 'refund_provider_event_1',
      occurredAt,
    });

    expect(
      refundOperationsService.succeedCurrentAdminRefund,
    ).not.toHaveBeenCalled();
    expect(
      refundsRepository.updateRefundProviderEventProcessingState,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        processingStatus: ProviderEventProcessingStatus.IGNORED,
        failureCode: 'non_terminal_refund_status',
      }),
    );
    expect(result.processingStatus).toBe(ProviderEventProcessingStatus.IGNORED);
  });

  it('returns already terminal provider events without replaying lifecycle work', async () => {
    const refundsRepository = makeRepository();
    const refundOperationsService = makeRefundOperationsService();
    refundsRepository.findRefundProviderEventById.mockResolvedValue(
      makeRefundProviderEventRecord({
        processingStatus: ProviderEventProcessingStatus.PROCESSED,
        processedAt: occurredAt,
      }) as never,
    );
    const service = new RefundProviderEventProcessorService(
      refundsRepository,
      refundOperationsService,
    );

    const result = await service.processRefundProviderEvent({
      refundProviderEventId: 'refund_provider_event_1',
      occurredAt,
    });

    expect(
      refundOperationsService.succeedCurrentAdminRefund,
    ).not.toHaveBeenCalled();
    expect(
      refundsRepository.updateRefundProviderEventProcessingState,
    ).not.toHaveBeenCalled();
    expect(result.processingStatus).toBe(ProviderEventProcessingStatus.PROCESSED);
  });

  it('retries failed provider events when reconciliation asks for terminal retry', async () => {
    const refundsRepository = makeRepository();
    const refundOperationsService = makeRefundOperationsService();
    refundsRepository.findRefundProviderEventById.mockResolvedValue(
      makeRefundProviderEventRecord({
        processingStatus: ProviderEventProcessingStatus.FAILED,
        failedAt: occurredAt,
      }) as never,
    );
    refundsRepository.findById.mockResolvedValue(makeRefundRecord() as never);
    const service = new RefundProviderEventProcessorService(
      refundsRepository,
      refundOperationsService,
    );

    await service.processRefundProviderEvent({
      refundProviderEventId: 'refund_provider_event_1',
      occurredAt,
      retryTerminal: true,
    });

    expect(refundOperationsService.succeedCurrentAdminRefund).toHaveBeenCalled();
    expect(
      refundsRepository.updateRefundProviderEventProcessingState,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        processingStatus: ProviderEventProcessingStatus.PROCESSED,
      }),
    );
  });

  it('marks lifecycle failures as failed and rethrows the original error', async () => {
    const refundsRepository = makeRepository();
    const refundOperationsService = makeRefundOperationsService();
    const error = new AppException(
      'This refund can no longer be marked as succeeded.',
      HttpStatus.CONFLICT,
    );
    refundsRepository.findRefundProviderEventById.mockResolvedValue(
      makeRefundProviderEventRecord() as never,
    );
    refundsRepository.findById.mockResolvedValue(makeRefundRecord() as never);
    refundOperationsService.succeedCurrentAdminRefund.mockRejectedValue(error);
    const service = new RefundProviderEventProcessorService(
      refundsRepository,
      refundOperationsService,
    );

    await expect(
      service.processRefundProviderEvent({
        refundProviderEventId: 'refund_provider_event_1',
        occurredAt,
      }),
    ).rejects.toBe(error);

    expect(
      refundsRepository.updateRefundProviderEventProcessingState,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        processingStatus: ProviderEventProcessingStatus.FAILED,
        failureCode: 'CONFLICT',
        failureMessage: 'This refund can no longer be marked as succeeded.',
      }),
    );
  });
});

import {
  PaymentProvider,
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
  RefundStatus,
} from '@prisma/client';

import { RefundsRepository } from '../../../../src/modules/refunds/repositories/refunds.repository';
import { RefundProviderWebhookService } from '../../../../src/modules/refunds/services/refund-provider-webhook.service';
import { ProviderWebhookNormalizerService } from '../../../../src/modules/payments/services/provider-webhook-normalizer.service';
import { ProviderWebhookSignatureService } from '../../../../src/modules/payments/services/provider-webhook-signature.service';

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

describe('RefundProviderWebhookService', () => {
  it('persists verified refund provider webhooks with normalized fields', async () => {
    const refundsRepository = {
      findRefundProviderEventByProviderEventId: jest.fn().mockResolvedValue(null),
      createRefundProviderEvent: jest
        .fn()
        .mockResolvedValue(makeRefundProviderEventRecord()),
    } as unknown as jest.Mocked<RefundsRepository>;
    const service = new RefundProviderWebhookService(
      refundsRepository,
      new ProviderWebhookNormalizerService(),
      {
        verifySignature: jest.fn().mockReturnValue({
          status: ProviderEventVerificationStatus.VERIFIED,
          failureCode: null,
          failureMessage: null,
        }),
      } as unknown as ProviderWebhookSignatureService,
    );

    const result = await service.ingestRefundWebhook({
      provider: PaymentProvider.STRIPE,
      payload: {
        id: 'evt_refund_1',
        type: 'refund.succeeded',
        data: {
          object: {
            id: 're_123',
            status: 'succeeded',
            metadata: {
              refundId: 'refund_1',
              paymentId: 'payment_1',
              orderId: 'order_1',
            },
          },
        },
      },
    });

    expect(refundsRepository.createRefundProviderEvent).toHaveBeenCalledWith(
      expect.objectContaining({
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
      }),
    );
    expect(result).toMatchObject({
      refundProviderEventId: 'refund_provider_event_1',
      normalizedStatus: RefundStatus.SUCCEEDED,
    });
  });
});

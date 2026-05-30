import 'reflect-metadata';

import {
  PaymentProvider,
  PaymentStatus,
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
  RefundStatus,
} from '@prisma/client';

import { IS_PUBLIC_KEY } from '../../../../src/common/decorators/public.decorator';
import { QueueService } from '../../../../src/infrastructure/queue/queue.service';
import { PaymentProviderEventEntity } from '../../../../src/modules/payments/entities/payment-provider-event.entity';
import { PaymentProviderWebhookService } from '../../../../src/modules/payments/services/payment-provider-webhook.service';
import { ProviderWebhooksController } from '../../../../src/modules/provider-webhooks/controllers/provider-webhooks.controller';
import { ProviderWebhookSecretsService } from '../../../../src/modules/provider-webhooks/services/provider-webhook-secrets.service';
import { RefundProviderEventEntity } from '../../../../src/modules/refunds/entities/refund-provider-event.entity';
import { RefundProviderWebhookService } from '../../../../src/modules/refunds/services/refund-provider-webhook.service';

function makePaymentProviderEvent(
  overrides?: Partial<PaymentProviderEventEntity>,
): PaymentProviderEventEntity {
  return {
    paymentProviderEventId: 'payment_provider_event_1',
    provider: PaymentProvider.STRIPE,
    providerEventId: 'evt_1',
    eventType: 'payment_intent.succeeded',
    paymentId: 'payment_1',
    orderId: 'order_1',
    providerReference: 'pi_123',
    normalizedStatus: PaymentStatus.SUCCEEDED,
    verificationStatus: ProviderEventVerificationStatus.VERIFIED,
    processingStatus: ProviderEventProcessingStatus.PROCESSED,
    signatureHeader: 'v1=signature',
    headers: { 'stripe-signature': 'v1=signature' },
    rawPayload: { id: 'evt_1' },
    normalizedPayload: { paymentId: 'payment_1' },
    processingMetadata: null,
    failureCode: null,
    failureMessage: null,
    receivedAt: '2026-04-25T08:00:00.000Z',
    processedAt: '2026-04-25T08:01:00.000Z',
    failedAt: null,
    ignoredAt: null,
    createdAt: '2026-04-25T08:00:00.000Z',
    updatedAt: '2026-04-25T08:01:00.000Z',
    ...overrides,
  };
}

function makeRefundProviderEvent(
  overrides?: Partial<RefundProviderEventEntity>,
): RefundProviderEventEntity {
  return {
    refundProviderEventId: 'refund_provider_event_1',
    provider: PaymentProvider.STRIPE,
    providerEventId: 'evt_refund_1',
    eventType: 'refund.succeeded',
    refundId: 'refund_1',
    paymentId: 'payment_1',
    orderId: 'order_1',
    providerReference: 're_123',
    normalizedStatus: RefundStatus.SUCCEEDED,
    verificationStatus: ProviderEventVerificationStatus.VERIFIED,
    processingStatus: ProviderEventProcessingStatus.PROCESSED,
    signatureHeader: 'v1=signature',
    headers: { 'stripe-signature': 'v1=signature' },
    rawPayload: { id: 'evt_refund_1' },
    normalizedPayload: { refundId: 'refund_1' },
    processingMetadata: null,
    failureCode: null,
    failureMessage: null,
    receivedAt: '2026-04-25T09:00:00.000Z',
    processedAt: '2026-04-25T09:01:00.000Z',
    failedAt: null,
    ignoredAt: null,
    createdAt: '2026-04-25T09:00:00.000Z',
    updatedAt: '2026-04-25T09:01:00.000Z',
    ...overrides,
  };
}

function makeController() {
  const paymentProviderWebhookService = {
    ingestPaymentWebhook: jest
      .fn()
      .mockResolvedValue(
        makePaymentProviderEvent({
          processingStatus: ProviderEventProcessingStatus.RECEIVED,
          processedAt: null,
        }),
      ),
  } as unknown as jest.Mocked<PaymentProviderWebhookService>;
  const refundProviderWebhookService = {
    ingestRefundWebhook: jest
      .fn()
      .mockResolvedValue(
        makeRefundProviderEvent({
          processingStatus: ProviderEventProcessingStatus.RECEIVED,
          processedAt: null,
        }),
      ),
  } as unknown as jest.Mocked<RefundProviderWebhookService>;
  const providerWebhookSecretsService = {
    resolveSigningSecret: jest.fn().mockReturnValue('webhook-secret'),
  } as unknown as jest.Mocked<ProviderWebhookSecretsService>;
  const queueService = {
    add: jest.fn().mockResolvedValue({ id: 'job_1' }),
  } as unknown as jest.Mocked<QueueService>;

  return {
    controller: new ProviderWebhooksController(
      paymentProviderWebhookService,
      refundProviderWebhookService,
      providerWebhookSecretsService,
      queueService,
    ),
    paymentProviderWebhookService,
    refundProviderWebhookService,
    providerWebhookSecretsService,
    queueService,
  };
}

describe('ProviderWebhooksController', () => {
  it('is public so provider callbacks can bypass JWT authentication', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, ProviderWebhooksController)).toBe(
      true,
    );
  });

  it('ingests and queues payment provider webhooks', async () => {
    const {
      controller,
      paymentProviderWebhookService,
      providerWebhookSecretsService,
      queueService,
    } = makeController();
    const payload = {
      id: 'evt_1',
      type: 'payment_intent.succeeded',
    };

    const result = await controller.receivePaymentWebhook(
      PaymentProvider.STRIPE,
      payload,
      {
        'stripe-signature': 'v1=signature',
        'x-request-id': ['req_1', 'req_2'],
      },
      {
        rawBody: Buffer.from(JSON.stringify(payload)),
      } as never,
    );

    expect(providerWebhookSecretsService.resolveSigningSecret).toHaveBeenCalledWith(
      PaymentProvider.STRIPE,
      'payment',
    );
    expect(paymentProviderWebhookService.ingestPaymentWebhook).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: PaymentProvider.STRIPE,
        payload,
        rawBody: JSON.stringify(payload),
        signatureHeader: 'v1=signature',
        signingSecret: 'webhook-secret',
        headers: expect.objectContaining({
          'x-request-id': 'req_1,req_2',
        }),
      }),
    );
    expect(queueService.add).toHaveBeenCalledWith(
      'provider-webhooks',
      'process-payment-provider-event',
      {
        paymentProviderEventId: 'payment_provider_event_1',
      },
    );
    expect(result).toMatchObject({
      paymentProviderEventId: 'payment_provider_event_1',
      processingStatus: ProviderEventProcessingStatus.RECEIVED,
    });
  });

  it('ingests and queues refund provider webhooks', async () => {
    const {
      controller,
      refundProviderWebhookService,
      providerWebhookSecretsService,
      queueService,
    } = makeController();
    const payload = {
      id: 'evt_refund_1',
      type: 'refund.succeeded',
    };

    const result = await controller.receiveRefundWebhook(
      PaymentProvider.STRIPE,
      payload,
      {
        'x-webhook-signature': 'sha256=signature',
      },
      {
        rawBody: JSON.stringify(payload),
      } as never,
    );

    expect(providerWebhookSecretsService.resolveSigningSecret).toHaveBeenCalledWith(
      PaymentProvider.STRIPE,
      'refund',
    );
    expect(refundProviderWebhookService.ingestRefundWebhook).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: PaymentProvider.STRIPE,
        payload,
        rawBody: JSON.stringify(payload),
        signatureHeader: 'sha256=signature',
        signingSecret: 'webhook-secret',
      }),
    );
    expect(queueService.add).toHaveBeenCalledWith(
      'provider-webhooks',
      'process-refund-provider-event',
      {
        refundProviderEventId: 'refund_provider_event_1',
      },
    );
    expect(result).toMatchObject({
      refundProviderEventId: 'refund_provider_event_1',
      processingStatus: ProviderEventProcessingStatus.RECEIVED,
    });
  });
});

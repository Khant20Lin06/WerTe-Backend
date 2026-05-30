import {
  PaymentProvider,
  PaymentStatus,
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
} from '@prisma/client';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { PaymentsRepository } from '../../../../src/modules/payments/repositories/payments.repository';
import { PaymentProviderWebhookService } from '../../../../src/modules/payments/services/payment-provider-webhook.service';
import { ProviderWebhookNormalizerService } from '../../../../src/modules/payments/services/provider-webhook-normalizer.service';
import { ProviderWebhookSignatureService } from '../../../../src/modules/payments/services/provider-webhook-signature.service';

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

describe('PaymentProviderWebhookService', () => {
  const normalizer = new ProviderWebhookNormalizerService();

  it('persists verified payment provider webhooks with normalized fields', async () => {
    const paymentsRepository = {
      findPaymentProviderEventByProviderEventId: jest.fn().mockResolvedValue(null),
      createPaymentProviderEvent: jest
        .fn()
        .mockResolvedValue(makePaymentProviderEventRecord()),
    } as unknown as jest.Mocked<PaymentsRepository>;
    const signatureService = {
      verifySignature: jest.fn().mockReturnValue({
        status: ProviderEventVerificationStatus.VERIFIED,
        failureCode: null,
        failureMessage: null,
      }),
    } as unknown as jest.Mocked<ProviderWebhookSignatureService>;
    const service = new PaymentProviderWebhookService(
      paymentsRepository,
      normalizer,
      signatureService,
    );

    const result = await service.ingestPaymentWebhook({
      provider: PaymentProvider.STRIPE,
      payload: {
        id: 'evt_1',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            status: 'succeeded',
            metadata: {
              paymentId: 'payment_1',
              orderId: 'order_1',
            },
          },
        },
      },
      rawBody: '{"id":"evt_1"}',
      signatureHeader: 'v1=signature',
      signingSecret: 'secret_1',
      headers: { 'stripe-signature': 'v1=signature' },
      receivedAt: new Date('2026-04-25T08:00:00.000Z'),
    });

    expect(paymentsRepository.createPaymentProviderEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: PaymentProvider.STRIPE,
        providerEventId: 'evt_1',
        eventType: 'payment_intent.succeeded',
        paymentId: 'payment_1',
        orderId: 'order_1',
        providerReference: 'pi_123',
        normalizedStatus: PaymentStatus.SUCCEEDED,
        verificationStatus: ProviderEventVerificationStatus.VERIFIED,
        processingStatus: ProviderEventProcessingStatus.RECEIVED,
      }),
    );
    expect(result).toMatchObject({
      paymentProviderEventId: 'payment_provider_event_1',
      providerEventId: 'evt_1',
      normalizedStatus: PaymentStatus.SUCCEEDED,
    });
  });

  it('returns existing payment provider events for replayed provider event ids', async () => {
    const paymentsRepository = {
      findPaymentProviderEventByProviderEventId: jest
        .fn()
        .mockResolvedValue(makePaymentProviderEventRecord()),
      createPaymentProviderEvent: jest.fn(),
    } as unknown as jest.Mocked<PaymentsRepository>;
    const service = new PaymentProviderWebhookService(
      paymentsRepository,
      normalizer,
      {
        verifySignature: jest.fn().mockReturnValue({
          status: ProviderEventVerificationStatus.SKIPPED,
          failureCode: null,
          failureMessage: null,
        }),
      } as unknown as ProviderWebhookSignatureService,
    );

    const result = await service.ingestPaymentWebhook({
      provider: PaymentProvider.STRIPE,
      payload: {
        id: 'evt_1',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            metadata: { paymentId: 'payment_1' },
          },
        },
      },
    });

    expect(paymentsRepository.createPaymentProviderEvent).not.toHaveBeenCalled();
    expect(result.paymentProviderEventId).toBe('payment_provider_event_1');
  });

  it('persists failed verification details and rejects invalid signatures', async () => {
    const paymentsRepository = {
      findPaymentProviderEventByProviderEventId: jest.fn().mockResolvedValue(null),
      createPaymentProviderEvent: jest.fn().mockResolvedValue(
        makePaymentProviderEventRecord({
          verificationStatus: ProviderEventVerificationStatus.FAILED,
          processingStatus: ProviderEventProcessingStatus.FAILED,
          failureCode: 'invalid_signature',
          failedAt: new Date('2026-04-25T08:00:00.000Z'),
        }),
      ),
    } as unknown as jest.Mocked<PaymentsRepository>;
    const service = new PaymentProviderWebhookService(
      paymentsRepository,
      normalizer,
      {
        verifySignature: jest.fn().mockReturnValue({
          status: ProviderEventVerificationStatus.FAILED,
          failureCode: 'invalid_signature',
          failureMessage: 'Invalid signature',
        }),
      } as unknown as ProviderWebhookSignatureService,
    );

    await expect(
      service.ingestPaymentWebhook({
        provider: PaymentProvider.STRIPE,
        payload: { id: 'evt_1', type: 'payment.failed' },
        receivedAt: new Date('2026-04-25T08:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(AppException);
    expect(paymentsRepository.createPaymentProviderEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        verificationStatus: ProviderEventVerificationStatus.FAILED,
        processingStatus: ProviderEventProcessingStatus.FAILED,
        failureCode: 'invalid_signature',
        failedAt: new Date('2026-04-25T08:00:00.000Z'),
      }),
    );
  });
});

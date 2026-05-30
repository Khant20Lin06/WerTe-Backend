import { PaymentProvider, PaymentStatus, RefundStatus } from '@prisma/client';

import { ProviderWebhookNormalizerService } from '../../../../src/modules/payments/services/provider-webhook-normalizer.service';

describe('ProviderWebhookNormalizerService', () => {
  it('normalizes payment provider callbacks into a stable payment event shape', () => {
    const service = new ProviderWebhookNormalizerService();

    const result = service.normalizePaymentEvent({
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
    });

    expect(result).toMatchObject({
      providerEventId: 'evt_1',
      eventType: 'payment_intent.succeeded',
      paymentId: 'payment_1',
      orderId: 'order_1',
      providerReference: 'pi_123',
      normalizedStatus: PaymentStatus.SUCCEEDED,
    });
  });

  it('normalizes refund provider callbacks into a stable refund event shape', () => {
    const service = new ProviderWebhookNormalizerService();

    const result = service.normalizeRefundEvent({
      provider: PaymentProvider.STRIPE,
      payload: {
        id: 'evt_refund_1',
        type: 'refund.failed',
        data: {
          object: {
            id: 're_123',
            status: 'failed',
            metadata: {
              refundId: 'refund_1',
              paymentId: 'payment_1',
              orderId: 'order_1',
            },
          },
        },
      },
    });

    expect(result).toMatchObject({
      providerEventId: 'evt_refund_1',
      eventType: 'refund.failed',
      refundId: 'refund_1',
      paymentId: 'payment_1',
      orderId: 'order_1',
      providerReference: 're_123',
      normalizedStatus: RefundStatus.FAILED,
    });
  });
});

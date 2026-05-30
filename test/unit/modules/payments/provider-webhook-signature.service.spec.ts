import { createHmac } from 'node:crypto';
import {
  PaymentProvider,
  ProviderEventVerificationStatus,
} from '@prisma/client';

import { ProviderWebhookSignatureService } from '../../../../src/modules/payments/services/provider-webhook-signature.service';

describe('ProviderWebhookSignatureService', () => {
  it('skips verification when no signing secret is configured', () => {
    const service = new ProviderWebhookSignatureService();

    expect(
      service.verifySignature({
        provider: PaymentProvider.STRIPE,
        rawBody: '{"id":"evt_1"}',
      }),
    ).toEqual({
      status: ProviderEventVerificationStatus.SKIPPED,
      failureCode: null,
      failureMessage: null,
    });
  });

  it('verifies sha256 HMAC signatures from common provider header formats', () => {
    const service = new ProviderWebhookSignatureService();
    const rawBody = '{"id":"evt_1"}';
    const signature = createHmac('sha256', 'secret_1')
      .update(rawBody)
      .digest('hex');

    expect(
      service.verifySignature({
        provider: PaymentProvider.STRIPE,
        rawBody,
        signatureHeader: `t=123,v1=${signature}`,
        signingSecret: 'secret_1',
      }),
    ).toMatchObject({
      status: ProviderEventVerificationStatus.VERIFIED,
      failureCode: null,
    });
  });

  it('fails verification when the signature is missing or invalid', () => {
    const service = new ProviderWebhookSignatureService();

    expect(
      service.verifySignature({
        provider: PaymentProvider.STRIPE,
        rawBody: '{"id":"evt_1"}',
        signingSecret: 'secret_1',
      }),
    ).toMatchObject({
      status: ProviderEventVerificationStatus.FAILED,
      failureCode: 'missing_signature',
    });
    expect(
      service.verifySignature({
        provider: PaymentProvider.STRIPE,
        rawBody: '{"id":"evt_1"}',
        signatureHeader: 'sha256=bad',
        signingSecret: 'secret_1',
      }),
    ).toMatchObject({
      status: ProviderEventVerificationStatus.FAILED,
      failureCode: 'missing_signature',
    });
  });
});

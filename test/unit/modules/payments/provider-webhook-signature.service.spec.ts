import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import {
  PaymentProvider,
  ProviderEventVerificationStatus,
} from '@prisma/client';

import { ProviderWebhookSignatureService } from '../../../../src/modules/payments/services/provider-webhook-signature.service';

describe('ProviderWebhookSignatureService', () => {
  const makeService = (nodeEnv: string) => {
    const configService = {
      get: jest.fn().mockReturnValue(nodeEnv),
    } as unknown as ConfigService;
    return new ProviderWebhookSignatureService(configService);
  };

  describe('when NODE_ENV !== production', () => {
    it('skips verification when no signing secret is configured', () => {
      const service = makeService('development');

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
  });

  describe('when NODE_ENV === production', () => {
    it('fails verification when signing secret is not configured', () => {
      const service = makeService('production');

      expect(
        service.verifySignature({
          provider: PaymentProvider.STRIPE,
          rawBody: '{"id":"evt_1"}',
        }),
      ).toMatchObject({
        status: ProviderEventVerificationStatus.FAILED,
        failureCode: 'signing_secret_not_configured',
      });
    });
  });

  it('verifies sha256 HMAC signatures from common provider header formats', () => {
    const service = makeService('development');
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

  it('fails when the signature header is missing', () => {
    const service = makeService('development');

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
  });

  it('fails when the signature header contains no valid hex-64 candidate', () => {
    const service = makeService('development');

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

  it('fails when the HMAC does not match', () => {
    const service = makeService('development');

    const validHex = 'a'.repeat(64);
    expect(
      service.verifySignature({
        provider: PaymentProvider.STRIPE,
        rawBody: '{"id":"evt_1"}',
        signatureHeader: `v1=${validHex}`,
        signingSecret: 'wrong_secret',
      }),
    ).toMatchObject({
      status: ProviderEventVerificationStatus.FAILED,
      failureCode: 'invalid_signature',
    });
  });
});

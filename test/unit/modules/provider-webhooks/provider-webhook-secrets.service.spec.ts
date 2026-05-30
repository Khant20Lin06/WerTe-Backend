import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '@prisma/client';

import { ProviderWebhookSecretsService } from '../../../../src/modules/provider-webhooks/services/provider-webhook-secrets.service';

describe('ProviderWebhookSecretsService', () => {
  it('prefers provider and event-kind specific signing secrets', () => {
    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          STRIPE_PAYMENT_WEBHOOK_SIGNING_SECRET: 'stripe-payment-secret',
          STRIPE_WEBHOOK_SIGNING_SECRET: 'stripe-shared-secret',
          PAYMENT_WEBHOOK_SIGNING_SECRET: 'payment-shared-secret',
          PROVIDER_WEBHOOK_SIGNING_SECRET: 'global-secret',
        };

        return values[key];
      }),
    } as unknown as jest.Mocked<ConfigService>;
    const service = new ProviderWebhookSecretsService(configService);

    expect(
      service.resolveSigningSecret(PaymentProvider.STRIPE, 'payment'),
    ).toBe('stripe-payment-secret');
  });

  it('falls back to provider, kind, then global signing secrets', () => {
    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          STRIPE_WEBHOOK_SIGNING_SECRET: 'stripe-shared-secret',
          REFUND_WEBHOOK_SIGNING_SECRET: 'refund-shared-secret',
          PROVIDER_WEBHOOK_SIGNING_SECRET: 'global-secret',
        };

        return values[key];
      }),
    } as unknown as jest.Mocked<ConfigService>;
    const service = new ProviderWebhookSecretsService(configService);

    expect(service.resolveSigningSecret(PaymentProvider.STRIPE, 'refund')).toBe(
      'stripe-shared-secret',
    );
    expect(service.resolveSigningSecret(PaymentProvider.KBZ_PAY, 'refund')).toBe(
      'refund-shared-secret',
    );
  });

  it('returns null when no usable signing secret is configured', () => {
    const configService = {
      get: jest.fn(() => ''),
    } as unknown as jest.Mocked<ConfigService>;
    const service = new ProviderWebhookSecretsService(configService);

    expect(service.resolveSigningSecret(PaymentProvider.STRIPE, 'payment')).toBeNull();
  });
});

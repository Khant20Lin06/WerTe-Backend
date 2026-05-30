import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '@prisma/client';

type ProviderWebhookKind = 'payment' | 'refund';

@Injectable()
export class ProviderWebhookSecretsService {
  constructor(private readonly configService: ConfigService) {}

  resolveSigningSecret(
    provider: PaymentProvider,
    kind: ProviderWebhookKind,
  ): string | null {
    const providerKey = provider.toUpperCase();
    const kindKey = kind.toUpperCase();
    const candidates = [
      `${providerKey}_${kindKey}_WEBHOOK_SIGNING_SECRET`,
      `${kindKey}_${providerKey}_WEBHOOK_SIGNING_SECRET`,
      `${providerKey}_WEBHOOK_SIGNING_SECRET`,
      `${kindKey}_WEBHOOK_SIGNING_SECRET`,
      'PROVIDER_WEBHOOK_SIGNING_SECRET',
    ];

    for (const key of candidates) {
      const value = this.configService.get<string>(key);

      if (value !== undefined && value.trim() !== '') {
        return value;
      }
    }

    return null;
  }
}

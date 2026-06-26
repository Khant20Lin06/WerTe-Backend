import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '@prisma/client';
type ProviderWebhookKind = 'payment' | 'refund';
export declare class ProviderWebhookSecretsService {
    private readonly configService;
    constructor(configService: ConfigService);
    resolveSigningSecret(provider: PaymentProvider, kind: ProviderWebhookKind): string | null;
}
export {};

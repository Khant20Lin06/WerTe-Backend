"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const provider_webhook_secrets_service_1 = require("../../../../src/modules/provider-webhooks/services/provider-webhook-secrets.service");
describe('ProviderWebhookSecretsService', () => {
    it('prefers provider and event-kind specific signing secrets', () => {
        const configService = {
            get: jest.fn((key) => {
                const values = {
                    STRIPE_PAYMENT_WEBHOOK_SIGNING_SECRET: 'stripe-payment-secret',
                    STRIPE_WEBHOOK_SIGNING_SECRET: 'stripe-shared-secret',
                    PAYMENT_WEBHOOK_SIGNING_SECRET: 'payment-shared-secret',
                    PROVIDER_WEBHOOK_SIGNING_SECRET: 'global-secret',
                };
                return values[key];
            }),
        };
        const service = new provider_webhook_secrets_service_1.ProviderWebhookSecretsService(configService);
        expect(service.resolveSigningSecret(client_1.PaymentProvider.STRIPE, 'payment')).toBe('stripe-payment-secret');
    });
    it('falls back to provider, kind, then global signing secrets', () => {
        const configService = {
            get: jest.fn((key) => {
                const values = {
                    STRIPE_WEBHOOK_SIGNING_SECRET: 'stripe-shared-secret',
                    REFUND_WEBHOOK_SIGNING_SECRET: 'refund-shared-secret',
                    PROVIDER_WEBHOOK_SIGNING_SECRET: 'global-secret',
                };
                return values[key];
            }),
        };
        const service = new provider_webhook_secrets_service_1.ProviderWebhookSecretsService(configService);
        expect(service.resolveSigningSecret(client_1.PaymentProvider.STRIPE, 'refund')).toBe('stripe-shared-secret');
        expect(service.resolveSigningSecret(client_1.PaymentProvider.KBZ_PAY, 'refund')).toBe('refund-shared-secret');
    });
    it('returns null when no usable signing secret is configured', () => {
        const configService = {
            get: jest.fn(() => ''),
        };
        const service = new provider_webhook_secrets_service_1.ProviderWebhookSecretsService(configService);
        expect(service.resolveSigningSecret(client_1.PaymentProvider.STRIPE, 'payment')).toBeNull();
    });
});
//# sourceMappingURL=provider-webhook-secrets.service.spec.js.map
import { PaymentProvider } from '@prisma/client';
import type { Request } from 'express';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { PaymentProviderWebhookService } from '../../payments/services/payment-provider-webhook.service';
import { RefundProviderWebhookService } from '../../refunds/services/refund-provider-webhook.service';
import { ProviderWebhookSecretsService } from '../services/provider-webhook-secrets.service';
type RawBodyRequest = Request & {
    rawBody?: Buffer | string;
};
export declare class ProviderWebhooksController {
    private readonly paymentProviderWebhookService;
    private readonly refundProviderWebhookService;
    private readonly providerWebhookSecretsService;
    private readonly queueService;
    constructor(paymentProviderWebhookService: PaymentProviderWebhookService, refundProviderWebhookService: RefundProviderWebhookService, providerWebhookSecretsService: ProviderWebhookSecretsService, queueService: QueueService);
    receivePaymentWebhook(provider: PaymentProvider, body: unknown, headers: Record<string, string | string[] | undefined>, request: RawBodyRequest): Promise<import("../../payments/entities/payment-provider-event.entity").PaymentProviderEventEntity>;
    receiveRefundWebhook(provider: PaymentProvider, body: unknown, headers: Record<string, string | string[] | undefined>, request: RawBodyRequest): Promise<import("../../refunds/entities/refund-provider-event.entity").RefundProviderEventEntity>;
    private readRawBody;
    private readSignatureHeader;
    private readHeader;
    private normalizeHeaders;
    private toInputJson;
}
export {};

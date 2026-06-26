import { PaymentProvider, Prisma } from '@prisma/client';
import { PaymentProviderEventEntity } from '../entities/payment-provider-event.entity';
import { PaymentsRepository } from '../repositories/payments.repository';
import { ProviderWebhookNormalizerService } from './provider-webhook-normalizer.service';
import { ProviderWebhookSignatureService } from './provider-webhook-signature.service';
type IngestPaymentProviderWebhookInput = {
    provider: PaymentProvider;
    payload: Prisma.InputJsonValue;
    rawBody?: string;
    headers?: Prisma.InputJsonValue;
    signatureHeader?: string | null;
    signingSecret?: string | null;
    receivedAt?: Date;
};
export declare class PaymentProviderWebhookService {
    private readonly paymentsRepository;
    private readonly normalizer;
    private readonly signatureService;
    constructor(paymentsRepository: PaymentsRepository, normalizer: ProviderWebhookNormalizerService, signatureService: ProviderWebhookSignatureService);
    ingestPaymentWebhook(input: IngestPaymentProviderWebhookInput): Promise<PaymentProviderEventEntity>;
    private findExistingEvent;
    private throwInvalidSignature;
}
export {};

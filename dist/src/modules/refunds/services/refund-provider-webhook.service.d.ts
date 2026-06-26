import { PaymentProvider, Prisma } from '@prisma/client';
import { ProviderWebhookNormalizerService } from '../../payments/services/provider-webhook-normalizer.service';
import { ProviderWebhookSignatureService } from '../../payments/services/provider-webhook-signature.service';
import { RefundProviderEventEntity } from '../entities/refund-provider-event.entity';
import { RefundsRepository } from '../repositories/refunds.repository';
type IngestRefundProviderWebhookInput = {
    provider: PaymentProvider;
    payload: Prisma.InputJsonValue;
    rawBody?: string;
    headers?: Prisma.InputJsonValue;
    signatureHeader?: string | null;
    signingSecret?: string | null;
    receivedAt?: Date;
};
export declare class RefundProviderWebhookService {
    private readonly refundsRepository;
    private readonly normalizer;
    private readonly signatureService;
    constructor(refundsRepository: RefundsRepository, normalizer: ProviderWebhookNormalizerService, signatureService: ProviderWebhookSignatureService);
    ingestRefundWebhook(input: IngestRefundProviderWebhookInput): Promise<RefundProviderEventEntity>;
    private findExistingEvent;
    private throwInvalidSignature;
}
export {};

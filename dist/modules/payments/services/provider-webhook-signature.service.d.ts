import { ConfigService } from '@nestjs/config';
import { PaymentProvider, ProviderEventVerificationStatus } from '@prisma/client';
type VerifyProviderWebhookSignatureInput = {
    provider: PaymentProvider;
    rawBody: string;
    signatureHeader?: string | null;
    signingSecret?: string | null;
};
export type ProviderWebhookSignatureVerificationResult = {
    status: ProviderEventVerificationStatus;
    failureCode: string | null;
    failureMessage: string | null;
};
export declare class ProviderWebhookSignatureService {
    private readonly configService;
    constructor(configService: ConfigService);
    verifySignature(input: VerifyProviderWebhookSignatureInput): ProviderWebhookSignatureVerificationResult;
    private extractSignatureCandidates;
    private safeCompareHex;
}
export {};

import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  PaymentProvider,
  ProviderEventVerificationStatus,
} from '@prisma/client';

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

@Injectable()
export class ProviderWebhookSignatureService {
  verifySignature(
    input: VerifyProviderWebhookSignatureInput,
  ): ProviderWebhookSignatureVerificationResult {
    if (input.signingSecret === undefined || input.signingSecret === null) {
      return {
        status: ProviderEventVerificationStatus.SKIPPED,
        failureCode: null,
        failureMessage: null,
      };
    }

    const signatures = this.extractSignatureCandidates(input.signatureHeader);

    if (signatures.length === 0) {
      return {
        status: ProviderEventVerificationStatus.FAILED,
        failureCode: 'missing_signature',
        failureMessage: `${input.provider} webhook signature header is missing.`,
      };
    }

    const expectedSignature = createHmac('sha256', input.signingSecret)
      .update(input.rawBody)
      .digest('hex');

    const verified = signatures.some((signature) =>
      this.safeCompareHex(signature, expectedSignature),
    );

    if (!verified) {
      return {
        status: ProviderEventVerificationStatus.FAILED,
        failureCode: 'invalid_signature',
        failureMessage: `${input.provider} webhook signature could not be verified.`,
      };
    }

    return {
      status: ProviderEventVerificationStatus.VERIFIED,
      failureCode: null,
      failureMessage: null,
    };
  }

  private extractSignatureCandidates(
    signatureHeader: string | null | undefined,
  ): string[] {
    if (signatureHeader === undefined || signatureHeader === null) {
      return [];
    }

    return signatureHeader
      .split(',')
      .map((part) => part.trim())
      .map((part) => {
        const [, value] = part.split('=', 2);
        return (value ?? part).trim().replace(/^"|"$/g, '');
      })
      .filter((value) => /^[a-f0-9]{64}$/i.test(value));
  }

  private safeCompareHex(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left, 'hex');
    const rightBuffer = Buffer.from(right, 'hex');

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }
}

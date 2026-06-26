import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  constructor(private readonly configService: ConfigService) {}

  verifySignature(
    input: VerifyProviderWebhookSignatureInput,
  ): ProviderWebhookSignatureVerificationResult {
    if (input.signingSecret === undefined || input.signingSecret === null) {
      // Allow skipping only outside production so local/test environments work
      // without secrets configured. In production a missing secret is a
      // misconfiguration — treat it as a verification failure so unsigned
      // webhooks are never silently accepted.
      const isProduction =
        this.configService.get<string>('NODE_ENV') === 'production';

      if (isProduction) {
        return {
          status: ProviderEventVerificationStatus.FAILED,
          failureCode: 'signing_secret_not_configured',
          failureMessage: `${input.provider} webhook signing secret is not configured.`,
        };
      }

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

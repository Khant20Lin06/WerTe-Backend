import { HttpStatus, Injectable } from '@nestjs/common';
import {
  PaymentProvider,
  Prisma,
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { ProviderWebhookNormalizerService } from '../../payments/services/provider-webhook-normalizer.service';
import { ProviderWebhookSignatureService } from '../../payments/services/provider-webhook-signature.service';
import {
  buildRefundProviderEventEntity,
  RefundProviderEventEntity,
} from '../entities/refund-provider-event.entity';
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

@Injectable()
export class RefundProviderWebhookService {
  constructor(
    private readonly refundsRepository: RefundsRepository,
    private readonly normalizer: ProviderWebhookNormalizerService,
    private readonly signatureService: ProviderWebhookSignatureService,
  ) {}

  async ingestRefundWebhook(
    input: IngestRefundProviderWebhookInput,
  ): Promise<RefundProviderEventEntity> {
    const rawBody = input.rawBody ?? JSON.stringify(input.payload);
    const normalized = this.normalizer.normalizeRefundEvent({
      provider: input.provider,
      payload: input.payload,
    });
    const verification = this.signatureService.verifySignature({
      provider: input.provider,
      rawBody,
      signatureHeader: input.signatureHeader,
      signingSecret: input.signingSecret,
    });

    const existingEvent = await this.findExistingEvent(
      input.provider,
      normalized.providerEventId,
    );

    if (existingEvent !== null) {
      if (verification.status === ProviderEventVerificationStatus.FAILED) {
        this.throwInvalidSignature(verification.failureMessage);
      }

      return buildRefundProviderEventEntity(existingEvent);
    }

    const failedAt =
      verification.status === ProviderEventVerificationStatus.FAILED
        ? input.receivedAt ?? new Date()
        : null;
    const event = await this.refundsRepository.createRefundProviderEvent({
      provider: input.provider,
      providerEventId: normalized.providerEventId,
      eventType: normalized.eventType,
      refundId: normalized.refundId,
      paymentId: normalized.paymentId,
      orderId: normalized.orderId,
      providerReference: normalized.providerReference,
      normalizedStatus: normalized.normalizedStatus,
      verificationStatus: verification.status,
      processingStatus:
        verification.status === ProviderEventVerificationStatus.FAILED
          ? ProviderEventProcessingStatus.FAILED
          : ProviderEventProcessingStatus.RECEIVED,
      signatureHeader: input.signatureHeader ?? null,
      headersJson: input.headers,
      rawPayloadJson: input.payload,
      normalizedPayloadJson: normalized.normalizedPayloadJson,
      failureCode: verification.failureCode,
      failureMessage: verification.failureMessage,
      receivedAt: input.receivedAt,
      failedAt,
    });

    if (verification.status === ProviderEventVerificationStatus.FAILED) {
      this.throwInvalidSignature(verification.failureMessage);
    }

    return buildRefundProviderEventEntity(event);
  }

  private findExistingEvent(
    provider: PaymentProvider,
    providerEventId: string | null,
  ) {
    if (providerEventId === null) {
      return Promise.resolve(null);
    }

    return this.refundsRepository.findRefundProviderEventByProviderEventId(
      provider,
      providerEventId,
    );
  }

  private throwInvalidSignature(message: string | null): never {
    throw new AppException(
      message ?? 'Refund provider webhook signature is invalid.',
      HttpStatus.UNAUTHORIZED,
      {
        code: ErrorCodes.unauthorized,
      },
    );
  }
}

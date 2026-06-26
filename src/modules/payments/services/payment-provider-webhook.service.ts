import { HttpStatus, Injectable } from '@nestjs/common';
import {
  PaymentProvider,
  Prisma,
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import {
  buildPaymentProviderEventEntity,
  PaymentProviderEventEntity,
} from '../entities/payment-provider-event.entity';
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

@Injectable()
export class PaymentProviderWebhookService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly normalizer: ProviderWebhookNormalizerService,
    private readonly signatureService: ProviderWebhookSignatureService,
  ) {}

  async ingestPaymentWebhook(
    input: IngestPaymentProviderWebhookInput,
  ): Promise<PaymentProviderEventEntity> {
    const rawBody = input.rawBody ?? JSON.stringify(input.payload);
    const normalized = this.normalizer.normalizePaymentEvent({
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

    const isRejected =
      verification.status === ProviderEventVerificationStatus.FAILED;

    if (existingEvent !== null) {
      if (isRejected) {
        this.throwInvalidSignature(verification.failureMessage);
      }

      return buildPaymentProviderEventEntity(existingEvent);
    }

    const failedAt = isRejected ? input.receivedAt ?? new Date() : null;
    const event = await this.paymentsRepository.createPaymentProviderEvent({
      provider: input.provider,
      providerEventId: normalized.providerEventId,
      eventType: normalized.eventType,
      paymentId: normalized.paymentId,
      orderId: normalized.orderId,
      providerReference: normalized.providerReference,
      normalizedStatus: normalized.normalizedStatus,
      verificationStatus: verification.status,
      processingStatus: isRejected
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

    if (isRejected) {
      this.throwInvalidSignature(verification.failureMessage);
    }

    return buildPaymentProviderEventEntity(event);
  }

  private findExistingEvent(
    provider: PaymentProvider,
    providerEventId: string | null,
  ) {
    if (providerEventId === null) {
      return Promise.resolve(null);
    }

    return this.paymentsRepository.findPaymentProviderEventByProviderEventId(
      provider,
      providerEventId,
    );
  }

  private throwInvalidSignature(message: string | null): never {
    throw new AppException(
      message ?? 'Payment provider webhook signature is invalid.',
      HttpStatus.UNAUTHORIZED,
      {
        code: ErrorCodes.unauthorized,
      },
    );
  }
}

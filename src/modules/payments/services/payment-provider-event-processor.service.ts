import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  PaymentStatus,
  Prisma,
  ProviderEventProcessingStatus,
  UserRole,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { createSystemAuthenticatedActor } from '../../auth/entities/system-authenticated-actor.helper';
import {
  isProviderEventVerifiedForProcessing,
  shouldProcessProviderEvent,
} from '../../provider-webhooks/policies/provider-event-processing-policy.helper';
import {
  buildPaymentProviderEventEntity,
  PaymentProviderEventEntity,
  PaymentProviderEventRecord,
} from '../entities/payment-provider-event.entity';
import {
  PaymentSummaryEntity,
  PaymentSummaryRecord,
} from '../entities/payment-summary.entity';
import { PaymentsRepository } from '../repositories/payments.repository';
import { PaymentLifecycleService } from './payment-lifecycle.service';

type ProcessPaymentProviderEventInput = {
  paymentProviderEventId: string;
  occurredAt?: Date;
  retryTerminal?: boolean;
};

type LifecycleAction = 'confirm' | 'fail' | 'cancel' | 'expire';

const PAYMENT_WEBHOOK_SYSTEM_ACTOR = createSystemAuthenticatedActor(
  'payment-provider-webhook',
  UserRole.SUPPORT,
);

@Injectable()
export class PaymentProviderEventProcessorService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentLifecycleService: PaymentLifecycleService,
  ) {}

  async processPaymentProviderEvent(
    input: ProcessPaymentProviderEventInput,
  ): Promise<PaymentProviderEventEntity> {
    const event = await this.paymentsRepository.findPaymentProviderEventById(
      input.paymentProviderEventId,
    );

    if (event === null) {
      throw new AppException(
        'Payment provider event was not found.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    const occurredAt = input.occurredAt ?? new Date();

    if (
      !shouldProcessProviderEvent({
        processingStatus: event.processingStatus,
        retryTerminal: input.retryTerminal,
      })
    ) {
      return buildPaymentProviderEventEntity(event);
    }

    if (!isProviderEventVerifiedForProcessing(event.verificationStatus)) {
      return this.markFailed(event, {
        failureCode: 'provider_event_not_verified',
        failureMessage:
          'Payment provider event must be verified before lifecycle processing.',
        occurredAt,
      });
    }

    const lifecycleAction = this.resolveLifecycleAction(event.normalizedStatus);

    if (lifecycleAction === null) {
      return this.markIgnored(event, {
        failureCode: 'non_terminal_payment_status',
        failureMessage:
          'Payment provider event does not contain a terminal payment status.',
        occurredAt,
      });
    }

    const payment = await this.resolvePayment(event);

    if (payment === null) {
      return this.markIgnored(event, {
        failureCode: 'payment_not_matched',
        failureMessage:
          'Payment provider event could not be matched to an existing payment.',
        occurredAt,
      });
    }

    if (payment.provider !== event.provider) {
      return this.markFailed(event, {
        failureCode: 'payment_provider_mismatch',
        failureMessage:
          'Payment provider event provider does not match the linked payment provider.',
        occurredAt,
        payment,
      });
    }

    try {
      const paymentSummary = await this.applyLifecycleAction(
        event,
        payment.id,
        lifecycleAction,
      );

      return this.markProcessed(event, {
        occurredAt,
        paymentSummary,
      });
    } catch (error) {
      await this.markFailed(event, {
        failureCode: this.readFailureCode(error),
        failureMessage: this.readFailureMessage(error),
        occurredAt,
        payment,
      });

      throw error;
    }
  }

  private resolveLifecycleAction(
    status: PaymentStatus | null,
  ): LifecycleAction | null {
    switch (status) {
      case PaymentStatus.SUCCEEDED:
        return 'confirm';
      case PaymentStatus.FAILED:
        return 'fail';
      case PaymentStatus.CANCELLED:
        return 'cancel';
      case PaymentStatus.EXPIRED:
        return 'expire';
      default:
        return null;
    }
  }

  private async resolvePayment(
    event: PaymentProviderEventRecord,
  ): Promise<PaymentSummaryRecord | null> {
    if (event.paymentId !== null) {
      const payment = await this.paymentsRepository.findById(event.paymentId);

      if (payment !== null) {
        return payment;
      }
    }

    if (event.providerReference === null) {
      return null;
    }

    return this.paymentsRepository.findLatestByProviderReference(
      event.provider,
      event.providerReference,
    );
  }

  private applyLifecycleAction(
    event: PaymentProviderEventRecord,
    paymentId: string,
    lifecycleAction: LifecycleAction,
  ): Promise<PaymentSummaryEntity> {
    const lifecycleInput = {
      paymentId,
      providerReference: event.providerReference,
      reasonCode: this.buildReasonCode(event),
      note: this.buildLifecycleNote(event),
      failureCode:
        lifecycleAction === 'fail'
          ? event.failureCode ?? 'provider_payment_failed'
          : null,
      failureMessage:
        lifecycleAction === 'fail'
          ? event.failureMessage ?? 'Provider reported payment failure.'
          : null,
      metadata: this.buildLifecycleMetadata(event),
      requestPayloadJson: this.toOptionalInputJson(event.normalizedPayloadJson),
      responsePayloadJson: this.toOptionalInputJson(event.rawPayloadJson),
    };
    const options = {
      skipAdminFinanceAccess: true,
    };

    switch (lifecycleAction) {
      case 'confirm':
        return this.paymentLifecycleService.confirmCurrentPayment(
          PAYMENT_WEBHOOK_SYSTEM_ACTOR,
          lifecycleInput,
          options,
        );
      case 'fail':
        return this.paymentLifecycleService.failCurrentPayment(
          PAYMENT_WEBHOOK_SYSTEM_ACTOR,
          lifecycleInput,
          options,
        );
      case 'cancel':
        return this.paymentLifecycleService.cancelCurrentPayment(
          PAYMENT_WEBHOOK_SYSTEM_ACTOR,
          lifecycleInput,
          options,
        );
      case 'expire':
        return this.paymentLifecycleService.expireCurrentPayment(
          PAYMENT_WEBHOOK_SYSTEM_ACTOR,
          lifecycleInput,
          options,
        );
    }
  }

  private async markProcessed(
    event: PaymentProviderEventRecord,
    input: {
      occurredAt: Date;
      paymentSummary: PaymentSummaryEntity;
    },
  ): Promise<PaymentProviderEventEntity> {
    const updatedEvent =
      await this.paymentsRepository.updatePaymentProviderEventProcessingState({
        paymentProviderEventId: event.id,
        processingStatus: ProviderEventProcessingStatus.PROCESSED,
        paymentId: input.paymentSummary.paymentId,
        orderId: input.paymentSummary.orderId,
        providerReference:
          input.paymentSummary.providerReference ?? event.providerReference,
        processingMetadataJson: this.buildProcessingMetadata(event, {
          outcome: 'processed',
          paymentId: input.paymentSummary.paymentId,
          orderId: input.paymentSummary.orderId,
          paymentStatus: input.paymentSummary.status,
          orderStatus: input.paymentSummary.order.status,
          processedAt: input.occurredAt.toISOString(),
        }),
        occurredAt: input.occurredAt,
      });

    return buildPaymentProviderEventEntity(updatedEvent);
  }

  private async markIgnored(
    event: PaymentProviderEventRecord,
    input: {
      failureCode: string;
      failureMessage: string;
      occurredAt: Date;
    },
  ): Promise<PaymentProviderEventEntity> {
    const updatedEvent =
      await this.paymentsRepository.updatePaymentProviderEventProcessingState({
        paymentProviderEventId: event.id,
        processingStatus: ProviderEventProcessingStatus.IGNORED,
        processingMetadataJson: this.buildProcessingMetadata(event, {
          outcome: 'ignored',
          failureCode: input.failureCode,
          failureMessage: input.failureMessage,
          ignoredAt: input.occurredAt.toISOString(),
        }),
        failureCode: input.failureCode,
        failureMessage: input.failureMessage,
        occurredAt: input.occurredAt,
      });

    return buildPaymentProviderEventEntity(updatedEvent);
  }

  private async markFailed(
    event: PaymentProviderEventRecord,
    input: {
      failureCode: string;
      failureMessage: string;
      occurredAt: Date;
      payment?: PaymentSummaryRecord;
    },
  ): Promise<PaymentProviderEventEntity> {
    const updatedEvent =
      await this.paymentsRepository.updatePaymentProviderEventProcessingState({
        paymentProviderEventId: event.id,
        processingStatus: ProviderEventProcessingStatus.FAILED,
        paymentId: input.payment?.id,
        orderId: input.payment?.orderId,
        providerReference: input.payment?.providerReference ?? event.providerReference,
        processingMetadataJson: this.buildProcessingMetadata(event, {
          outcome: 'failed',
          failureCode: input.failureCode,
          failureMessage: input.failureMessage,
          failedAt: input.occurredAt.toISOString(),
          paymentId: input.payment?.id ?? event.paymentId,
          orderId: input.payment?.orderId ?? event.orderId,
        }),
        failureCode: input.failureCode,
        failureMessage: input.failureMessage,
        occurredAt: input.occurredAt,
      });

    return buildPaymentProviderEventEntity(updatedEvent);
  }

  private buildLifecycleMetadata(
    event: PaymentProviderEventRecord,
  ): Prisma.InputJsonValue {
    return {
      providerWebhook: true,
      paymentProviderEventId: event.id,
      providerEventId: event.providerEventId,
      eventType: event.eventType,
      provider: event.provider,
      normalizedStatus: event.normalizedStatus,
      receivedAt: event.receivedAt.toISOString(),
    };
  }

  private buildProcessingMetadata(
    event: PaymentProviderEventRecord,
    nextMetadata: Record<string, Prisma.JsonValue | Prisma.InputJsonValue>,
  ): Prisma.InputJsonValue {
    return {
      ...(this.asJsonObject(event.processingMetadataJson) ?? {}),
      processor: 'payment_webhook_lifecycle',
      provider: event.provider,
      providerEventId: event.providerEventId,
      eventType: event.eventType,
      normalizedStatus: event.normalizedStatus,
      ...nextMetadata,
    };
  }

  private buildReasonCode(event: PaymentProviderEventRecord): string {
    switch (event.normalizedStatus) {
      case PaymentStatus.SUCCEEDED:
        return 'provider_payment_succeeded';
      case PaymentStatus.FAILED:
        return event.failureCode ?? 'provider_payment_failed';
      case PaymentStatus.CANCELLED:
        return 'provider_payment_cancelled';
      case PaymentStatus.EXPIRED:
        return 'provider_payment_expired';
      default:
        return 'provider_payment_event';
    }
  }

  private buildLifecycleNote(event: PaymentProviderEventRecord): string | null {
    switch (event.normalizedStatus) {
      case PaymentStatus.FAILED:
        return event.failureMessage ?? 'Provider reported payment failure.';
      case PaymentStatus.CANCELLED:
        return 'Provider reported payment cancellation.';
      case PaymentStatus.EXPIRED:
        return 'Provider reported payment expiration.';
      default:
        return null;
    }
  }

  private toOptionalInputJson(
    value: Prisma.JsonValue | null,
  ): Prisma.InputJsonValue | undefined {
    if (value === null) {
      return undefined;
    }

    return value as Prisma.InputJsonValue;
  }

  private readFailureCode(error: unknown): string {
    if (error instanceof HttpException) {
      const response = error.getResponse();

      if (
        response !== null &&
        typeof response === 'object' &&
        'code' in response &&
        typeof response.code === 'string'
      ) {
        return response.code;
      }
    }

    return 'payment_webhook_processing_failed';
  }

  private readFailureMessage(error: unknown): string {
    if (error instanceof HttpException) {
      const response = error.getResponse();

      if (
        response !== null &&
        typeof response === 'object' &&
        'message' in response &&
        typeof response.message === 'string'
      ) {
        return response.message;
      }
    }

    if (error instanceof Error && error.message.trim() !== '') {
      return error.message;
    }

    return 'Payment provider event could not be processed.';
  }

  private asJsonObject(
    value: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
  ): Record<string, Prisma.JsonValue | Prisma.InputJsonValue> | null {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as Record<string, Prisma.JsonValue | Prisma.InputJsonValue>;
  }
}

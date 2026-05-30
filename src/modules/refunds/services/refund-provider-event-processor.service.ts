import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Prisma,
  ProviderEventProcessingStatus,
  RefundStatus,
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
  buildRefundProviderEventEntity,
  RefundProviderEventEntity,
  RefundProviderEventRecord,
} from '../entities/refund-provider-event.entity';
import {
  RefundSummaryEntity,
  RefundSummaryRecord,
} from '../entities/refund-summary.entity';
import { RefundsRepository } from '../repositories/refunds.repository';
import { RefundOperationsService } from './refund-operations.service';

type ProcessRefundProviderEventInput = {
  refundProviderEventId: string;
  occurredAt?: Date;
  retryTerminal?: boolean;
};

type RefundLifecycleAction = 'succeed' | 'fail' | 'cancel';

const REFUND_WEBHOOK_SYSTEM_ACTOR = createSystemAuthenticatedActor(
  'refund-provider-webhook',
  UserRole.SUPPORT,
);

@Injectable()
export class RefundProviderEventProcessorService {
  constructor(
    private readonly refundsRepository: RefundsRepository,
    private readonly refundOperationsService: RefundOperationsService,
  ) {}

  async processRefundProviderEvent(
    input: ProcessRefundProviderEventInput,
  ): Promise<RefundProviderEventEntity> {
    const event = await this.refundsRepository.findRefundProviderEventById(
      input.refundProviderEventId,
    );

    if (event === null) {
      throw new AppException(
        'Refund provider event was not found.',
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
      return buildRefundProviderEventEntity(event);
    }

    if (!isProviderEventVerifiedForProcessing(event.verificationStatus)) {
      return this.markFailed(event, {
        failureCode: 'provider_event_not_verified',
        failureMessage:
          'Refund provider event must be verified before lifecycle processing.',
        occurredAt,
      });
    }

    const lifecycleAction = this.resolveLifecycleAction(event.normalizedStatus);

    if (lifecycleAction === null) {
      return this.markIgnored(event, {
        failureCode: 'non_terminal_refund_status',
        failureMessage:
          'Refund provider event does not contain a terminal refund status.',
        occurredAt,
      });
    }

    const refund = await this.resolveRefund(event);

    if (refund === null) {
      return this.markIgnored(event, {
        failureCode: 'refund_not_matched',
        failureMessage:
          'Refund provider event could not be matched to an existing refund.',
        occurredAt,
      });
    }

    if (refund.payment.provider !== event.provider) {
      return this.markFailed(event, {
        failureCode: 'refund_provider_mismatch',
        failureMessage:
          'Refund provider event provider does not match the linked payment provider.',
        occurredAt,
        refund,
      });
    }

    try {
      const refundSummary = await this.applyLifecycleAction(
        event,
        refund.id,
        lifecycleAction,
      );

      return this.markProcessed(event, {
        occurredAt,
        refundSummary,
      });
    } catch (error) {
      await this.markFailed(event, {
        failureCode: this.readFailureCode(error),
        failureMessage: this.readFailureMessage(error),
        occurredAt,
        refund,
      });

      throw error;
    }
  }

  private resolveLifecycleAction(
    status: RefundStatus | null,
  ): RefundLifecycleAction | null {
    switch (status) {
      case RefundStatus.SUCCEEDED:
        return 'succeed';
      case RefundStatus.FAILED:
        return 'fail';
      case RefundStatus.CANCELLED:
        return 'cancel';
      default:
        return null;
    }
  }

  private async resolveRefund(
    event: RefundProviderEventRecord,
  ): Promise<RefundSummaryRecord | null> {
    if (event.refundId !== null) {
      const refund = await this.refundsRepository.findById(event.refundId);

      if (refund !== null) {
        return refund;
      }
    }

    if (event.providerReference === null) {
      return null;
    }

    return this.refundsRepository.findLatestByProviderReference(
      event.provider,
      event.providerReference,
    );
  }

  private applyLifecycleAction(
    event: RefundProviderEventRecord,
    refundId: string,
    lifecycleAction: RefundLifecycleAction,
  ): Promise<RefundSummaryEntity> {
    const lifecycleInput = {
      refundId,
      providerReference: event.providerReference,
      reasonCode: this.buildReasonCode(event),
      note: this.buildLifecycleNote(event),
      failureCode:
        lifecycleAction === 'fail'
          ? event.failureCode ?? 'provider_refund_failed'
          : null,
      failureMessage:
        lifecycleAction === 'fail'
          ? event.failureMessage ?? 'Provider reported refund failure.'
          : null,
      metadata: this.buildLifecycleMetadata(event),
      requestPayloadJson: this.toOptionalInputJson(event.normalizedPayloadJson),
      responsePayloadJson: this.toOptionalInputJson(event.rawPayloadJson),
    };
    const options = {
      skipAdminFinanceAccess: true,
    };

    switch (lifecycleAction) {
      case 'succeed':
        return this.refundOperationsService.succeedCurrentAdminRefund(
          REFUND_WEBHOOK_SYSTEM_ACTOR,
          lifecycleInput,
          options,
        );
      case 'fail':
        return this.refundOperationsService.failCurrentAdminRefund(
          REFUND_WEBHOOK_SYSTEM_ACTOR,
          lifecycleInput,
          options,
        );
      case 'cancel':
        return this.refundOperationsService.cancelCurrentAdminRefund(
          REFUND_WEBHOOK_SYSTEM_ACTOR,
          lifecycleInput,
          options,
        );
    }
  }

  private async markProcessed(
    event: RefundProviderEventRecord,
    input: {
      occurredAt: Date;
      refundSummary: RefundSummaryEntity;
    },
  ): Promise<RefundProviderEventEntity> {
    const updatedEvent =
      await this.refundsRepository.updateRefundProviderEventProcessingState({
        refundProviderEventId: event.id,
        processingStatus: ProviderEventProcessingStatus.PROCESSED,
        refundId: input.refundSummary.refundId,
        paymentId: input.refundSummary.paymentId,
        orderId: input.refundSummary.orderId,
        providerReference:
          input.refundSummary.providerReference ?? event.providerReference,
        processingMetadataJson: this.buildProcessingMetadata(event, {
          outcome: 'processed',
          refundId: input.refundSummary.refundId,
          paymentId: input.refundSummary.paymentId,
          orderId: input.refundSummary.orderId,
          refundStatus: input.refundSummary.status,
          paymentStatus: input.refundSummary.payment.status,
          orderStatus: input.refundSummary.order.status,
          processedAt: input.occurredAt.toISOString(),
        }),
        occurredAt: input.occurredAt,
      });

    return buildRefundProviderEventEntity(updatedEvent);
  }

  private async markIgnored(
    event: RefundProviderEventRecord,
    input: {
      failureCode: string;
      failureMessage: string;
      occurredAt: Date;
    },
  ): Promise<RefundProviderEventEntity> {
    const updatedEvent =
      await this.refundsRepository.updateRefundProviderEventProcessingState({
        refundProviderEventId: event.id,
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

    return buildRefundProviderEventEntity(updatedEvent);
  }

  private async markFailed(
    event: RefundProviderEventRecord,
    input: {
      failureCode: string;
      failureMessage: string;
      occurredAt: Date;
      refund?: RefundSummaryRecord;
    },
  ): Promise<RefundProviderEventEntity> {
    const updatedEvent =
      await this.refundsRepository.updateRefundProviderEventProcessingState({
        refundProviderEventId: event.id,
        processingStatus: ProviderEventProcessingStatus.FAILED,
        refundId: input.refund?.id,
        paymentId: input.refund?.paymentId,
        orderId: input.refund?.orderId,
        providerReference: input.refund?.providerReference ?? event.providerReference,
        processingMetadataJson: this.buildProcessingMetadata(event, {
          outcome: 'failed',
          failureCode: input.failureCode,
          failureMessage: input.failureMessage,
          failedAt: input.occurredAt.toISOString(),
          refundId: input.refund?.id ?? event.refundId,
          paymentId: input.refund?.paymentId ?? event.paymentId,
          orderId: input.refund?.orderId ?? event.orderId,
        }),
        failureCode: input.failureCode,
        failureMessage: input.failureMessage,
        occurredAt: input.occurredAt,
      });

    return buildRefundProviderEventEntity(updatedEvent);
  }

  private buildLifecycleMetadata(
    event: RefundProviderEventRecord,
  ): Prisma.InputJsonValue {
    return {
      providerWebhook: true,
      refundProviderEventId: event.id,
      providerEventId: event.providerEventId,
      eventType: event.eventType,
      provider: event.provider,
      normalizedStatus: event.normalizedStatus,
      receivedAt: event.receivedAt.toISOString(),
    };
  }

  private buildProcessingMetadata(
    event: RefundProviderEventRecord,
    nextMetadata: Record<string, Prisma.JsonValue | Prisma.InputJsonValue>,
  ): Prisma.InputJsonValue {
    return {
      ...(this.asJsonObject(event.processingMetadataJson) ?? {}),
      processor: 'refund_webhook_lifecycle',
      provider: event.provider,
      providerEventId: event.providerEventId,
      eventType: event.eventType,
      normalizedStatus: event.normalizedStatus,
      ...nextMetadata,
    };
  }

  private buildReasonCode(event: RefundProviderEventRecord): string {
    switch (event.normalizedStatus) {
      case RefundStatus.SUCCEEDED:
        return 'provider_refund_succeeded';
      case RefundStatus.FAILED:
        return event.failureCode ?? 'provider_refund_failed';
      case RefundStatus.CANCELLED:
        return 'provider_refund_cancelled';
      default:
        return 'provider_refund_event';
    }
  }

  private buildLifecycleNote(event: RefundProviderEventRecord): string | null {
    switch (event.normalizedStatus) {
      case RefundStatus.FAILED:
        return event.failureMessage ?? 'Provider reported refund failure.';
      case RefundStatus.CANCELLED:
        return 'Provider reported refund cancellation.';
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

    return 'refund_webhook_processing_failed';
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

    return 'Refund provider event could not be processed.';
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

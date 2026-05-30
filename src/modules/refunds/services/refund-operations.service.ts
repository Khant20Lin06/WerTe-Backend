import { HttpStatus, Injectable } from '@nestjs/common';
import {
  PaymentStatus,
  Prisma,
  RefundStatus,
  SystemMessageCode,
  UserRole,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { requireAdminFinanceAccess } from '../../payments/policies/finance-access-policy.helper';
import { PaymentSummaryRecord } from '../../payments/entities/payment-summary.entity';
import { PaymentsRepository } from '../../payments/repositories/payments.repository';
import { buildRefundSummaryEntity, RefundSummaryEntity } from '../entities/refund-summary.entity';
import { RefundsRepository } from '../repositories/refunds.repository';

type RequestRefundInput = {
  paymentId: string;
  amount: string;
  idempotencyKey?: string | null;
  providerReference?: string | null;
  reasonCode?: string | null;
  note?: string | null;
  metadata?: Prisma.InputJsonValue;
  requestPayloadJson?: Prisma.InputJsonValue;
  responsePayloadJson?: Prisma.InputJsonValue;
};

type FinalizeRefundInput = {
  refundId: string;
  providerReference?: string | null;
  reasonCode?: string | null;
  note?: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  metadata?: Prisma.InputJsonValue;
  requestPayloadJson?: Prisma.InputJsonValue;
  responsePayloadJson?: Prisma.InputJsonValue;
};

type RefundLifecycleOptions = {
  skipAdminFinanceAccess?: boolean;
};

const REFUNDABLE_PAYMENT_STATUSES = new Set<PaymentStatus>([
  PaymentStatus.SUCCEEDED,
  PaymentStatus.PARTIALLY_REFUNDED,
]);

const FINALIZABLE_REFUND_STATUSES = new Set<RefundStatus>([
  RefundStatus.PENDING,
  RefundStatus.PROCESSING,
]);

const RESERVED_REFUND_STATUSES = new Set<RefundStatus>([
  RefundStatus.PENDING,
  RefundStatus.PROCESSING,
  RefundStatus.SUCCEEDED,
]);

@Injectable()
export class RefundOperationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly refundsRepository: RefundsRepository,
    private readonly systemMessageService: SystemMessageService,
  ) {}

  async requestCurrentAdminRefund(
    currentUser: AuthenticatedUserEntity,
    input: RequestRefundInput,
  ): Promise<RefundSummaryEntity> {
    this.requireAdmin(currentUser);

    if (input.idempotencyKey !== undefined && input.idempotencyKey !== null) {
      const existingRefund = await this.refundsRepository.findByIdempotencyKey(
        input.idempotencyKey,
      );

      if (existingRefund !== null) {
        if (existingRefund.paymentId !== input.paymentId) {
          throw new AppException(
            'This refund idempotency key is already linked to another payment.',
            HttpStatus.CONFLICT,
            {
              code: ErrorCodes.conflict,
            },
          );
        }

        return buildRefundSummaryEntity(existingRefund);
      }
    }

    const payment = await this.paymentsRepository.findById(input.paymentId);

    if (payment === null) {
      throw new AppException('Payment was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (!REFUNDABLE_PAYMENT_STATUSES.has(payment.status)) {
      throw new AppException(
        'Refunds can only be requested for completed payments.',
        HttpStatus.CONFLICT,
        {
          code: ErrorCodes.conflict,
        },
      );
    }

    const requestedAmount = this.parsePositiveAmount(input.amount);
    const availableAmount = this.computeAvailableRefundableAmount(payment);

    if (requestedAmount.greaterThan(availableAmount)) {
      throw new AppException(
        'The requested refund amount exceeds the refundable balance.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    const occurredAt = new Date();
    const refund = await this.prisma.runInTransaction(async (tx) => {
      return this.refundsRepository.createRefundRequest(
        {
          paymentId: payment.id,
          orderId: payment.orderId,
          createdByUserId: currentUser.userId,
          status: RefundStatus.PENDING,
          amount: requestedAmount,
          currencyCode: payment.currencyCode,
          idempotencyKey: input.idempotencyKey ?? null,
          providerReference: input.providerReference ?? null,
          reasonCode: input.reasonCode ?? 'admin_requested_refund',
          note: input.note ?? null,
          metadataJson: this.buildMergedMetadata(payment.metadataJson, input.metadata, {
            actorUserId: currentUser.userId,
            targetStatus: RefundStatus.PENDING,
            reasonCode: input.reasonCode ?? 'admin_requested_refund',
            note: input.note ?? null,
            occurredAt,
          }),
          provider: payment.provider,
          requestPayloadJson: input.requestPayloadJson,
          responsePayloadJson: input.responsePayloadJson,
          occurredAt,
        },
        tx,
      );
    });

    const refundEntity = buildRefundSummaryEntity(refund);

    await this.publishRefundEvent(currentUser, {
      refund: refundEntity,
      code: SystemMessageCode.REFUND_REQUESTED,
      reasonCode: input.reasonCode ?? 'admin_requested_refund',
      note: input.note ?? null,
      metadata: {
        refundId: refundEntity.refundId,
        paymentId: refundEntity.paymentId,
        refundStatus: refundEntity.status,
        refundAmount: refundEntity.amount,
        currencyCode: refundEntity.currencyCode,
      },
    });

    return refundEntity;
  }

  async succeedCurrentAdminRefund(
    currentUser: AuthenticatedUserEntity,
    input: FinalizeRefundInput,
    options?: RefundLifecycleOptions,
  ): Promise<RefundSummaryEntity> {
    this.requireAdmin(currentUser, options);

    return this.finalizeRefund(currentUser, input, {
      targetStatus: RefundStatus.SUCCEEDED,
      systemMessageCode: SystemMessageCode.REFUND_SUCCEEDED,
      conflictMessage: 'This refund can no longer be marked as succeeded.',
      defaultReasonCode: 'refund_succeeded',
    });
  }

  async failCurrentAdminRefund(
    currentUser: AuthenticatedUserEntity,
    input: FinalizeRefundInput,
    options?: RefundLifecycleOptions,
  ): Promise<RefundSummaryEntity> {
    this.requireAdmin(currentUser, options);

    return this.finalizeRefund(currentUser, input, {
      targetStatus: RefundStatus.FAILED,
      systemMessageCode: SystemMessageCode.REFUND_FAILED,
      conflictMessage: 'This refund can no longer be marked as failed.',
      defaultReasonCode: 'refund_failed',
    });
  }

  async cancelCurrentAdminRefund(
    currentUser: AuthenticatedUserEntity,
    input: FinalizeRefundInput,
    options?: RefundLifecycleOptions,
  ): Promise<RefundSummaryEntity> {
    this.requireAdmin(currentUser, options);

    return this.finalizeRefund(currentUser, input, {
      targetStatus: RefundStatus.CANCELLED,
      systemMessageCode: null,
      conflictMessage: 'This refund can no longer be cancelled.',
      defaultReasonCode: 'refund_cancelled',
    });
  }

  private async finalizeRefund(
    currentUser: AuthenticatedUserEntity,
    input: FinalizeRefundInput,
    config: {
      targetStatus: RefundStatus;
      systemMessageCode: SystemMessageCode | null;
      conflictMessage: string;
      defaultReasonCode: string;
    },
  ): Promise<RefundSummaryEntity> {
    const currentRefund = await this.refundsRepository.findById(input.refundId);

    if (currentRefund === null) {
      throw new AppException('Refund was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (currentRefund.status === config.targetStatus) {
      return buildRefundSummaryEntity(currentRefund);
    }

    if (!FINALIZABLE_REFUND_STATUSES.has(currentRefund.status)) {
      throw new AppException(config.conflictMessage, HttpStatus.CONFLICT, {
        code: ErrorCodes.conflict,
      });
    }

    const occurredAt = new Date();
    const refund = await this.prisma.runInTransaction(async (tx) => {
      const transitionedRefund = await this.refundsRepository.transitionRefundStatus(
        {
          refundId: currentRefund.id,
          provider: currentRefund.payment.provider,
          status: config.targetStatus,
          metadataJson: this.buildMergedMetadata(
            currentRefund.metadataJson,
            input.metadata,
            {
              actorUserId: currentUser.userId,
              targetStatus: config.targetStatus,
              reasonCode: input.reasonCode ?? config.defaultReasonCode,
              note:
                input.note ?? input.failureMessage ?? null,
              occurredAt,
            },
          ),
          providerReference:
            input.providerReference ?? currentRefund.providerReference ?? null,
          failureCode: input.failureCode ?? null,
          failureMessage: input.failureMessage ?? null,
          requestPayloadJson: input.requestPayloadJson,
          responsePayloadJson: input.responsePayloadJson,
          occurredAt,
        },
        tx,
      );

      if (config.targetStatus === RefundStatus.SUCCEEDED) {
        const payment = await this.paymentsRepository.findById(
          transitionedRefund.paymentId,
          tx,
        );

        const refundedAmount = this.computeSucceededRefundAmount(payment!);
        const paymentStatus = refundedAmount.greaterThanOrEqualTo(payment!.amount)
          ? PaymentStatus.REFUNDED
          : PaymentStatus.PARTIALLY_REFUNDED;

        await this.paymentsRepository.updateRefundState(
          {
            paymentId: transitionedRefund.paymentId,
            refundedAmount,
            status: paymentStatus,
          },
          tx,
        );
      }

      return this.refundsRepository.findById(currentRefund.id, tx);
    });

    const refundEntity = buildRefundSummaryEntity(refund!);

    if (config.systemMessageCode === null) {
      return refundEntity;
    }

    await this.publishRefundEvent(currentUser, {
      refund: refundEntity,
      code: config.systemMessageCode,
      reasonCode: input.reasonCode ?? config.defaultReasonCode,
      note: input.note ?? input.failureMessage ?? null,
      metadata: {
        refundId: refundEntity.refundId,
        paymentId: refundEntity.paymentId,
        refundStatus: refundEntity.status,
        refundAmount: refundEntity.amount,
        currencyCode: refundEntity.currencyCode,
        failureCode: input.failureCode ?? refundEntity.failureCode,
        failureMessage: input.failureMessage ?? refundEntity.failureMessage,
      },
    });

    return refundEntity;
  }

  private async publishRefundEvent(
    currentUser: AuthenticatedUserEntity,
    input: {
      refund: RefundSummaryEntity;
      code: SystemMessageCode;
      reasonCode: string;
      note: string | null;
      metadata: Prisma.InputJsonValue;
    },
  ): Promise<void> {
    await this.systemMessageService.publishOrderEvent(currentUser, {
      orderId: input.refund.orderId,
      code: input.code,
      metadata: input.metadata,
      templateVariables: {
        reasonCode: input.reasonCode,
        note: input.note,
      },
    });
  }

  private computeAvailableRefundableAmount(payment: PaymentSummaryRecord): Prisma.Decimal {
    const reservedAmount = payment.refunds.reduce((total, refund) => {
      if (!RESERVED_REFUND_STATUSES.has(refund.status)) {
        return total;
      }

      return total.add(refund.amount);
    }, new Prisma.Decimal(0));

    const availableAmount = payment.amount.sub(reservedAmount);

    return availableAmount.lessThan(0) ? new Prisma.Decimal(0) : availableAmount;
  }

  private computeSucceededRefundAmount(payment: PaymentSummaryRecord): Prisma.Decimal {
    return payment.refunds.reduce((total, refund) => {
      if (refund.status !== RefundStatus.SUCCEEDED) {
        return total;
      }

      return total.add(refund.amount);
    }, new Prisma.Decimal(0));
  }

  private parsePositiveAmount(value: string): Prisma.Decimal {
    let amount: Prisma.Decimal;

    try {
      amount = new Prisma.Decimal(value);
    } catch {
      throw new AppException('Refund amount is invalid.', HttpStatus.BAD_REQUEST, {
        code: ErrorCodes.badRequest,
      });
    }

    if (amount.lessThanOrEqualTo(0)) {
      throw new AppException(
        'Refund amount must be greater than zero.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    return amount;
  }

  private requireAdmin(
    currentUser: AuthenticatedUserEntity,
    options: RefundLifecycleOptions = {},
  ): void {
    if (options.skipAdminFinanceAccess === true) {
      return;
    }

    requireAdminFinanceAccess(currentUser, 'refunds');
  }

  private buildMergedMetadata(
    existingMetadata: Prisma.JsonValue | null | undefined,
    nextMetadata: Prisma.InputJsonValue | undefined,
    lifecycleEvent: {
      actorUserId: string;
      targetStatus: RefundStatus;
      reasonCode: string;
      note: string | null;
      occurredAt: Date;
    },
  ): Prisma.InputJsonValue {
    return {
      ...(this.asJsonObject(existingMetadata) ?? {}),
      ...(this.asJsonObject(nextMetadata) ?? {}),
      lastLifecycleEvent: {
        actorUserId: lifecycleEvent.actorUserId,
        targetStatus: lifecycleEvent.targetStatus,
        reasonCode: lifecycleEvent.reasonCode,
        note: lifecycleEvent.note,
        occurredAt: lifecycleEvent.occurredAt.toISOString(),
      },
    };
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

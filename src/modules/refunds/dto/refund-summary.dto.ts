import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RefundAttemptEntity } from '../entities/refund-attempt.entity';
import { RefundDetailEntity } from '../entities/refund-detail.entity';
import { RefundSummaryEntity } from '../entities/refund-summary.entity';

export class RefundSummaryDto {
  @ApiProperty({ example: 'refund_1' })
  refundId!: string;

  @ApiProperty({ example: 'payment_1' })
  paymentId!: string;

  @ApiProperty({ example: 'order_1' })
  orderId!: string;

  @ApiPropertyOptional({ example: 'usr_admin_1' })
  createdByUserId!: string | null;

  @ApiProperty({ example: 'SUCCEEDED' })
  status!: string;

  @ApiProperty({ example: '1500' })
  amount!: string;

  @ApiProperty({ example: 'MMK' })
  currencyCode!: string;

  @ApiPropertyOptional({ example: 'refund-idem-1' })
  idempotencyKey!: string | null;

  @ApiPropertyOptional({ example: 'refund_ref_1' })
  providerReference!: string | null;

  @ApiPropertyOptional({ example: 'customer_support' })
  reasonCode!: string | null;

  @ApiPropertyOptional({ example: 'Goodwill refund' })
  note!: string | null;

  @ApiPropertyOptional({ example: null })
  failureCode!: string | null;

  @ApiPropertyOptional({ example: null })
  failureMessage!: string | null;

  @ApiProperty({ example: '2026-04-24T09:00:00.000Z' })
  requestedAt!: string;

  @ApiPropertyOptional({ example: '2026-04-24T09:10:00.000Z' })
  succeededAt!: string | null;

  @ApiPropertyOptional({ example: null })
  failedAt!: string | null;

  @ApiPropertyOptional({ example: null })
  cancelledAt!: string | null;

  @ApiProperty({ example: 'CARD' })
  paymentMethod!: string;

  @ApiProperty({ example: 'STRIPE' })
  paymentProvider!: string;

  @ApiProperty({ example: 'PARTIALLY_REFUNDED' })
  paymentStatus!: string;

  @ApiProperty({ example: '10000' })
  paymentAmount!: string;

  @ApiProperty({ example: '1500' })
  paymentRefundedAmount!: string;

  @ApiPropertyOptional({ example: 'ADMIN' })
  createdByUserRole!: string | null;

  @ApiPropertyOptional({ example: '099999999' })
  createdByUserPhone!: string | null;

  @ApiProperty({ example: '2026-04-24T09:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-04-24T09:10:00.000Z' })
  updatedAt!: string;
}

class RefundAttemptDto {
  @ApiProperty({ example: 'refund_attempt_1' })
  refundAttemptId!: string;

  @ApiProperty({ example: 'refund_1' })
  refundId!: string;

  @ApiProperty({ example: 'STRIPE' })
  provider!: string;

  @ApiProperty({ example: 'SUCCEEDED' })
  status!: string;

  @ApiPropertyOptional({ example: 'refund_ref_1' })
  providerReference!: string | null;

  @ApiPropertyOptional({ example: null })
  failureCode!: string | null;

  @ApiPropertyOptional({ example: null })
  failureMessage!: string | null;

  @ApiProperty({ example: '2026-04-24T09:10:00.000Z' })
  attemptedAt!: string;

  @ApiProperty({ example: '2026-04-24T09:10:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-04-24T09:10:00.000Z' })
  updatedAt!: string;
}

export class RefundDetailDto extends RefundSummaryDto {
  @ApiProperty({ type: () => RefundAttemptDto, isArray: true })
  attempts!: RefundAttemptDto[];
}

export function toRefundSummaryDto(refund: RefundSummaryEntity): RefundSummaryDto {
  return {
    refundId: refund.refundId,
    paymentId: refund.paymentId,
    orderId: refund.orderId,
    createdByUserId: refund.createdByUserId,
    status: refund.status,
    amount: refund.amount,
    currencyCode: refund.currencyCode,
    idempotencyKey: refund.idempotencyKey,
    providerReference: refund.providerReference,
    reasonCode: refund.reasonCode,
    note: refund.note,
    failureCode: refund.failureCode,
    failureMessage: refund.failureMessage,
    requestedAt: refund.requestedAt,
    succeededAt: refund.succeededAt,
    failedAt: refund.failedAt,
    cancelledAt: refund.cancelledAt,
    paymentMethod: refund.payment.method,
    paymentProvider: refund.payment.provider,
    paymentStatus: refund.payment.status,
    paymentAmount: refund.payment.amount,
    paymentRefundedAmount: refund.payment.refundedAmount,
    createdByUserRole: refund.createdByUser?.role ?? null,
    createdByUserPhone: refund.createdByUser?.phone ?? null,
    createdAt: refund.createdAt,
    updatedAt: refund.updatedAt,
  };
}

function toRefundAttemptDto(attempt: RefundAttemptEntity): RefundAttemptDto {
  return {
    refundAttemptId: attempt.refundAttemptId,
    refundId: attempt.refundId,
    provider: attempt.provider,
    status: attempt.status,
    providerReference: attempt.providerReference,
    failureCode: attempt.failureCode,
    failureMessage: attempt.failureMessage,
    attemptedAt: attempt.attemptedAt,
    createdAt: attempt.createdAt,
    updatedAt: attempt.updatedAt,
  };
}

export function toRefundDetailDto(refund: RefundDetailEntity): RefundDetailDto {
  return {
    ...toRefundSummaryDto(refund),
    attempts: refund.attempts.map((attempt) => toRefundAttemptDto(attempt)),
  };
}

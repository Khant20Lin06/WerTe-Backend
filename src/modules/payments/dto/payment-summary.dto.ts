import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentAttemptEntity } from '../entities/payment-attempt.entity';
import { PaymentDetailEntity } from '../entities/payment-detail.entity';
import {
  PaymentSummaryEntity,
  PaymentSummaryRefundEntity,
} from '../entities/payment-summary.entity';

class PaymentRelatedRefundDto {
  @ApiProperty({ example: 'refund_1' })
  refundId!: string;

  @ApiProperty({ example: 'SUCCEEDED' })
  status!: string;

  @ApiProperty({ example: '1500' })
  amount!: string;

  @ApiProperty({ example: 'MMK' })
  currencyCode!: string;

  @ApiPropertyOptional({ example: 'refund_ref_1' })
  providerReference!: string | null;

  @ApiPropertyOptional({ example: 'customer_support' })
  reasonCode!: string | null;

  @ApiPropertyOptional({ example: 'Goodwill refund' })
  note!: string | null;

  @ApiProperty({ example: '2026-04-24T09:00:00.000Z' })
  requestedAt!: string;

  @ApiPropertyOptional({ example: '2026-04-24T09:10:00.000Z' })
  succeededAt!: string | null;

  @ApiPropertyOptional({ example: null })
  failedAt!: string | null;

  @ApiPropertyOptional({ example: null })
  cancelledAt!: string | null;

  @ApiPropertyOptional({ example: 'usr_admin_1' })
  createdByUserId!: string | null;

  @ApiPropertyOptional({ example: 'ADMIN' })
  createdByUserRole!: string | null;

  @ApiPropertyOptional({ example: '099999999' })
  createdByUserPhone!: string | null;
}

export class PaymentSummaryDto {
  @ApiProperty({ example: 'payment_1' })
  paymentId!: string;

  @ApiProperty({ example: 'order_1' })
  orderId!: string;

  @ApiProperty({ example: 'cust_prof_1' })
  customerProfileId!: string;

  @ApiProperty({ example: 'CARD' })
  method!: string;

  @ApiProperty({ example: 'STRIPE' })
  provider!: string;

  @ApiProperty({ example: 'SUCCEEDED' })
  status!: string;

  @ApiProperty({ example: '6500' })
  amount!: string;

  @ApiProperty({ example: '1500' })
  refundedAmount!: string;

  @ApiProperty({ example: 'MMK' })
  currencyCode!: string;

  @ApiPropertyOptional({ example: 'idem_1' })
  idempotencyKey!: string | null;

  @ApiPropertyOptional({ example: 'pi_123' })
  providerReference!: string | null;

  @ApiPropertyOptional({ example: 'receipt_123' })
  providerReceiptId!: string | null;

  @ApiPropertyOptional({ example: null })
  failureCode!: string | null;

  @ApiPropertyOptional({ example: null })
  failureMessage!: string | null;

  @ApiPropertyOptional({ example: '2026-04-24T08:00:00.000Z' })
  requiresActionAt!: string | null;

  @ApiPropertyOptional({ example: '2026-04-24T08:10:00.000Z' })
  succeededAt!: string | null;

  @ApiPropertyOptional({ example: null })
  failedAt!: string | null;

  @ApiPropertyOptional({ example: null })
  cancelledAt!: string | null;

  @ApiPropertyOptional({ example: null })
  expiredAt!: string | null;

  @ApiProperty({ example: '2026-04-24T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-04-24T08:10:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ type: () => PaymentRelatedRefundDto, isArray: true })
  refunds!: PaymentRelatedRefundDto[];
}

class PaymentAttemptDto {
  @ApiProperty({ example: 'payment_attempt_1' })
  paymentAttemptId!: string;

  @ApiProperty({ example: 'payment_1' })
  paymentId!: string;

  @ApiProperty({ example: 'STRIPE' })
  provider!: string;

  @ApiProperty({ example: 'SUCCEEDED' })
  status!: string;

  @ApiPropertyOptional({ example: 'pi_123' })
  providerReference!: string | null;

  @ApiPropertyOptional({ example: null })
  failureCode!: string | null;

  @ApiPropertyOptional({ example: null })
  failureMessage!: string | null;

  @ApiProperty({ example: '2026-04-24T08:10:00.000Z' })
  attemptedAt!: string;

  @ApiProperty({ example: '2026-04-24T08:10:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-04-24T08:10:00.000Z' })
  updatedAt!: string;
}

export class PaymentDetailDto extends PaymentSummaryDto {
  @ApiProperty({ type: () => PaymentAttemptDto, isArray: true })
  attempts!: PaymentAttemptDto[];
}

function toPaymentRelatedRefundDto(
  refund: PaymentSummaryRefundEntity,
): PaymentRelatedRefundDto {
  return {
    refundId: refund.refundId,
    status: refund.status,
    amount: refund.amount,
    currencyCode: refund.currencyCode,
    providerReference: refund.providerReference,
    reasonCode: refund.reasonCode,
    note: refund.note,
    requestedAt: refund.requestedAt,
    succeededAt: refund.succeededAt,
    failedAt: refund.failedAt,
    cancelledAt: refund.cancelledAt,
    createdByUserId: refund.createdByUserId,
    createdByUserRole: refund.createdByUserRole,
    createdByUserPhone: refund.createdByUserPhone,
  };
}

export function toPaymentSummaryDto(payment: PaymentSummaryEntity): PaymentSummaryDto {
  return {
    paymentId: payment.paymentId,
    orderId: payment.orderId,
    customerProfileId: payment.customerProfileId,
    method: payment.method,
    provider: payment.provider,
    status: payment.status,
    amount: payment.amount,
    refundedAmount: payment.refundedAmount,
    currencyCode: payment.currencyCode,
    idempotencyKey: payment.idempotencyKey,
    providerReference: payment.providerReference,
    providerReceiptId: payment.providerReceiptId,
    failureCode: payment.failureCode,
    failureMessage: payment.failureMessage,
    requiresActionAt: payment.requiresActionAt,
    succeededAt: payment.succeededAt,
    failedAt: payment.failedAt,
    cancelledAt: payment.cancelledAt,
    expiredAt: payment.expiredAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    refunds: payment.refunds.map((refund) => toPaymentRelatedRefundDto(refund)),
  };
}

function toPaymentAttemptDto(attempt: PaymentAttemptEntity): PaymentAttemptDto {
  return {
    paymentAttemptId: attempt.paymentAttemptId,
    paymentId: attempt.paymentId,
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

export function toPaymentDetailDto(payment: PaymentDetailEntity): PaymentDetailDto {
  return {
    ...toPaymentSummaryDto(payment),
    attempts: payment.attempts.map((attempt) => toPaymentAttemptDto(attempt)),
  };
}

import { PaymentAttemptEntity } from '../../../../../src/modules/payments/entities/payment-attempt.entity';
import { PaymentDetailEntity } from '../../../../../src/modules/payments/entities/payment-detail.entity';
import { PaymentSummaryEntity, PaymentSummaryRefundEntity } from '../../../../../src/modules/payments/entities/payment-summary.entity';
export declare function makePaymentRelatedRefund(overrides?: Partial<PaymentSummaryRefundEntity>): PaymentSummaryRefundEntity;
export declare function makePaymentSummary(overrides?: Partial<PaymentSummaryEntity>): PaymentSummaryEntity;
export declare function makePaymentAttempt(overrides?: Partial<PaymentAttemptEntity>): PaymentAttemptEntity;
export declare function makePaymentDetail(overrides?: Partial<PaymentDetailEntity>): PaymentDetailEntity;

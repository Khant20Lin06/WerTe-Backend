import { PaymentAttemptEntity } from './payment-attempt.entity';
import { PaymentSummaryEntity } from './payment-summary.entity';
export declare class PaymentDetailEntity extends PaymentSummaryEntity {
    attempts: PaymentAttemptEntity[];
}
export declare function buildPaymentDetailEntity(payment: PaymentSummaryEntity, attempts: PaymentAttemptEntity[]): PaymentDetailEntity;

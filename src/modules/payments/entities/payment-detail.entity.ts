import { PaymentAttemptEntity } from './payment-attempt.entity';
import { PaymentSummaryEntity } from './payment-summary.entity';

export class PaymentDetailEntity extends PaymentSummaryEntity {
  attempts!: PaymentAttemptEntity[];
}

export function buildPaymentDetailEntity(
  payment: PaymentSummaryEntity,
  attempts: PaymentAttemptEntity[],
): PaymentDetailEntity {
  return {
    ...payment,
    attempts,
  };
}

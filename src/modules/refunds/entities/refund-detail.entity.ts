import { RefundAttemptEntity } from './refund-attempt.entity';
import { RefundSummaryEntity } from './refund-summary.entity';

export class RefundDetailEntity extends RefundSummaryEntity {
  attempts!: RefundAttemptEntity[];
}

export function buildRefundDetailEntity(
  refund: RefundSummaryEntity,
  attempts: RefundAttemptEntity[],
): RefundDetailEntity {
  return {
    ...refund,
    attempts,
  };
}

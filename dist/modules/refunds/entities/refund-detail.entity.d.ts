import { RefundAttemptEntity } from './refund-attempt.entity';
import { RefundSummaryEntity } from './refund-summary.entity';
export declare class RefundDetailEntity extends RefundSummaryEntity {
    attempts: RefundAttemptEntity[];
}
export declare function buildRefundDetailEntity(refund: RefundSummaryEntity, attempts: RefundAttemptEntity[]): RefundDetailEntity;

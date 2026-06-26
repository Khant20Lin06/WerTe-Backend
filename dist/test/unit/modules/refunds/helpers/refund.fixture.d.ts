import { RefundAttemptEntity } from '../../../../../src/modules/refunds/entities/refund-attempt.entity';
import { RefundDetailEntity } from '../../../../../src/modules/refunds/entities/refund-detail.entity';
import { RefundSummaryEntity } from '../../../../../src/modules/refunds/entities/refund-summary.entity';
export declare function makeRefundSummary(overrides?: Partial<RefundSummaryEntity>): RefundSummaryEntity;
export declare function makeRefundAttempt(overrides?: Partial<RefundAttemptEntity>): RefundAttemptEntity;
export declare function makeRefundDetail(overrides?: Partial<RefundDetailEntity>): RefundDetailEntity;

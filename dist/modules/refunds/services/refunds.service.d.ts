import { RefundAttemptEntity } from '../entities/refund-attempt.entity';
import { RefundSummaryEntity } from '../entities/refund-summary.entity';
import { RefundsRepository } from '../repositories/refunds.repository';
export declare class RefundsService {
    private readonly refundsRepository;
    constructor(refundsRepository: RefundsRepository);
    findRefundById(refundId: string): Promise<RefundSummaryEntity | null>;
    findOrderRefund(orderId: string, refundId: string): Promise<RefundSummaryEntity | null>;
    findCustomerRefund(customerProfileId: string, refundId: string): Promise<RefundSummaryEntity | null>;
    listOrderRefunds(orderId: string): Promise<RefundSummaryEntity[]>;
    listCustomerOrderRefunds(orderId: string, customerProfileId: string): Promise<RefundSummaryEntity[]>;
    listPaymentRefunds(paymentId: string): Promise<RefundSummaryEntity[]>;
    listRefundAttempts(refundId: string): Promise<RefundAttemptEntity[]>;
}

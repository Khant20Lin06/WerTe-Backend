import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { RefundDetailEntity } from '../entities/refund-detail.entity';
import { RefundSummaryEntity } from '../entities/refund-summary.entity';
import { RefundOperationsService } from './refund-operations.service';
import { RefundsService } from './refunds.service';
export declare class RefundsRestService {
    private readonly refundsService;
    private readonly refundOperationsService;
    constructor(refundsService: RefundsService, refundOperationsService: RefundOperationsService);
    listCurrentCustomerOrderRefunds(currentUser: AuthenticatedUserEntity, orderId: string): Promise<RefundSummaryEntity[]>;
    getCurrentCustomerOrderRefundDetail(currentUser: AuthenticatedUserEntity, orderId: string, refundId: string): Promise<RefundDetailEntity>;
    listCurrentAdminOrderRefunds(orderId: string): Promise<RefundSummaryEntity[]>;
    getCurrentAdminOrderRefundDetail(orderId: string, refundId: string): Promise<RefundDetailEntity>;
    requestCurrentAdminRefund(currentUser: AuthenticatedUserEntity, paymentId: string, payload: {
        amount: string;
        idempotencyKey?: string;
        providerReference?: string;
        reasonCode?: string;
        note?: string;
    }): Promise<RefundSummaryEntity>;
    succeedCurrentAdminRefund(currentUser: AuthenticatedUserEntity, refundId: string, payload: {
        providerReference?: string;
        reasonCode?: string;
        failureCode?: string;
        failureMessage?: string;
        note?: string;
    }): Promise<RefundSummaryEntity>;
    failCurrentAdminRefund(currentUser: AuthenticatedUserEntity, refundId: string, payload: {
        providerReference?: string;
        reasonCode?: string;
        failureCode?: string;
        failureMessage?: string;
        note?: string;
    }): Promise<RefundSummaryEntity>;
    private attachAttempts;
}

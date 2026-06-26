import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdminFinalizeRefundDto } from '../dto/admin-finalize-refund.dto';
import { AdminRequestRefundDto } from '../dto/admin-request-refund.dto';
import { RefundSummaryDto } from '../dto/refund-summary.dto';
import { RefundsRestService } from '../services/refunds-rest.service';
export declare class AdminRefundsController {
    private readonly refundsRestService;
    constructor(refundsRestService: RefundsRestService);
    request(currentUser: AuthenticatedUserEntity, paymentId: string, body: AdminRequestRefundDto): Promise<RefundSummaryDto>;
    succeed(currentUser: AuthenticatedUserEntity, refundId: string, body: AdminFinalizeRefundDto): Promise<RefundSummaryDto>;
    fail(currentUser: AuthenticatedUserEntity, refundId: string, body: AdminFinalizeRefundDto): Promise<RefundSummaryDto>;
}

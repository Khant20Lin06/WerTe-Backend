import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { RefundDetailDto, RefundSummaryDto } from '../dto/refund-summary.dto';
import { RefundsRestService } from '../services/refunds-rest.service';
export declare class CustomerRefundsController {
    private readonly refundsRestService;
    constructor(refundsRestService: RefundsRestService);
    list(currentUser: AuthenticatedUserEntity, orderId: string): Promise<RefundSummaryDto[]>;
    detail(currentUser: AuthenticatedUserEntity, orderId: string, refundId: string): Promise<RefundDetailDto>;
}

import { RefundDetailDto, RefundSummaryDto } from '../dto/refund-summary.dto';
import { RefundsRestService } from '../services/refunds-rest.service';
export declare class AdminOrderRefundsController {
    private readonly refundsRestService;
    constructor(refundsRestService: RefundsRestService);
    list(orderId: string): Promise<RefundSummaryDto[]>;
    detail(orderId: string, refundId: string): Promise<RefundDetailDto>;
}

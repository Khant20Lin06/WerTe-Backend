import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { OrderDetailDto } from '../dto/order-detail.dto';
import { OrderSummaryDto } from '../dto/order-summary.dto';
import { OrderQueryService } from '../services/order-query.service';
export declare class RiderOrdersController {
    private readonly orderQueryService;
    constructor(orderQueryService: OrderQueryService);
    list(currentUser: AuthenticatedUserEntity): Promise<OrderSummaryDto[]>;
    detail(currentUser: AuthenticatedUserEntity, orderId: string): Promise<OrderDetailDto>;
}

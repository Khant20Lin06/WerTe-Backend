import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantOrderActionDto } from '../dto/merchant-order-action.dto';
import { OrderDetailDto } from '../dto/order-detail.dto';
import { OrderSummaryDto } from '../dto/order-summary.dto';
import { MerchantOrderHandlingService } from '../services/merchant-order-handling.service';
import { OrderQueryService } from '../services/order-query.service';
export declare class MerchantOrdersController {
    private readonly orderQueryService;
    private readonly merchantOrderHandlingService;
    constructor(orderQueryService: OrderQueryService, merchantOrderHandlingService: MerchantOrderHandlingService);
    list(currentUser: AuthenticatedUserEntity): Promise<OrderSummaryDto[]>;
    detail(currentUser: AuthenticatedUserEntity, orderId: string): Promise<OrderDetailDto>;
    accept(currentUser: AuthenticatedUserEntity, orderId: string, body: MerchantOrderActionDto): Promise<OrderDetailDto>;
    reject(currentUser: AuthenticatedUserEntity, orderId: string, body: MerchantOrderActionDto): Promise<OrderDetailDto>;
    markPreparing(currentUser: AuthenticatedUserEntity, orderId: string, body: MerchantOrderActionDto): Promise<OrderDetailDto>;
}

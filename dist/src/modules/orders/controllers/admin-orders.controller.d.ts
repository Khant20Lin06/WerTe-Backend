import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdminCancelOrderDto } from '../dto/admin-cancel-order.dto';
import { AdminUpdateOrderStatusDto } from '../dto/admin-update-order-status.dto';
import { OrderDetailDto } from '../dto/order-detail.dto';
import { OrderSummaryDto } from '../dto/order-summary.dto';
import { AdminOrderOperationsService } from '../services/admin-order-operations.service';
import { OrderQueryService } from '../services/order-query.service';
export declare class AdminOrdersController {
    private readonly orderQueryService;
    private readonly adminOrderOperationsService;
    constructor(orderQueryService: OrderQueryService, adminOrderOperationsService: AdminOrderOperationsService);
    list(currentUser: AuthenticatedUserEntity): Promise<OrderSummaryDto[]>;
    detail(currentUser: AuthenticatedUserEntity, orderId: string): Promise<OrderDetailDto>;
    cancel(currentUser: AuthenticatedUserEntity, orderId: string, body: AdminCancelOrderDto): Promise<OrderDetailDto>;
    updateStatus(currentUser: AuthenticatedUserEntity, orderId: string, body: AdminUpdateOrderStatusDto): Promise<OrderDetailDto>;
}

import { OrderStatus } from '@prisma/client';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { AdminCancelOrderDto } from '../dto/admin-cancel-order.dto';
import { AdminUpdateOrderStatusDto } from '../dto/admin-update-order-status.dto';
import { OrderDetailEntity } from '../entities/order-detail.entity';
import { OrderPolicyService } from '../policies/order-policy.service';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderQueryService } from './order-query.service';
type AdminCancelOrderInput = {
    orderId: string;
    reasonCode?: string;
    note?: string;
};
type AdminUpdateOrderStatusInput = {
    orderId: string;
    status: OrderStatus;
    reasonCode: string;
    note?: string;
};
export declare class AdminOrderOperationsService {
    private readonly ordersRepository;
    private readonly orderPolicyService;
    private readonly orderQueryService;
    private readonly systemMessageService;
    constructor(ordersRepository: OrdersRepository, orderPolicyService: OrderPolicyService, orderQueryService: OrderQueryService, systemMessageService: SystemMessageService);
    cancelAdminOrder(currentUser: AuthenticatedUserEntity, input: AdminCancelOrderInput | (AdminCancelOrderDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    overrideAdminOrderStatus(currentUser: AuthenticatedUserEntity, input: AdminUpdateOrderStatusInput | (AdminUpdateOrderStatusDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    private requireAdminAccess;
    private requireReasonCode;
    private normalizeOptionalString;
}
export {};

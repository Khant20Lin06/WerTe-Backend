import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../menus/services/menu-inventory-lifecycle.service';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
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
    private readonly prisma;
    private readonly ordersRepository;
    private readonly orderPolicyService;
    private readonly orderQueryService;
    private readonly systemMessageService;
    private readonly menuInventoryLifecycleService;
    private readonly notificationEventService;
    constructor(prisma: PrismaService, ordersRepository: OrdersRepository, orderPolicyService: OrderPolicyService, orderQueryService: OrderQueryService, systemMessageService: SystemMessageService, menuInventoryLifecycleService: MenuInventoryLifecycleService, notificationEventService: NotificationEventService);
    cancelAdminOrder(currentUser: AuthenticatedUserEntity, input: AdminCancelOrderInput | (AdminCancelOrderDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    overrideAdminOrderStatus(currentUser: AuthenticatedUserEntity, input: AdminUpdateOrderStatusInput | (AdminUpdateOrderStatusDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    private requireAdminAccess;
    private requireReasonCode;
    private normalizeOptionalString;
    private publishRestoredInventoryAlerts;
}
export {};

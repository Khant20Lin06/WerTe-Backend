import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../menus/services/menu-inventory-lifecycle.service';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { CancelOrderDto } from '../dto/cancel-order.dto';
import { OrderDetailEntity } from '../entities/order-detail.entity';
import { OrderPolicyService } from '../policies/order-policy.service';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderQueryService } from './order-query.service';
type CancelCustomerOrderInput = {
    orderId: string;
    reasonCode?: string;
    note?: string;
};
export declare class OrderCancellationService {
    private readonly prisma;
    private readonly ordersRepository;
    private readonly orderPolicyService;
    private readonly orderQueryService;
    private readonly systemMessageService;
    private readonly menuInventoryLifecycleService;
    private readonly notificationEventService;
    constructor(prisma: PrismaService, ordersRepository: OrdersRepository, orderPolicyService: OrderPolicyService, orderQueryService: OrderQueryService, systemMessageService: SystemMessageService, menuInventoryLifecycleService: MenuInventoryLifecycleService, notificationEventService: NotificationEventService);
    cancelCurrentCustomerOrder(currentUser: AuthenticatedUserEntity, input: CancelCustomerOrderInput | (CancelOrderDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    private publishRestoredInventoryAlerts;
}
export {};

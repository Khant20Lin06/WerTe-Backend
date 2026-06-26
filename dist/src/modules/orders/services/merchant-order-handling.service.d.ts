import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../menus/services/menu-inventory-lifecycle.service';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { MerchantOrderActionDto } from '../dto/merchant-order-action.dto';
import { OrderDetailEntity } from '../entities/order-detail.entity';
import { OrderPolicyService } from '../policies/order-policy.service';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderQueryService } from './order-query.service';
type MerchantOrderActionInput = {
    orderId: string;
    reasonCode?: string;
    note?: string;
};
export declare class MerchantOrderHandlingService {
    private readonly prisma;
    private readonly ordersRepository;
    private readonly orderPolicyService;
    private readonly orderQueryService;
    private readonly systemMessageService;
    private readonly menuInventoryLifecycleService;
    private readonly notificationEventService;
    private readonly queueService;
    constructor(prisma: PrismaService, ordersRepository: OrdersRepository, orderPolicyService: OrderPolicyService, orderQueryService: OrderQueryService, systemMessageService: SystemMessageService, menuInventoryLifecycleService: MenuInventoryLifecycleService, notificationEventService: NotificationEventService, queueService: QueueService);
    acceptCurrentMerchantOrder(currentUser: AuthenticatedUserEntity, input: MerchantOrderActionInput | (MerchantOrderActionDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    rejectCurrentMerchantOrder(currentUser: AuthenticatedUserEntity, input: MerchantOrderActionInput | (MerchantOrderActionDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    markPreparingCurrentMerchantOrder(currentUser: AuthenticatedUserEntity, input: MerchantOrderActionInput | (MerchantOrderActionDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    markReadyCurrentMerchantOrder(currentUser: AuthenticatedUserEntity, input: MerchantOrderActionInput | (MerchantOrderActionDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    confirmPickupCurrentMerchantOrder(currentUser: AuthenticatedUserEntity, input: MerchantOrderActionInput | (MerchantOrderActionDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    private handleMerchantAction;
    private publishRestoredInventoryAlerts;
    private mapStatusToSystemMessageCode;
}
export {};

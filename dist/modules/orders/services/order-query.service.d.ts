import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { OrderDetailEntity, OrderDetailRecord, OrderTimelineEntryEntity, OrderTimelineEntryRecord } from '../entities/order-detail.entity';
import { OrderSummaryEntity, OrderSummaryRecord } from '../entities/order-summary.entity';
import { OrderPolicyService } from '../policies/order-policy.service';
import { OrdersRepository } from '../repositories/orders.repository';
export declare class OrderQueryService {
    private readonly ordersRepository;
    private readonly orderPolicyService;
    constructor(ordersRepository: OrdersRepository, orderPolicyService: OrderPolicyService);
    listRecentOrders(): Promise<OrderSummaryEntity[]>;
    listCustomerOrders(currentUser: AuthenticatedUserEntity): Promise<OrderSummaryEntity[]>;
    getCustomerOrderDetail(currentUser: AuthenticatedUserEntity, orderId: string): Promise<OrderDetailEntity>;
    listMerchantOrders(currentUser: AuthenticatedUserEntity): Promise<OrderSummaryEntity[]>;
    getMerchantOrderDetail(currentUser: AuthenticatedUserEntity, orderId: string): Promise<OrderDetailEntity>;
    listRiderOrders(currentUser: AuthenticatedUserEntity): Promise<OrderSummaryEntity[]>;
    getRiderOrderDetail(currentUser: AuthenticatedUserEntity, orderId: string): Promise<OrderDetailEntity>;
    listAdminOrders(currentUser: AuthenticatedUserEntity): Promise<OrderSummaryEntity[]>;
    getAdminOrderDetail(currentUser: AuthenticatedUserEntity, orderId: string): Promise<OrderDetailEntity>;
    buildOrderSummary(order: OrderSummaryRecord): OrderSummaryEntity;
    buildOrderDetail(order: OrderDetailRecord): OrderDetailEntity;
    buildOrderTimelineEntry(timelineEntry: OrderTimelineEntryRecord): OrderTimelineEntryEntity;
    private mapRequiredOrderDetail;
    attachAvailableActions<T extends OrderSummaryEntity>(currentUser: AuthenticatedUserEntity, order: T): T;
    private requireCustomerProfileId;
    private requireMerchantId;
    private requireRiderId;
    private buildForbidden;
}

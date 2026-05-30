import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
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
    private readonly ordersRepository;
    private readonly orderPolicyService;
    private readonly orderQueryService;
    private readonly systemMessageService;
    constructor(ordersRepository: OrdersRepository, orderPolicyService: OrderPolicyService, orderQueryService: OrderQueryService, systemMessageService: SystemMessageService);
    cancelCurrentCustomerOrder(currentUser: AuthenticatedUserEntity, input: CancelCustomerOrderInput | (CancelOrderDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
}
export {};

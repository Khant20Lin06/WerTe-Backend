import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
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
    private readonly ordersRepository;
    private readonly orderPolicyService;
    private readonly orderQueryService;
    private readonly systemMessageService;
    constructor(ordersRepository: OrdersRepository, orderPolicyService: OrderPolicyService, orderQueryService: OrderQueryService, systemMessageService: SystemMessageService);
    acceptCurrentMerchantOrder(currentUser: AuthenticatedUserEntity, input: MerchantOrderActionInput | (MerchantOrderActionDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    rejectCurrentMerchantOrder(currentUser: AuthenticatedUserEntity, input: MerchantOrderActionInput | (MerchantOrderActionDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    markPreparingCurrentMerchantOrder(currentUser: AuthenticatedUserEntity, input: MerchantOrderActionInput | (MerchantOrderActionDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    private handleMerchantAction;
    private mapStatusToSystemMessageCode;
}
export {};

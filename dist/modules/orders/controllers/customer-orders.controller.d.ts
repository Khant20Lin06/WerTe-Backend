import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CheckoutSubmissionDto } from '../../checkout/dto/checkout-submission.dto';
import { CancelOrderDto } from '../dto/cancel-order.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderDetailDto } from '../dto/order-detail.dto';
import { OrderSummaryDto } from '../dto/order-summary.dto';
import { OrderCancellationService } from '../services/order-cancellation.service';
import { OrderCreationService } from '../services/order-creation.service';
import { OrderQueryService } from '../services/order-query.service';
export declare class CustomerOrdersController {
    private readonly orderCreationService;
    private readonly orderQueryService;
    private readonly orderCancellationService;
    constructor(orderCreationService: OrderCreationService, orderQueryService: OrderQueryService, orderCancellationService: OrderCancellationService);
    list(currentUser: AuthenticatedUserEntity): Promise<OrderSummaryDto[]>;
    detail(currentUser: AuthenticatedUserEntity, orderId: string): Promise<OrderDetailDto>;
    create(currentUser: AuthenticatedUserEntity, body: CreateOrderDto): Promise<CheckoutSubmissionDto>;
    cancel(currentUser: AuthenticatedUserEntity, orderId: string, body: CancelOrderDto): Promise<OrderDetailDto>;
}

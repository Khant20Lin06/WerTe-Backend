import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { DeliveriesRepository } from '../../deliveries/repositories/deliveries.repository';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { OrderDetailEntity } from '../../orders/entities/order-detail.entity';
import { OrderPolicyService } from '../../orders/policies/order-policy.service';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { OrderQueryService } from '../../orders/services/order-query.service';
import { RidersService } from '../../riders/services/riders.service';
import { AssignRiderDto } from '../dto/assign-rider.dto';
type AssignRiderInput = {
    orderId: string;
    riderId: string;
    etaMinutes?: number;
    reasonCode?: string;
    note?: string;
};
export declare class DispatchAssignmentService {
    private readonly prisma;
    private readonly ordersRepository;
    private readonly orderQueryService;
    private readonly orderPolicyService;
    private readonly deliveriesRepository;
    private readonly ridersService;
    private readonly systemMessageService;
    constructor(prisma: PrismaService, ordersRepository: OrdersRepository, orderQueryService: OrderQueryService, orderPolicyService: OrderPolicyService, deliveriesRepository: DeliveriesRepository, ridersService: RidersService, systemMessageService: SystemMessageService);
    assignRiderToOrder(currentUser: AuthenticatedUserEntity, input: AssignRiderInput | (AssignRiderDto & {
        orderId: string;
    })): Promise<OrderDetailEntity>;
    private requireAdminAccess;
    private normalizeOptionalString;
}
export {};

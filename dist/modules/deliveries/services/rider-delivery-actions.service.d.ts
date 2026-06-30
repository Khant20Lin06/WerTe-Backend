import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { DeliveryDetailEntity } from '../entities/delivery-detail.entity';
import { DeliveriesRepository } from '../repositories/deliveries.repository';
import { DeliveryQueryService } from './delivery-query.service';
type RiderDeliveryActionInput = {
    deliveryId: string;
    reasonCode?: string;
    note?: string;
};
export declare class RiderDeliveryActionsService {
    private readonly prisma;
    private readonly deliveriesRepository;
    private readonly ordersRepository;
    private readonly deliveryQueryService;
    private readonly systemMessageService;
    private readonly queueService;
    constructor(prisma: PrismaService, deliveriesRepository: DeliveriesRepository, ordersRepository: OrdersRepository, deliveryQueryService: DeliveryQueryService, systemMessageService: SystemMessageService, queueService: QueueService);
    acceptCurrentRiderDeliveryRequest(currentUser: AuthenticatedUserEntity, input: RiderDeliveryActionInput): Promise<DeliveryDetailEntity>;
    rejectCurrentRiderDeliveryRequest(currentUser: AuthenticatedUserEntity, input: RiderDeliveryActionInput): Promise<DeliveryDetailEntity>;
    markCurrentRiderPickedUp(currentUser: AuthenticatedUserEntity, input: RiderDeliveryActionInput): Promise<DeliveryDetailEntity>;
    markCurrentRiderOnTheWay(currentUser: AuthenticatedUserEntity, input: RiderDeliveryActionInput): Promise<DeliveryDetailEntity>;
    markCurrentRiderDelivered(currentUser: AuthenticatedUserEntity, input: RiderDeliveryActionInput): Promise<DeliveryDetailEntity>;
    cancelCurrentRiderDelivery(currentUser: AuthenticatedUserEntity, input: RiderDeliveryActionInput): Promise<void>;
    failCurrentRiderDelivery(currentUser: AuthenticatedUserEntity, input: RiderDeliveryActionInput): Promise<DeliveryDetailEntity>;
    private handleTransition;
    private requireRiderId;
    private requireReasonCode;
    private normalizeOptionalString;
}
export {};

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { DeliveryDetailEntity, DeliveryDetailRecord } from '../entities/delivery-detail.entity';
import { DeliveriesRepository } from '../repositories/deliveries.repository';
export declare class DeliveryQueryService {
    private readonly deliveriesRepository;
    constructor(deliveriesRepository: DeliveriesRepository);
    buildDeliveryDetail(delivery: DeliveryDetailRecord): DeliveryDetailEntity;
    getDeliveryDetail(deliveryId: string): Promise<DeliveryDetailEntity>;
    getOrderDeliveryDetail(orderId: string): Promise<DeliveryDetailEntity>;
    getRiderActiveDelivery(currentUser: AuthenticatedUserEntity): Promise<DeliveryDetailEntity | null>;
    getRiderDeliveryDetail(currentUser: AuthenticatedUserEntity, deliveryId: string): Promise<DeliveryDetailEntity>;
    private mapRequiredDelivery;
    private requireRiderId;
}

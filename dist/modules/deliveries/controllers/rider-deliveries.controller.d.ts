import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { DeliveryDetailDto } from '../dto/delivery-detail.dto';
import { RiderDeliveryActionDto } from '../dto/rider-delivery-action.dto';
import { RiderFailedDeliveryDto } from '../dto/rider-failed-delivery.dto';
import { RiderDeliveryActionsService } from '../services/rider-delivery-actions.service';
import { DeliveryQueryService } from '../services/delivery-query.service';
export declare class RiderDeliveriesController {
    private readonly deliveryQueryService;
    private readonly riderDeliveryActionsService;
    constructor(deliveryQueryService: DeliveryQueryService, riderDeliveryActionsService: RiderDeliveryActionsService);
    active(currentUser: AuthenticatedUserEntity): Promise<DeliveryDetailDto | null>;
    detail(currentUser: AuthenticatedUserEntity, deliveryId: string): Promise<DeliveryDetailDto>;
    accept(currentUser: AuthenticatedUserEntity, deliveryId: string): Promise<DeliveryDetailDto>;
    reject(currentUser: AuthenticatedUserEntity, deliveryId: string, body?: RiderDeliveryActionDto): Promise<DeliveryDetailDto>;
    markPickedUp(currentUser: AuthenticatedUserEntity, deliveryId: string): Promise<DeliveryDetailDto>;
    markOnTheWay(currentUser: AuthenticatedUserEntity, deliveryId: string): Promise<DeliveryDetailDto>;
    markDelivered(currentUser: AuthenticatedUserEntity, deliveryId: string): Promise<DeliveryDetailDto>;
    cancelPrePickup(currentUser: AuthenticatedUserEntity, deliveryId: string, body?: RiderDeliveryActionDto): Promise<void>;
    markFailed(currentUser: AuthenticatedUserEntity, deliveryId: string, body: RiderFailedDeliveryDto): Promise<DeliveryDetailDto>;
}

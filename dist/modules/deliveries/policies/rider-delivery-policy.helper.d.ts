import { DeliveryStatus, OrderStatus } from '@prisma/client';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
type RiderDeliveryPolicyRecord = {
    riderId: string | null;
    status: DeliveryStatus;
    order: {
        status: OrderStatus;
    };
};
export declare function canRiderAcceptDeliveryRequest(currentUser: AuthenticatedUserEntity, delivery: RiderDeliveryPolicyRecord): boolean;
export declare function canRiderRejectDeliveryRequest(currentUser: AuthenticatedUserEntity, delivery: RiderDeliveryPolicyRecord): boolean;
export declare function canRiderMarkDeliveryPickedUp(currentUser: AuthenticatedUserEntity, delivery: RiderDeliveryPolicyRecord): boolean;
export declare function canRiderMarkDeliveryOnTheWay(currentUser: AuthenticatedUserEntity, delivery: RiderDeliveryPolicyRecord): boolean;
export declare function canRiderMarkDeliveryDelivered(currentUser: AuthenticatedUserEntity, delivery: RiderDeliveryPolicyRecord): boolean;
export declare function canRiderMarkDeliveryFailed(currentUser: AuthenticatedUserEntity, delivery: RiderDeliveryPolicyRecord): boolean;
export declare function canRiderCancelPrePickup(currentUser: AuthenticatedUserEntity, delivery: RiderDeliveryPolicyRecord): boolean;
export {};

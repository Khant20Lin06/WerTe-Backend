import { DeliveryStatus, OrderStatus } from '@prisma/client';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';

type RiderDeliveryPolicyRecord = {
  riderId: string | null;
  status: DeliveryStatus;
  order: {
    status: OrderStatus;
  };
};

function hasRiderScope(
  currentUser: AuthenticatedUserEntity,
  delivery: RiderDeliveryPolicyRecord,
): boolean {
  const riderId = currentUser.actorContext.riderId;

  return riderId !== undefined && delivery.riderId === riderId;
}

export function canRiderAcceptDeliveryRequest(
  currentUser: AuthenticatedUserEntity,
  delivery: RiderDeliveryPolicyRecord,
): boolean {
  return (
    hasRiderScope(currentUser, delivery) &&
    delivery.order.status === OrderStatus.RIDER_ASSIGNED &&
    delivery.status === DeliveryStatus.ASSIGNED
  );
}

export function canRiderRejectDeliveryRequest(
  currentUser: AuthenticatedUserEntity,
  delivery: RiderDeliveryPolicyRecord,
): boolean {
  return canRiderAcceptDeliveryRequest(currentUser, delivery);
}

export function canRiderMarkDeliveryPickedUp(
  currentUser: AuthenticatedUserEntity,
  delivery: RiderDeliveryPolicyRecord,
): boolean {
  return (
    hasRiderScope(currentUser, delivery) &&
    delivery.order.status === OrderStatus.RIDER_ACCEPTED &&
    delivery.status === DeliveryStatus.ACCEPTED
  );
}

export function canRiderMarkDeliveryOnTheWay(
  currentUser: AuthenticatedUserEntity,
  delivery: RiderDeliveryPolicyRecord,
): boolean {
  return (
    hasRiderScope(currentUser, delivery) &&
    delivery.order.status === OrderStatus.PICKED_UP &&
    delivery.status === DeliveryStatus.PICKED_UP
  );
}

export function canRiderMarkDeliveryDelivered(
  currentUser: AuthenticatedUserEntity,
  delivery: RiderDeliveryPolicyRecord,
): boolean {
  return (
    hasRiderScope(currentUser, delivery) &&
    delivery.order.status === OrderStatus.ON_THE_WAY &&
    delivery.status === DeliveryStatus.ON_THE_WAY
  );
}

export function canRiderMarkDeliveryFailed(
  currentUser: AuthenticatedUserEntity,
  delivery: RiderDeliveryPolicyRecord,
): boolean {
  const canFailOrder =
    delivery.order.status === OrderStatus.PICKED_UP ||
    delivery.order.status === OrderStatus.ON_THE_WAY;
  const canFailDelivery =
    delivery.status === DeliveryStatus.PICKED_UP ||
    delivery.status === DeliveryStatus.ON_THE_WAY;

  return (
    hasRiderScope(currentUser, delivery) &&
    canFailOrder &&
    canFailDelivery
  );
}

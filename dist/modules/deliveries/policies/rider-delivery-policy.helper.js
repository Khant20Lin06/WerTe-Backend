"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canRiderAcceptDeliveryRequest = canRiderAcceptDeliveryRequest;
exports.canRiderRejectDeliveryRequest = canRiderRejectDeliveryRequest;
exports.canRiderMarkDeliveryPickedUp = canRiderMarkDeliveryPickedUp;
exports.canRiderMarkDeliveryOnTheWay = canRiderMarkDeliveryOnTheWay;
exports.canRiderMarkDeliveryDelivered = canRiderMarkDeliveryDelivered;
exports.canRiderMarkDeliveryFailed = canRiderMarkDeliveryFailed;
exports.canRiderCancelPrePickup = canRiderCancelPrePickup;
const client_1 = require("@prisma/client");
function hasRiderScope(currentUser, delivery) {
    const riderId = currentUser.actorContext.riderId;
    return riderId !== undefined && delivery.riderId === riderId;
}
function canRiderAcceptDeliveryRequest(currentUser, delivery) {
    return (hasRiderScope(currentUser, delivery) &&
        delivery.order.status === client_1.OrderStatus.RIDER_ASSIGNED &&
        delivery.status === client_1.DeliveryStatus.ASSIGNED);
}
function canRiderRejectDeliveryRequest(currentUser, delivery) {
    return canRiderAcceptDeliveryRequest(currentUser, delivery);
}
function canRiderMarkDeliveryPickedUp(currentUser, delivery) {
    return (hasRiderScope(currentUser, delivery) &&
        delivery.order.status === client_1.OrderStatus.READY &&
        (delivery.status === client_1.DeliveryStatus.ACCEPTED ||
            delivery.status === client_1.DeliveryStatus.ASSIGNED));
}
function canRiderMarkDeliveryOnTheWay(currentUser, delivery) {
    return (hasRiderScope(currentUser, delivery) &&
        delivery.order.status === client_1.OrderStatus.PICKED_UP &&
        delivery.status === client_1.DeliveryStatus.PICKED_UP);
}
function canRiderMarkDeliveryDelivered(currentUser, delivery) {
    return (hasRiderScope(currentUser, delivery) &&
        delivery.order.status === client_1.OrderStatus.ON_THE_WAY &&
        delivery.status === client_1.DeliveryStatus.ON_THE_WAY);
}
function canRiderMarkDeliveryFailed(currentUser, delivery) {
    const canFailOrder = delivery.order.status === client_1.OrderStatus.PICKED_UP ||
        delivery.order.status === client_1.OrderStatus.ON_THE_WAY;
    const canFailDelivery = delivery.status === client_1.DeliveryStatus.PICKED_UP ||
        delivery.status === client_1.DeliveryStatus.ON_THE_WAY;
    return (hasRiderScope(currentUser, delivery) &&
        canFailOrder &&
        canFailDelivery);
}
function canRiderCancelPrePickup(currentUser, delivery) {
    const cancellableOrderStatuses = [
        client_1.OrderStatus.RIDER_ASSIGNED,
        client_1.OrderStatus.RIDER_ACCEPTED,
        client_1.OrderStatus.PREPARING,
        client_1.OrderStatus.READY,
    ];
    const cancellableDeliveryStatuses = [
        client_1.DeliveryStatus.ASSIGNED,
        client_1.DeliveryStatus.ACCEPTED,
    ];
    return (hasRiderScope(currentUser, delivery) &&
        cancellableOrderStatuses.includes(delivery.order.status) &&
        cancellableDeliveryStatuses.includes(delivery.status));
}
//# sourceMappingURL=rider-delivery-policy.helper.js.map
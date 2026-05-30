"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canIngestRiderLocation = canIngestRiderLocation;
exports.isDuplicateRiderLocation = isDuplicateRiderLocation;
const client_1 = require("@prisma/client");
function canIngestRiderLocation(rider, hasActiveDelivery) {
    if (rider.user.status !== client_1.UserStatus.ACTIVE ||
        rider.status !== client_1.RiderStatus.ACTIVE) {
        return false;
    }
    return hasActiveDelivery || rider.availability?.isOnline === true;
}
function isDuplicateRiderLocation(currentLocation, payload) {
    if (currentLocation === null) {
        return false;
    }
    return (currentLocation.deliveryId === payload.deliveryId &&
        currentLocation.latitude.toString() === payload.latitude.toString() &&
        currentLocation.longitude.toString() === payload.longitude.toString() &&
        sameOptionalDecimal(currentLocation.heading, payload.heading) &&
        sameOptionalDecimal(currentLocation.speed, payload.speed) &&
        sameOptionalDecimal(currentLocation.accuracyMeters, payload.accuracyMeters) &&
        currentLocation.recordedAt.getTime() === payload.recordedAt.getTime());
}
function sameOptionalDecimal(currentValue, nextValue) {
    if (currentValue === null && nextValue === null) {
        return true;
    }
    if (currentValue === null || nextValue === null) {
        return false;
    }
    return currentValue.toString() === nextValue.toString();
}
//# sourceMappingURL=rider-location-policy.helper.js.map
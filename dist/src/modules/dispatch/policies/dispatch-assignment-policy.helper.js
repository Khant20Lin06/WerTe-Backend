"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDispatchEligibleRider = isDispatchEligibleRider;
const client_1 = require("@prisma/client");
function isDispatchEligibleRider(rider) {
    return (rider.status === client_1.RiderStatus.ACTIVE &&
        rider.user.status === client_1.UserStatus.ACTIVE &&
        rider.availability?.isOnline === true &&
        rider.availability?.isAvailable === true);
}
//# sourceMappingURL=dispatch-assignment-policy.helper.js.map
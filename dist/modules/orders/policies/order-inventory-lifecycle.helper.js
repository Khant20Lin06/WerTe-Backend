"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldReleaseInventoryForOrderTransition = shouldReleaseInventoryForOrderTransition;
const client_1 = require("@prisma/client");
const INVENTORY_RELEASE_TO_STATUSES = new Set([
    client_1.OrderStatus.CANCELLED,
    client_1.OrderStatus.MERCHANT_REJECTED,
]);
const INVENTORY_RELEASABLE_FROM_STATUSES = new Set([
    client_1.OrderStatus.PLACED,
    client_1.OrderStatus.MERCHANT_ACCEPTED,
]);
function shouldReleaseInventoryForOrderTransition(fromStatus, toStatus) {
    if (fromStatus === toStatus) {
        return false;
    }
    return (INVENTORY_RELEASE_TO_STATUSES.has(toStatus) &&
        INVENTORY_RELEASABLE_FROM_STATUSES.has(fromStatus));
}
//# sourceMappingURL=order-inventory-lifecycle.helper.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasCustomerOrderAccess = hasCustomerOrderAccess;
exports.hasMerchantOrderAccess = hasMerchantOrderAccess;
exports.hasRiderOrderAccess = hasRiderOrderAccess;
const client_1 = require("@prisma/client");
const tenant_access_policy_helper_1 = require("../../../common/policies/tenant-access-policy.helper");
function hasCustomerOrderAccess({ currentUser, order, }) {
    return (0, tenant_access_policy_helper_1.hasOwnedResourceAccess)({
        currentUser,
        expectedRole: client_1.UserRole.CUSTOMER,
        ownerUserId: order.customer.userId,
        resourceId: order.customer.customerProfileId,
        actorScopedResourceId: currentUser.actorContext.customerProfileId,
    });
}
function hasMerchantOrderAccess({ currentUser, order, }) {
    return (0, tenant_access_policy_helper_1.hasOwnedResourceAccess)({
        currentUser,
        expectedRole: client_1.UserRole.MERCHANT,
        ownerUserId: order.branch.merchantUserId,
        resourceId: order.branch.merchantId,
        actorScopedResourceId: currentUser.actorContext.merchantId,
    });
}
function hasRiderOrderAccess({ currentUser, order, }) {
    const rider = order.delivery?.rider;
    if (rider === null || rider === undefined) {
        return false;
    }
    return (0, tenant_access_policy_helper_1.hasOwnedResourceAccess)({
        currentUser,
        expectedRole: client_1.UserRole.RIDER,
        ownerUserId: rider.userId,
        resourceId: rider.riderId,
        actorScopedResourceId: currentUser.actorContext.riderId,
    });
}
//# sourceMappingURL=order-access-policy.helper.js.map
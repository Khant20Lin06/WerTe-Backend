"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasCheckoutCustomerAccess = hasCheckoutCustomerAccess;
const client_1 = require("@prisma/client");
const tenant_access_policy_helper_1 = require("../../../common/policies/tenant-access-policy.helper");
function hasCheckoutCustomerAccess({ currentUser, ownerUserId, customerProfileId, }) {
    return (0, tenant_access_policy_helper_1.hasOwnedResourceAccess)({
        currentUser,
        expectedRole: client_1.UserRole.CUSTOMER,
        ownerUserId,
        resourceId: customerProfileId,
        actorScopedResourceId: currentUser.actorContext.customerProfileId,
    });
}
//# sourceMappingURL=checkout-customer-access-policy.helper.js.map
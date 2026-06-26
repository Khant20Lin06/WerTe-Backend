"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMerchantCatalogAccess = hasMerchantCatalogAccess;
const client_1 = require("@prisma/client");
const tenant_access_policy_helper_1 = require("../../../common/policies/tenant-access-policy.helper");
function hasMerchantCatalogAccess({ currentUser, ownerUserId, merchantId, }) {
    return (0, tenant_access_policy_helper_1.hasOwnedResourceAccess)({
        currentUser,
        expectedRole: client_1.UserRole.MERCHANT,
        ownerUserId,
        resourceId: merchantId,
        actorScopedResourceId: currentUser.actorContext.merchantId,
    });
}
//# sourceMappingURL=menu-catalog-access-policy.helper.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchPolicyService = void 0;
const common_1 = require("@nestjs/common");
const tenant_access_policy_helper_1 = require("../../../common/policies/tenant-access-policy.helper");
const client_1 = require("@prisma/client");
let BranchPolicyService = class BranchPolicyService {
    canManageMerchant(currentUser, merchant) {
        return (0, tenant_access_policy_helper_1.hasOwnedResourceAccess)({
            currentUser,
            expectedRole: client_1.UserRole.MERCHANT,
            ownerUserId: merchant.user.id,
            resourceId: merchant.id,
            actorScopedResourceId: currentUser.actorContext.merchantId,
        });
    }
    canManageBranch(currentUser, branch) {
        return (0, tenant_access_policy_helper_1.hasOwnedResourceAccess)({
            currentUser,
            expectedRole: client_1.UserRole.MERCHANT,
            ownerUserId: branch.merchant.user.id,
            resourceId: branch.merchant.id,
            actorScopedResourceId: currentUser.actorContext.merchantId,
        });
    }
};
exports.BranchPolicyService = BranchPolicyService;
exports.BranchPolicyService = BranchPolicyService = __decorate([
    (0, common_1.Injectable)()
], BranchPolicyService);
//# sourceMappingURL=branch-policy.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreTypePolicyService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const tenant_access_policy_helper_1 = require("../../../common/policies/tenant-access-policy.helper");
let StoreTypePolicyService = class StoreTypePolicyService {
    canManageStoreTypes(currentUser) {
        return (0, tenant_access_policy_helper_1.hasRole)(currentUser, client_1.UserRole.ADMIN);
    }
    canBrowseStoreTypes(currentUser) {
        return (0, tenant_access_policy_helper_1.hasAnyRole)(currentUser, [client_1.UserRole.ADMIN, client_1.UserRole.MERCHANT]);
    }
    canRequestStoreTypes(currentUser) {
        return (0, tenant_access_policy_helper_1.hasRole)(currentUser, client_1.UserRole.MERCHANT);
    }
};
exports.StoreTypePolicyService = StoreTypePolicyService;
exports.StoreTypePolicyService = StoreTypePolicyService = __decorate([
    (0, common_1.Injectable)()
], StoreTypePolicyService);
//# sourceMappingURL=store-type-policy.service.js.map
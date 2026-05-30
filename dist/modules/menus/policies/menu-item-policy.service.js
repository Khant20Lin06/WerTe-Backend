"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItemPolicyService = void 0;
const common_1 = require("@nestjs/common");
const menu_catalog_access_policy_helper_1 = require("./menu-catalog-access-policy.helper");
let MenuItemPolicyService = class MenuItemPolicyService {
    canManageBranchCatalog(currentUser, branch) {
        return (0, menu_catalog_access_policy_helper_1.hasMerchantCatalogAccess)({
            currentUser,
            ownerUserId: branch.merchant.user.id,
            merchantId: branch.merchant.id,
        });
    }
    canUseCategory(currentUser, category) {
        return (0, menu_catalog_access_policy_helper_1.hasMerchantCatalogAccess)({
            currentUser,
            ownerUserId: category.branch.merchant.user.id,
            merchantId: category.branch.merchant.id,
        });
    }
    canManageItem(currentUser, item) {
        return (0, menu_catalog_access_policy_helper_1.hasMerchantCatalogAccess)({
            currentUser,
            ownerUserId: item.branch.merchant.user.id,
            merchantId: item.branch.merchant.id,
        });
    }
};
exports.MenuItemPolicyService = MenuItemPolicyService;
exports.MenuItemPolicyService = MenuItemPolicyService = __decorate([
    (0, common_1.Injectable)()
], MenuItemPolicyService);
//# sourceMappingURL=menu-item-policy.service.js.map
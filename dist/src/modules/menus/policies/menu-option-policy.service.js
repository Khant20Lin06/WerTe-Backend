"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuOptionPolicyService = void 0;
const common_1 = require("@nestjs/common");
const menu_catalog_access_policy_helper_1 = require("./menu-catalog-access-policy.helper");
let MenuOptionPolicyService = class MenuOptionPolicyService {
    canManageOptionGroup(currentUser, optionGroup) {
        return (0, menu_catalog_access_policy_helper_1.hasMerchantCatalogAccess)({
            currentUser,
            ownerUserId: optionGroup.menuItem.branch.merchant.user.id,
            merchantId: optionGroup.menuItem.branch.merchant.id,
        });
    }
    canManageOption(currentUser, option) {
        return (0, menu_catalog_access_policy_helper_1.hasMerchantCatalogAccess)({
            currentUser,
            ownerUserId: option.group.menuItem.branch.merchant.user.id,
            merchantId: option.group.menuItem.branch.merchant.id,
        });
    }
};
exports.MenuOptionPolicyService = MenuOptionPolicyService;
exports.MenuOptionPolicyService = MenuOptionPolicyService = __decorate([
    (0, common_1.Injectable)()
], MenuOptionPolicyService);
//# sourceMappingURL=menu-option-policy.service.js.map
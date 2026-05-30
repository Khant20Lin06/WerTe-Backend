"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantsModule = void 0;
const common_1 = require("@nestjs/common");
const merchant_profile_controller_1 = require("./controllers/merchant-profile.controller");
const merchant_policy_service_1 = require("./policies/merchant-policy.service");
const merchants_repository_1 = require("./repositories/merchants.repository");
const merchant_account_service_1 = require("./services/merchant-account.service");
const merchants_service_1 = require("./services/merchants.service");
let MerchantsModule = class MerchantsModule {
};
exports.MerchantsModule = MerchantsModule;
exports.MerchantsModule = MerchantsModule = __decorate([
    (0, common_1.Module)({
        controllers: [merchant_profile_controller_1.MerchantProfileController],
        providers: [
            merchants_repository_1.MerchantsRepository,
            merchants_service_1.MerchantsService,
            merchant_account_service_1.MerchantAccountService,
            merchant_policy_service_1.MerchantPolicyService,
        ],
        exports: [merchants_service_1.MerchantsService, merchant_account_service_1.MerchantAccountService, merchant_policy_service_1.MerchantPolicyService],
    })
], MerchantsModule);
//# sourceMappingURL=merchants.module.js.map
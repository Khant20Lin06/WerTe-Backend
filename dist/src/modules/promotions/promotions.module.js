"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsModule = void 0;
const common_1 = require("@nestjs/common");
const branches_module_1 = require("../branches/branches.module");
const admin_promotions_controller_1 = require("./controllers/admin-promotions.controller");
const merchant_promotions_controller_1 = require("./controllers/merchant-promotions.controller");
const promotion_pricing_service_1 = require("./services/promotion-pricing.service");
const admin_promotions_service_1 = require("./services/admin-promotions.service");
const merchant_promotions_service_1 = require("./services/merchant-promotions.service");
const promotions_repository_1 = require("./repositories/promotions.repository");
let PromotionsModule = class PromotionsModule {
};
exports.PromotionsModule = PromotionsModule;
exports.PromotionsModule = PromotionsModule = __decorate([
    (0, common_1.Module)({
        imports: [branches_module_1.BranchesModule],
        controllers: [merchant_promotions_controller_1.MerchantPromotionsController, admin_promotions_controller_1.AdminPromotionsController],
        providers: [
            promotions_repository_1.PromotionsRepository,
            promotion_pricing_service_1.PromotionPricingService,
            merchant_promotions_service_1.MerchantPromotionsService,
            admin_promotions_service_1.AdminPromotionsService,
        ],
        exports: [
            promotions_repository_1.PromotionsRepository,
            promotion_pricing_service_1.PromotionPricingService,
            merchant_promotions_service_1.MerchantPromotionsService,
        ],
    })
], PromotionsModule);
//# sourceMappingURL=promotions.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchesModule = void 0;
const common_1 = require("@nestjs/common");
const merchants_module_1 = require("../merchants/merchants.module");
const zones_module_1 = require("../zones/zones.module");
const merchant_branches_controller_1 = require("./controllers/merchant-branches.controller");
const branch_policy_service_1 = require("./policies/branch-policy.service");
const branches_repository_1 = require("./repositories/branches.repository");
const merchant_branches_service_1 = require("./services/merchant-branches.service");
const branches_service_1 = require("./services/branches.service");
let BranchesModule = class BranchesModule {
};
exports.BranchesModule = BranchesModule;
exports.BranchesModule = BranchesModule = __decorate([
    (0, common_1.Module)({
        imports: [merchants_module_1.MerchantsModule, zones_module_1.ZonesModule],
        controllers: [merchant_branches_controller_1.MerchantBranchesController],
        providers: [
            branches_repository_1.BranchesRepository,
            branches_service_1.BranchesService,
            merchant_branches_service_1.MerchantBranchesService,
            branch_policy_service_1.BranchPolicyService,
        ],
        exports: [branches_service_1.BranchesService, merchant_branches_service_1.MerchantBranchesService],
    })
], BranchesModule);
//# sourceMappingURL=branches.module.js.map
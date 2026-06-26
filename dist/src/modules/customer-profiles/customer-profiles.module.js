"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerProfilesModule = void 0;
const common_1 = require("@nestjs/common");
const admin_customers_controller_1 = require("./controllers/admin-customers.controller");
const customer_profile_controller_1 = require("./controllers/customer-profile.controller");
const customer_profile_policy_service_1 = require("./policies/customer-profile-policy.service");
const customer_profiles_repository_1 = require("./repositories/customer-profiles.repository");
const admin_customer_management_service_1 = require("./services/admin-customer-management.service");
const customer_profile_account_service_1 = require("./services/customer-profile-account.service");
const customer_profiles_service_1 = require("./services/customer-profiles.service");
let CustomerProfilesModule = class CustomerProfilesModule {
};
exports.CustomerProfilesModule = CustomerProfilesModule;
exports.CustomerProfilesModule = CustomerProfilesModule = __decorate([
    (0, common_1.Module)({
        controllers: [customer_profile_controller_1.CustomerProfileController, admin_customers_controller_1.AdminCustomersController],
        providers: [
            customer_profiles_repository_1.CustomerProfilesRepository,
            customer_profiles_service_1.CustomerProfilesService,
            customer_profile_account_service_1.CustomerProfileAccountService,
            customer_profile_policy_service_1.CustomerProfilePolicyService,
            admin_customer_management_service_1.AdminCustomerManagementService,
        ],
        exports: [customer_profiles_service_1.CustomerProfilesService],
    })
], CustomerProfilesModule);
//# sourceMappingURL=customer-profiles.module.js.map
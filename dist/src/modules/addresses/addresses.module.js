"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressesModule = void 0;
const common_1 = require("@nestjs/common");
const customer_profiles_module_1 = require("../customer-profiles/customer-profiles.module");
const customer_addresses_controller_1 = require("./controllers/customer-addresses.controller");
const address_policy_service_1 = require("./policies/address-policy.service");
const addresses_repository_1 = require("./repositories/addresses.repository");
const addresses_service_1 = require("./services/addresses.service");
const customer_addresses_service_1 = require("./services/customer-addresses.service");
let AddressesModule = class AddressesModule {
};
exports.AddressesModule = AddressesModule;
exports.AddressesModule = AddressesModule = __decorate([
    (0, common_1.Module)({
        imports: [customer_profiles_module_1.CustomerProfilesModule],
        controllers: [customer_addresses_controller_1.CustomerAddressesController],
        providers: [
            addresses_repository_1.AddressesRepository,
            addresses_service_1.AddressesService,
            customer_addresses_service_1.CustomerAddressesService,
            address_policy_service_1.AddressPolicyService,
        ],
        exports: [addresses_service_1.AddressesService],
    })
], AddressesModule);
//# sourceMappingURL=addresses.module.js.map
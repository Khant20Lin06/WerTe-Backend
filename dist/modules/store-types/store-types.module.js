"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreTypesModule = void 0;
const common_1 = require("@nestjs/common");
const audit_module_1 = require("../audit/audit.module");
const menus_module_1 = require("../menus/menus.module");
const admin_branch_store_types_controller_1 = require("./controllers/admin-branch-store-types.controller");
const admin_store_types_controller_1 = require("./controllers/admin-store-types.controller");
const customer_stores_controller_1 = require("./controllers/customer-stores.controller");
const merchant_store_types_controller_1 = require("./controllers/merchant-store-types.controller");
const store_type_policy_service_1 = require("./policies/store-type-policy.service");
const store_types_repository_1 = require("./repositories/store-types.repository");
const customer_store_discovery_service_1 = require("./services/customer-store-discovery.service");
const discovery_cache_service_1 = require("./services/discovery-cache.service");
const merchant_store_type_request_service_1 = require("./services/merchant-store-type-request.service");
const store_type_cache_service_1 = require("./services/store-type-cache.service");
const store_type_management_service_1 = require("./services/store-type-management.service");
let StoreTypesModule = class StoreTypesModule {
};
exports.StoreTypesModule = StoreTypesModule;
exports.StoreTypesModule = StoreTypesModule = __decorate([
    (0, common_1.Module)({
        imports: [audit_module_1.AuditModule, menus_module_1.MenusModule],
        controllers: [
            admin_store_types_controller_1.AdminStoreTypesController,
            admin_branch_store_types_controller_1.AdminBranchStoreTypesController,
            merchant_store_types_controller_1.MerchantStoreTypesController,
            customer_stores_controller_1.CustomerStoresController,
        ],
        providers: [
            store_types_repository_1.StoreTypesRepository,
            store_type_cache_service_1.StoreTypeCacheService,
            discovery_cache_service_1.DiscoveryCacheService,
            store_type_management_service_1.StoreTypeManagementService,
            customer_store_discovery_service_1.CustomerStoreDiscoveryService,
            merchant_store_type_request_service_1.MerchantStoreTypeRequestService,
            store_type_policy_service_1.StoreTypePolicyService,
        ],
        exports: [
            store_types_repository_1.StoreTypesRepository,
            store_type_management_service_1.StoreTypeManagementService,
            customer_store_discovery_service_1.CustomerStoreDiscoveryService,
            merchant_store_type_request_service_1.MerchantStoreTypeRequestService,
            store_type_policy_service_1.StoreTypePolicyService,
        ],
    })
], StoreTypesModule);
//# sourceMappingURL=store-types.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZonesModule = void 0;
const common_1 = require("@nestjs/common");
const admin_zones_controller_1 = require("./controllers/admin-zones.controller");
const merchant_zones_controller_1 = require("./controllers/merchant-zones.controller");
const zone_policy_service_1 = require("./policies/zone-policy.service");
const zones_repository_1 = require("./repositories/zones.repository");
const zone_management_service_1 = require("./services/zone-management.service");
const zones_service_1 = require("./services/zones.service");
let ZonesModule = class ZonesModule {
};
exports.ZonesModule = ZonesModule;
exports.ZonesModule = ZonesModule = __decorate([
    (0, common_1.Module)({
        controllers: [admin_zones_controller_1.AdminZonesController, merchant_zones_controller_1.MerchantZonesController],
        providers: [
            zones_repository_1.ZonesRepository,
            zones_service_1.ZonesService,
            zone_management_service_1.ZoneManagementService,
            zone_policy_service_1.ZonePolicyService,
        ],
        exports: [zones_service_1.ZonesService, zone_management_service_1.ZoneManagementService, zone_policy_service_1.ZonePolicyService],
    })
], ZonesModule);
//# sourceMappingURL=zones.module.js.map
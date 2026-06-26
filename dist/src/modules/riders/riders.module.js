"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RidersModule = void 0;
const common_1 = require("@nestjs/common");
const deliveries_module_1 = require("../deliveries/deliveries.module");
const admin_riders_controller_1 = require("./controllers/admin-riders.controller");
const rider_availability_controller_1 = require("./controllers/rider-availability.controller");
const rider_location_controller_1 = require("./controllers/rider-location.controller");
const rider_profile_controller_1 = require("./controllers/rider-profile.controller");
const rider_policy_service_1 = require("./policies/rider-policy.service");
const riders_repository_1 = require("./repositories/riders.repository");
const admin_rider_management_service_1 = require("./services/admin-rider-management.service");
const rider_account_service_1 = require("./services/rider-account.service");
const rider_availability_service_1 = require("./services/rider-availability.service");
const rider_location_service_1 = require("./services/rider-location.service");
const riders_service_1 = require("./services/riders.service");
let RidersModule = class RidersModule {
};
exports.RidersModule = RidersModule;
exports.RidersModule = RidersModule = __decorate([
    (0, common_1.Module)({
        imports: [deliveries_module_1.DeliveriesModule],
        controllers: [
            rider_profile_controller_1.RiderProfileController,
            rider_availability_controller_1.RiderAvailabilityController,
            rider_location_controller_1.RiderLocationController,
            admin_riders_controller_1.AdminRidersController,
        ],
        providers: [
            riders_repository_1.RidersRepository,
            riders_service_1.RidersService,
            rider_account_service_1.RiderAccountService,
            rider_availability_service_1.RiderAvailabilityService,
            rider_location_service_1.RiderLocationService,
            rider_policy_service_1.RiderPolicyService,
            admin_rider_management_service_1.AdminRiderManagementService,
        ],
        exports: [
            riders_service_1.RidersService,
            rider_account_service_1.RiderAccountService,
            rider_availability_service_1.RiderAvailabilityService,
            rider_location_service_1.RiderLocationService,
            rider_policy_service_1.RiderPolicyService,
        ],
    })
], RidersModule);
//# sourceMappingURL=riders.module.js.map
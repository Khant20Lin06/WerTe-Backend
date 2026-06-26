"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingsModule = void 0;
const common_1 = require("@nestjs/common");
const admin_ratings_controller_1 = require("./controllers/admin-ratings.controller");
const customer_ratings_controller_1 = require("./controllers/customer-ratings.controller");
const merchant_ratings_controller_1 = require("./controllers/merchant-ratings.controller");
const rider_ratings_controller_1 = require("./controllers/rider-ratings.controller");
const ratings_repository_1 = require("./repositories/ratings.repository");
const ratings_service_1 = require("./ratings.service");
let RatingsModule = class RatingsModule {
};
exports.RatingsModule = RatingsModule;
exports.RatingsModule = RatingsModule = __decorate([
    (0, common_1.Module)({
        controllers: [admin_ratings_controller_1.AdminRatingsController, customer_ratings_controller_1.CustomerRatingsController, merchant_ratings_controller_1.MerchantRatingsController, rider_ratings_controller_1.RiderRatingsController],
        providers: [ratings_service_1.RatingsService, ratings_repository_1.RatingsRepository],
        exports: [ratings_service_1.RatingsService],
    })
], RatingsModule);
//# sourceMappingURL=ratings.module.js.map
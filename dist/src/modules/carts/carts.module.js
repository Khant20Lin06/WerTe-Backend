"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartsModule = void 0;
const common_1 = require("@nestjs/common");
const customer_profiles_module_1 = require("../customer-profiles/customer-profiles.module");
const menus_module_1 = require("../menus/menus.module");
const customer_cart_controller_1 = require("./controllers/customer-cart.controller");
const carts_repository_1 = require("./repositories/carts.repository");
const cart_mutation_service_1 = require("./services/cart-mutation.service");
const cart_pricing_service_1 = require("./services/cart-pricing.service");
const cart_query_service_1 = require("./services/cart-query.service");
const carts_service_1 = require("./services/carts.service");
const customer_cart_service_1 = require("./services/customer-cart.service");
let CartsModule = class CartsModule {
};
exports.CartsModule = CartsModule;
exports.CartsModule = CartsModule = __decorate([
    (0, common_1.Module)({
        imports: [customer_profiles_module_1.CustomerProfilesModule, menus_module_1.MenusModule],
        controllers: [customer_cart_controller_1.CustomerCartController],
        providers: [
            carts_repository_1.CartsRepository,
            carts_service_1.CartsService,
            cart_query_service_1.CartQueryService,
            cart_pricing_service_1.CartPricingService,
            cart_mutation_service_1.CartMutationService,
            customer_cart_service_1.CustomerCartService,
        ],
        exports: [
            carts_repository_1.CartsRepository,
            carts_service_1.CartsService,
            cart_query_service_1.CartQueryService,
            cart_pricing_service_1.CartPricingService,
            cart_mutation_service_1.CartMutationService,
            customer_cart_service_1.CustomerCartService,
        ],
    })
], CartsModule);
//# sourceMappingURL=carts.module.js.map
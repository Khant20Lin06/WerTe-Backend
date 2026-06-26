"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutModule = void 0;
const common_1 = require("@nestjs/common");
const addresses_module_1 = require("../addresses/addresses.module");
const branches_module_1 = require("../branches/branches.module");
const carts_module_1 = require("../carts/carts.module");
const customer_profiles_module_1 = require("../customer-profiles/customer-profiles.module");
const messaging_module_1 = require("../messaging/messaging.module");
const menus_module_1 = require("../menus/menus.module");
const notifications_module_1 = require("../notifications/notifications.module");
const orders_module_1 = require("../orders/orders.module");
const payments_module_1 = require("../payments/payments.module");
const promotions_module_1 = require("../promotions/promotions.module");
const customer_checkout_controller_1 = require("./controllers/customer-checkout.controller");
const checkout_context_service_1 = require("./services/checkout-context.service");
const checkout_preview_service_1 = require("./services/checkout-preview.service");
const checkout_pricing_service_1 = require("./services/checkout-pricing.service");
const checkout_submission_service_1 = require("./services/checkout-submission.service");
const checkout_validation_service_1 = require("./services/checkout-validation.service");
let CheckoutModule = class CheckoutModule {
};
exports.CheckoutModule = CheckoutModule;
exports.CheckoutModule = CheckoutModule = __decorate([
    (0, common_1.Module)({
        imports: [
            customer_profiles_module_1.CustomerProfilesModule,
            addresses_module_1.AddressesModule,
            branches_module_1.BranchesModule,
            carts_module_1.CartsModule,
            menus_module_1.MenusModule,
            messaging_module_1.MessagingModule,
            notifications_module_1.NotificationsModule,
            payments_module_1.PaymentsModule,
            promotions_module_1.PromotionsModule,
            (0, common_1.forwardRef)(() => orders_module_1.OrdersModule),
        ],
        controllers: [customer_checkout_controller_1.CustomerCheckoutController],
        providers: [
            checkout_validation_service_1.CheckoutValidationService,
            checkout_context_service_1.CheckoutContextService,
            checkout_pricing_service_1.CheckoutPricingService,
            checkout_preview_service_1.CheckoutPreviewService,
            checkout_submission_service_1.CheckoutSubmissionService,
        ],
        exports: [
            checkout_validation_service_1.CheckoutValidationService,
            checkout_context_service_1.CheckoutContextService,
            checkout_pricing_service_1.CheckoutPricingService,
            checkout_preview_service_1.CheckoutPreviewService,
            checkout_submission_service_1.CheckoutSubmissionService,
        ],
    })
], CheckoutModule);
//# sourceMappingURL=checkout.module.js.map
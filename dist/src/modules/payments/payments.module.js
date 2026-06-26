"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const messaging_module_1 = require("../messaging/messaging.module");
const menus_module_1 = require("../menus/menus.module");
const notifications_module_1 = require("../notifications/notifications.module");
const orders_repository_1 = require("../orders/repositories/orders.repository");
const admin_order_payments_controller_1 = require("./controllers/admin-order-payments.controller");
const admin_payments_controller_1 = require("./controllers/admin-payments.controller");
const customer_payments_controller_1 = require("./controllers/customer-payments.controller");
const platform_payment_methods_controller_1 = require("./controllers/platform-payment-methods.controller");
const checkout_payment_intent_service_1 = require("./services/checkout-payment-intent.service");
const payments_repository_1 = require("./repositories/payments.repository");
const platform_payment_methods_repository_1 = require("./repositories/platform-payment-methods.repository");
const payment_lifecycle_service_1 = require("./services/payment-lifecycle.service");
const payment_provider_event_processor_service_1 = require("./services/payment-provider-event-processor.service");
const payment_provider_webhook_service_1 = require("./services/payment-provider-webhook.service");
const payments_service_1 = require("./services/payments.service");
const payments_rest_service_1 = require("./services/payments-rest.service");
const provider_webhook_normalizer_service_1 = require("./services/provider-webhook-normalizer.service");
const provider_webhook_signature_service_1 = require("./services/provider-webhook-signature.service");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [messaging_module_1.MessagingModule, menus_module_1.MenusModule, notifications_module_1.NotificationsModule],
        controllers: [
            customer_payments_controller_1.CustomerPaymentsController,
            admin_order_payments_controller_1.AdminOrderPaymentsController,
            admin_payments_controller_1.AdminPaymentsController,
            platform_payment_methods_controller_1.PlatformPaymentMethodsController,
        ],
        providers: [
            orders_repository_1.OrdersRepository,
            payments_repository_1.PaymentsRepository,
            platform_payment_methods_repository_1.PlatformPaymentMethodsRepository,
            payments_service_1.PaymentsService,
            payments_rest_service_1.PaymentsRestService,
            checkout_payment_intent_service_1.CheckoutPaymentIntentService,
            payment_lifecycle_service_1.PaymentLifecycleService,
            payment_provider_event_processor_service_1.PaymentProviderEventProcessorService,
            payment_provider_webhook_service_1.PaymentProviderWebhookService,
            provider_webhook_normalizer_service_1.ProviderWebhookNormalizerService,
            provider_webhook_signature_service_1.ProviderWebhookSignatureService,
        ],
        exports: [
            payments_repository_1.PaymentsRepository,
            platform_payment_methods_repository_1.PlatformPaymentMethodsRepository,
            payments_service_1.PaymentsService,
            payments_rest_service_1.PaymentsRestService,
            checkout_payment_intent_service_1.CheckoutPaymentIntentService,
            payment_lifecycle_service_1.PaymentLifecycleService,
            payment_provider_event_processor_service_1.PaymentProviderEventProcessorService,
            payment_provider_webhook_service_1.PaymentProviderWebhookService,
            provider_webhook_normalizer_service_1.ProviderWebhookNormalizerService,
            provider_webhook_signature_service_1.ProviderWebhookSignatureService,
        ],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map
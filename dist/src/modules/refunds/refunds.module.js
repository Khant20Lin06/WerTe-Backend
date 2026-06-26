"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundsModule = void 0;
const common_1 = require("@nestjs/common");
const messaging_module_1 = require("../messaging/messaging.module");
const payments_module_1 = require("../payments/payments.module");
const admin_order_refunds_controller_1 = require("./controllers/admin-order-refunds.controller");
const admin_refunds_controller_1 = require("./controllers/admin-refunds.controller");
const customer_refunds_controller_1 = require("./controllers/customer-refunds.controller");
const refunds_repository_1 = require("./repositories/refunds.repository");
const refund_provider_event_processor_service_1 = require("./services/refund-provider-event-processor.service");
const refund_provider_webhook_service_1 = require("./services/refund-provider-webhook.service");
const refund_operations_service_1 = require("./services/refund-operations.service");
const refunds_rest_service_1 = require("./services/refunds-rest.service");
const refunds_service_1 = require("./services/refunds.service");
let RefundsModule = class RefundsModule {
};
exports.RefundsModule = RefundsModule;
exports.RefundsModule = RefundsModule = __decorate([
    (0, common_1.Module)({
        imports: [payments_module_1.PaymentsModule, messaging_module_1.MessagingModule],
        controllers: [
            customer_refunds_controller_1.CustomerRefundsController,
            admin_order_refunds_controller_1.AdminOrderRefundsController,
            admin_refunds_controller_1.AdminRefundsController,
        ],
        providers: [
            refunds_repository_1.RefundsRepository,
            refunds_service_1.RefundsService,
            refunds_rest_service_1.RefundsRestService,
            refund_operations_service_1.RefundOperationsService,
            refund_provider_event_processor_service_1.RefundProviderEventProcessorService,
            refund_provider_webhook_service_1.RefundProviderWebhookService,
        ],
        exports: [
            refunds_repository_1.RefundsRepository,
            refunds_service_1.RefundsService,
            refunds_rest_service_1.RefundsRestService,
            refund_operations_service_1.RefundOperationsService,
            refund_provider_event_processor_service_1.RefundProviderEventProcessorService,
            refund_provider_webhook_service_1.RefundProviderWebhookService,
        ],
    })
], RefundsModule);
//# sourceMappingURL=refunds.module.js.map
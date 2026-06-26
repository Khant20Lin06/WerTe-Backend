"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderWebhooksModule = void 0;
const common_1 = require("@nestjs/common");
const payments_module_1 = require("../payments/payments.module");
const refunds_module_1 = require("../refunds/refunds.module");
const provider_webhooks_controller_1 = require("./controllers/provider-webhooks.controller");
const provider_webhook_secrets_service_1 = require("./services/provider-webhook-secrets.service");
let ProviderWebhooksModule = class ProviderWebhooksModule {
};
exports.ProviderWebhooksModule = ProviderWebhooksModule;
exports.ProviderWebhooksModule = ProviderWebhooksModule = __decorate([
    (0, common_1.Module)({
        imports: [payments_module_1.PaymentsModule, refunds_module_1.RefundsModule],
        controllers: [provider_webhooks_controller_1.ProviderWebhooksController],
        providers: [provider_webhook_secrets_service_1.ProviderWebhookSecretsService],
    })
], ProviderWebhooksModule);
//# sourceMappingURL=provider-webhooks.module.js.map
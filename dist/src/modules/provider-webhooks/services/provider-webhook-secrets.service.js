"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderWebhookSecretsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ProviderWebhookSecretsService = class ProviderWebhookSecretsService {
    constructor(configService) {
        this.configService = configService;
    }
    resolveSigningSecret(provider, kind) {
        const providerKey = provider.toUpperCase();
        const kindKey = kind.toUpperCase();
        const candidates = [
            `${providerKey}_${kindKey}_WEBHOOK_SIGNING_SECRET`,
            `${kindKey}_${providerKey}_WEBHOOK_SIGNING_SECRET`,
            `${providerKey}_WEBHOOK_SIGNING_SECRET`,
            `${kindKey}_WEBHOOK_SIGNING_SECRET`,
            'PROVIDER_WEBHOOK_SIGNING_SECRET',
        ];
        for (const key of candidates) {
            const value = this.configService.get(key);
            if (value !== undefined && value.trim() !== '') {
                return value;
            }
        }
        return null;
    }
};
exports.ProviderWebhookSecretsService = ProviderWebhookSecretsService;
exports.ProviderWebhookSecretsService = ProviderWebhookSecretsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ProviderWebhookSecretsService);
//# sourceMappingURL=provider-webhook-secrets.service.js.map
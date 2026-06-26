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
exports.ProviderWebhookSignatureService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
const client_1 = require("@prisma/client");
let ProviderWebhookSignatureService = class ProviderWebhookSignatureService {
    constructor(configService) {
        this.configService = configService;
    }
    verifySignature(input) {
        if (input.signingSecret === undefined || input.signingSecret === null) {
            const isProduction = this.configService.get('NODE_ENV') === 'production';
            if (isProduction) {
                return {
                    status: client_1.ProviderEventVerificationStatus.FAILED,
                    failureCode: 'signing_secret_not_configured',
                    failureMessage: `${input.provider} webhook signing secret is not configured.`,
                };
            }
            return {
                status: client_1.ProviderEventVerificationStatus.SKIPPED,
                failureCode: null,
                failureMessage: null,
            };
        }
        const signatures = this.extractSignatureCandidates(input.signatureHeader);
        if (signatures.length === 0) {
            return {
                status: client_1.ProviderEventVerificationStatus.FAILED,
                failureCode: 'missing_signature',
                failureMessage: `${input.provider} webhook signature header is missing.`,
            };
        }
        const expectedSignature = (0, node_crypto_1.createHmac)('sha256', input.signingSecret)
            .update(input.rawBody)
            .digest('hex');
        const verified = signatures.some((signature) => this.safeCompareHex(signature, expectedSignature));
        if (!verified) {
            return {
                status: client_1.ProviderEventVerificationStatus.FAILED,
                failureCode: 'invalid_signature',
                failureMessage: `${input.provider} webhook signature could not be verified.`,
            };
        }
        return {
            status: client_1.ProviderEventVerificationStatus.VERIFIED,
            failureCode: null,
            failureMessage: null,
        };
    }
    extractSignatureCandidates(signatureHeader) {
        if (signatureHeader === undefined || signatureHeader === null) {
            return [];
        }
        return signatureHeader
            .split(',')
            .map((part) => part.trim())
            .map((part) => {
            const [, value] = part.split('=', 2);
            return (value ?? part).trim().replace(/^"|"$/g, '');
        })
            .filter((value) => /^[a-f0-9]{64}$/i.test(value));
    }
    safeCompareHex(left, right) {
        const leftBuffer = Buffer.from(left, 'hex');
        const rightBuffer = Buffer.from(right, 'hex');
        if (leftBuffer.length !== rightBuffer.length) {
            return false;
        }
        return (0, node_crypto_1.timingSafeEqual)(leftBuffer, rightBuffer);
    }
};
exports.ProviderWebhookSignatureService = ProviderWebhookSignatureService;
exports.ProviderWebhookSignatureService = ProviderWebhookSignatureService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ProviderWebhookSignatureService);
//# sourceMappingURL=provider-webhook-signature.service.js.map
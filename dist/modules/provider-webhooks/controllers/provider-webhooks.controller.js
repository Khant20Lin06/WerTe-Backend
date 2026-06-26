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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderWebhooksController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../../common/decorators/public.decorator");
const queue_constants_1 = require("../../../infrastructure/queue/queue.constants");
const queue_service_1 = require("../../../infrastructure/queue/queue.service");
const payment_provider_webhook_service_1 = require("../../payments/services/payment-provider-webhook.service");
const refund_provider_webhook_service_1 = require("../../refunds/services/refund-provider-webhook.service");
const provider_webhook_secrets_service_1 = require("../services/provider-webhook-secrets.service");
let ProviderWebhooksController = class ProviderWebhooksController {
    constructor(paymentProviderWebhookService, refundProviderWebhookService, providerWebhookSecretsService, queueService) {
        this.paymentProviderWebhookService = paymentProviderWebhookService;
        this.refundProviderWebhookService = refundProviderWebhookService;
        this.providerWebhookSecretsService = providerWebhookSecretsService;
        this.queueService = queueService;
    }
    async receivePaymentWebhook(provider, body, headers, request) {
        const ingestedEvent = await this.paymentProviderWebhookService.ingestPaymentWebhook({
            provider,
            payload: this.toInputJson(body),
            rawBody: this.readRawBody(request),
            headers: this.normalizeHeaders(headers),
            signatureHeader: this.readSignatureHeader(headers, provider),
            signingSecret: this.providerWebhookSecretsService.resolveSigningSecret(provider, 'payment'),
        });
        await this.queueService.add(queue_constants_1.QueueNames.providerWebhooks, queue_constants_1.QueueJobNames.providerWebhooks.processPaymentEvent, {
            paymentProviderEventId: ingestedEvent.paymentProviderEventId,
        });
        return ingestedEvent;
    }
    async receiveRefundWebhook(provider, body, headers, request) {
        const ingestedEvent = await this.refundProviderWebhookService.ingestRefundWebhook({
            provider,
            payload: this.toInputJson(body),
            rawBody: this.readRawBody(request),
            headers: this.normalizeHeaders(headers),
            signatureHeader: this.readSignatureHeader(headers, provider),
            signingSecret: this.providerWebhookSecretsService.resolveSigningSecret(provider, 'refund'),
        });
        await this.queueService.add(queue_constants_1.QueueNames.providerWebhooks, queue_constants_1.QueueJobNames.providerWebhooks.processRefundEvent, {
            refundProviderEventId: ingestedEvent.refundProviderEventId,
        });
        return ingestedEvent;
    }
    readRawBody(request) {
        if (Buffer.isBuffer(request.rawBody)) {
            return request.rawBody.toString('utf8');
        }
        return request.rawBody;
    }
    readSignatureHeader(headers, provider) {
        const providerHeader = `${provider.toLowerCase().replaceAll('_', '-')}-signature`;
        const headerNames = [
            providerHeader,
            'stripe-signature',
            'x-provider-signature',
            'x-webhook-signature',
            'x-signature',
            'x-hub-signature-256',
        ];
        for (const headerName of headerNames) {
            const value = this.readHeader(headers, headerName);
            if (value !== null) {
                return value;
            }
        }
        return null;
    }
    readHeader(headers, name) {
        const value = headers[name] ?? headers[name.toLowerCase()];
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(',') : null;
        }
        return value ?? null;
    }
    normalizeHeaders(headers) {
        return Object.fromEntries(Object.entries(headers).flatMap(([key, value]) => {
            if (value === undefined) {
                return [];
            }
            return [[key, Array.isArray(value) ? value.join(',') : value]];
        }));
    }
    toInputJson(body) {
        return (body ?? {});
    }
};
exports.ProviderWebhooksController = ProviderWebhooksController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'receivePaymentProviderWebhook',
        summary: 'Receive and queue a payment provider webhook',
    }),
    (0, swagger_1.ApiParam)({
        name: 'provider',
        enum: client_1.PaymentProvider,
        example: client_1.PaymentProvider.STRIPE,
    }),
    (0, swagger_1.ApiBody)({
        required: true,
        schema: {
            type: 'object',
            additionalProperties: true,
        },
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Stores the provider payment event, queues processing, and returns the current processing snapshot.',
    }),
    (0, common_1.Post)('payments'),
    __param(0, (0, common_1.Param)('provider', new common_1.ParseEnumPipe(client_1.PaymentProvider))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderWebhooksController.prototype, "receivePaymentWebhook", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'receiveRefundProviderWebhook',
        summary: 'Receive and queue a refund provider webhook',
    }),
    (0, swagger_1.ApiParam)({
        name: 'provider',
        enum: client_1.PaymentProvider,
        example: client_1.PaymentProvider.STRIPE,
    }),
    (0, swagger_1.ApiBody)({
        required: true,
        schema: {
            type: 'object',
            additionalProperties: true,
        },
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Stores the provider refund event, queues processing, and returns the current processing snapshot.',
    }),
    (0, common_1.Post)('refunds'),
    __param(0, (0, common_1.Param)('provider', new common_1.ParseEnumPipe(client_1.PaymentProvider))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderWebhooksController.prototype, "receiveRefundWebhook", null);
exports.ProviderWebhooksController = ProviderWebhooksController = __decorate([
    (0, swagger_1.ApiTags)('provider-webhooks'),
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('provider-webhooks/:provider'),
    __metadata("design:paramtypes", [payment_provider_webhook_service_1.PaymentProviderWebhookService,
        refund_provider_webhook_service_1.RefundProviderWebhookService,
        provider_webhook_secrets_service_1.ProviderWebhookSecretsService,
        queue_service_1.QueueService])
], ProviderWebhooksController);
//# sourceMappingURL=provider-webhooks.controller.js.map
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
exports.PaymentProviderWebhookService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const payment_provider_event_entity_1 = require("../entities/payment-provider-event.entity");
const payments_repository_1 = require("../repositories/payments.repository");
const provider_webhook_normalizer_service_1 = require("./provider-webhook-normalizer.service");
const provider_webhook_signature_service_1 = require("./provider-webhook-signature.service");
let PaymentProviderWebhookService = class PaymentProviderWebhookService {
    constructor(paymentsRepository, normalizer, signatureService) {
        this.paymentsRepository = paymentsRepository;
        this.normalizer = normalizer;
        this.signatureService = signatureService;
    }
    async ingestPaymentWebhook(input) {
        const rawBody = input.rawBody ?? JSON.stringify(input.payload);
        const normalized = this.normalizer.normalizePaymentEvent({
            provider: input.provider,
            payload: input.payload,
        });
        const verification = this.signatureService.verifySignature({
            provider: input.provider,
            rawBody,
            signatureHeader: input.signatureHeader,
            signingSecret: input.signingSecret,
        });
        const existingEvent = await this.findExistingEvent(input.provider, normalized.providerEventId);
        const isRejected = verification.status === client_1.ProviderEventVerificationStatus.FAILED;
        if (existingEvent !== null) {
            if (isRejected) {
                this.throwInvalidSignature(verification.failureMessage);
            }
            return (0, payment_provider_event_entity_1.buildPaymentProviderEventEntity)(existingEvent);
        }
        const failedAt = isRejected ? input.receivedAt ?? new Date() : null;
        const event = await this.paymentsRepository.createPaymentProviderEvent({
            provider: input.provider,
            providerEventId: normalized.providerEventId,
            eventType: normalized.eventType,
            paymentId: normalized.paymentId,
            orderId: normalized.orderId,
            providerReference: normalized.providerReference,
            normalizedStatus: normalized.normalizedStatus,
            verificationStatus: verification.status,
            processingStatus: isRejected
                ? client_1.ProviderEventProcessingStatus.FAILED
                : client_1.ProviderEventProcessingStatus.RECEIVED,
            signatureHeader: input.signatureHeader ?? null,
            headersJson: input.headers,
            rawPayloadJson: input.payload,
            normalizedPayloadJson: normalized.normalizedPayloadJson,
            failureCode: verification.failureCode,
            failureMessage: verification.failureMessage,
            receivedAt: input.receivedAt,
            failedAt,
        });
        if (isRejected) {
            this.throwInvalidSignature(verification.failureMessage);
        }
        return (0, payment_provider_event_entity_1.buildPaymentProviderEventEntity)(event);
    }
    findExistingEvent(provider, providerEventId) {
        if (providerEventId === null) {
            return Promise.resolve(null);
        }
        return this.paymentsRepository.findPaymentProviderEventByProviderEventId(provider, providerEventId);
    }
    throwInvalidSignature(message) {
        throw new app_exception_1.AppException(message ?? 'Payment provider webhook signature is invalid.', common_1.HttpStatus.UNAUTHORIZED, {
            code: error_codes_1.ErrorCodes.unauthorized,
        });
    }
};
exports.PaymentProviderWebhookService = PaymentProviderWebhookService;
exports.PaymentProviderWebhookService = PaymentProviderWebhookService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payments_repository_1.PaymentsRepository,
        provider_webhook_normalizer_service_1.ProviderWebhookNormalizerService,
        provider_webhook_signature_service_1.ProviderWebhookSignatureService])
], PaymentProviderWebhookService);
//# sourceMappingURL=payment-provider-webhook.service.js.map
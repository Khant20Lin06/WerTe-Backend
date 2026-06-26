"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderWebhookNormalizerService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ProviderWebhookNormalizerService = class ProviderWebhookNormalizerService {
    normalizePaymentEvent(input) {
        const root = this.asRecord(input.payload) ?? {};
        const object = this.extractDataObject(root);
        const eventType = this.readString(root, [
            'eventType',
            'event_type',
            'type',
            'event',
            'kind',
            'name',
        ]) ?? 'unknown';
        const metadata = this.extractMetadata(root, object);
        const providerEventId = this.readString(root, [
            'providerEventId',
            'provider_event_id',
            'eventId',
            'event_id',
            'id',
        ]);
        const paymentId = this.readString(metadata, [
            'paymentId',
            'payment_id',
            'internalPaymentId',
            'internal_payment_id',
        ]) ?? this.readString(object, ['paymentId', 'payment_id']);
        const orderId = this.readString(metadata, [
            'orderId',
            'order_id',
            'internalOrderId',
            'internal_order_id',
        ]) ?? this.readString(object, ['orderId', 'order_id']);
        const providerReference = this.readString(object, [
            'providerReference',
            'provider_reference',
            'paymentIntentId',
            'payment_intent',
            'transactionId',
            'transaction_id',
            'reference',
            'id',
        ]);
        const statusText = this.readString(object, ['status', 'paymentStatus', 'payment_status']) ??
            this.readString(root, ['status']);
        return {
            providerEventId,
            eventType,
            paymentId,
            orderId,
            providerReference,
            normalizedStatus: this.normalizePaymentStatus(eventType, statusText),
            normalizedPayloadJson: this.buildNormalizedPayload({
                provider: input.provider,
                eventType,
                providerEventId,
                providerReference,
                paymentId,
                orderId,
                normalizedStatus: this.normalizePaymentStatus(eventType, statusText),
            }),
        };
    }
    normalizeRefundEvent(input) {
        const root = this.asRecord(input.payload) ?? {};
        const object = this.extractDataObject(root);
        const eventType = this.readString(root, [
            'eventType',
            'event_type',
            'type',
            'event',
            'kind',
            'name',
        ]) ?? 'unknown';
        const metadata = this.extractMetadata(root, object);
        const providerEventId = this.readString(root, [
            'providerEventId',
            'provider_event_id',
            'eventId',
            'event_id',
            'id',
        ]);
        const refundId = this.readString(metadata, [
            'refundId',
            'refund_id',
            'internalRefundId',
            'internal_refund_id',
        ]) ?? this.readString(object, ['refundId', 'refund_id']);
        const paymentId = this.readString(metadata, [
            'paymentId',
            'payment_id',
            'internalPaymentId',
            'internal_payment_id',
        ]) ?? this.readString(object, ['paymentId', 'payment_id']);
        const orderId = this.readString(metadata, [
            'orderId',
            'order_id',
            'internalOrderId',
            'internal_order_id',
        ]) ?? this.readString(object, ['orderId', 'order_id']);
        const providerReference = this.readString(object, [
            'providerReference',
            'provider_reference',
            'refundId',
            'refund_id',
            'transactionId',
            'transaction_id',
            'reference',
            'id',
        ]);
        const statusText = this.readString(object, ['status', 'refundStatus', 'refund_status']) ??
            this.readString(root, ['status']);
        return {
            providerEventId,
            eventType,
            refundId,
            paymentId,
            orderId,
            providerReference,
            normalizedStatus: this.normalizeRefundStatus(eventType, statusText),
            normalizedPayloadJson: this.buildNormalizedPayload({
                provider: input.provider,
                eventType,
                providerEventId,
                providerReference,
                refundId,
                paymentId,
                orderId,
                normalizedStatus: this.normalizeRefundStatus(eventType, statusText),
            }),
        };
    }
    extractDataObject(root) {
        const data = this.asRecord(root.data);
        const dataObject = this.asRecord(data?.object);
        const object = this.asRecord(root.object);
        return dataObject ?? data ?? object ?? root;
    }
    extractMetadata(root, object) {
        return this.asRecord(object.metadata) ?? this.asRecord(root.metadata) ?? {};
    }
    normalizePaymentStatus(eventType, statusText) {
        const combined = `${eventType} ${statusText ?? ''}`.toLowerCase();
        if (this.containsAny(combined, ['succeeded', 'success', 'paid', 'captured', 'completed'])) {
            return client_1.PaymentStatus.SUCCEEDED;
        }
        if (this.containsAny(combined, ['failed', 'failure', 'declined', 'error'])) {
            return client_1.PaymentStatus.FAILED;
        }
        if (this.containsAny(combined, ['cancelled', 'canceled'])) {
            return client_1.PaymentStatus.CANCELLED;
        }
        if (combined.includes('expired')) {
            return client_1.PaymentStatus.EXPIRED;
        }
        if (combined.includes('requires_action')) {
            return client_1.PaymentStatus.REQUIRES_ACTION;
        }
        if (combined.includes('processing')) {
            return client_1.PaymentStatus.PROCESSING;
        }
        if (combined.includes('pending')) {
            return client_1.PaymentStatus.PENDING;
        }
        return null;
    }
    normalizeRefundStatus(eventType, statusText) {
        const combined = `${eventType} ${statusText ?? ''}`.toLowerCase();
        if (this.containsAny(combined, ['succeeded', 'success', 'completed'])) {
            return client_1.RefundStatus.SUCCEEDED;
        }
        if (this.containsAny(combined, ['failed', 'failure', 'declined', 'error'])) {
            return client_1.RefundStatus.FAILED;
        }
        if (this.containsAny(combined, ['cancelled', 'canceled'])) {
            return client_1.RefundStatus.CANCELLED;
        }
        if (combined.includes('processing')) {
            return client_1.RefundStatus.PROCESSING;
        }
        if (combined.includes('pending')) {
            return client_1.RefundStatus.PENDING;
        }
        return null;
    }
    containsAny(value, needles) {
        return needles.some((needle) => value.includes(needle));
    }
    readString(source, keys) {
        for (const key of keys) {
            const value = source[key];
            if (typeof value === 'string' && value.trim() !== '') {
                return value;
            }
        }
        return null;
    }
    asRecord(value) {
        if (value === undefined || value === null || Array.isArray(value)) {
            return null;
        }
        if (typeof value !== 'object') {
            return null;
        }
        return value;
    }
    buildNormalizedPayload(value) {
        return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, entry ?? null]));
    }
};
exports.ProviderWebhookNormalizerService = ProviderWebhookNormalizerService;
exports.ProviderWebhookNormalizerService = ProviderWebhookNormalizerService = __decorate([
    (0, common_1.Injectable)()
], ProviderWebhookNormalizerService);
//# sourceMappingURL=provider-webhook-normalizer.service.js.map
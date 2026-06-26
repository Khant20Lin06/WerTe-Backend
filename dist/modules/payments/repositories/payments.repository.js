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
exports.PaymentsRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const checkout_payment_intent_entity_1 = require("../entities/checkout-payment-intent.entity");
const payment_attempt_entity_1 = require("../entities/payment-attempt.entity");
const payment_provider_event_entity_1 = require("../entities/payment-provider-event.entity");
const payment_summary_entity_1 = require("../entities/payment-summary.entity");
let PaymentsRepository = class PaymentsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findById(paymentId, client = this.prisma) {
        return client.payment.findUnique({
            where: {
                id: paymentId,
            },
            include: payment_summary_entity_1.paymentSummaryInclude,
        });
    }
    findOrderPayment(orderId, paymentId, client = this.prisma) {
        return client.payment.findFirst({
            where: {
                id: paymentId,
                orderId,
            },
            include: payment_summary_entity_1.paymentSummaryInclude,
        });
    }
    findCustomerPayment(customerProfileId, paymentId, client = this.prisma) {
        return client.payment.findFirst({
            where: {
                id: paymentId,
                customerProfileId,
            },
            include: payment_summary_entity_1.paymentSummaryInclude,
        });
    }
    findOrderPayments(orderId, client = this.prisma) {
        return client.payment.findMany({
            where: {
                orderId,
            },
            include: payment_summary_entity_1.paymentSummaryInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
    }
    findCustomerOrderPayments(orderId, customerProfileId, client = this.prisma) {
        return client.payment.findMany({
            where: {
                orderId,
                customerProfileId,
            },
            include: payment_summary_entity_1.paymentSummaryInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
    }
    findLatestOrderPayment(orderId, client = this.prisma) {
        return client.payment.findFirst({
            where: {
                orderId,
            },
            include: payment_summary_entity_1.paymentSummaryInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
    }
    findLatestByProviderReference(provider, providerReference, client = this.prisma) {
        return client.payment.findFirst({
            where: {
                provider,
                providerReference,
            },
            include: payment_summary_entity_1.paymentSummaryInclude,
            orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
        });
    }
    findPaymentAttempts(paymentId, client = this.prisma) {
        return client.paymentAttempt.findMany({
            where: {
                paymentId,
            },
            select: payment_attempt_entity_1.paymentAttemptSelect,
            orderBy: [{ attemptedAt: 'asc' }, { id: 'asc' }],
        });
    }
    findCheckoutPaymentIntentByIdempotencyKey(idempotencyKey, client = this.prisma) {
        return client.payment.findUnique({
            where: {
                idempotencyKey,
            },
            select: checkout_payment_intent_entity_1.checkoutPaymentIntentSelect,
        });
    }
    createCheckoutPaymentIntent(payload, client = this.prisma) {
        return client.payment.create({
            data: {
                orderId: payload.orderId,
                customerProfileId: payload.customerProfileId,
                method: payload.method,
                provider: payload.provider,
                status: payload.status,
                amount: payload.amount,
                currencyCode: payload.currencyCode,
                idempotencyKey: payload.idempotencyKey,
                metadataJson: payload.metadataJson,
                requiresActionAt: payload.requiresActionAt ?? null,
                attempts: {
                    create: {
                        provider: payload.provider,
                        status: payload.status,
                        requestPayloadJson: payload.requestPayloadJson,
                        responsePayloadJson: payload.responsePayloadJson,
                    },
                },
            },
            select: checkout_payment_intent_entity_1.checkoutPaymentIntentSelect,
        });
    }
    transitionPaymentStatus(payload, client = this.prisma) {
        const occurredAt = payload.occurredAt ?? new Date();
        return client.payment.update({
            where: {
                id: payload.paymentId,
            },
            data: {
                provider: payload.provider,
                status: payload.status,
                metadataJson: payload.metadataJson,
                providerReference: payload.providerReference ?? null,
                providerReceiptId: payload.providerReceiptId ?? null,
                failureCode: payload.failureCode ?? null,
                failureMessage: payload.failureMessage ?? null,
                requiresActionAt: null,
                succeededAt: payload.status === client_1.PaymentStatus.SUCCEEDED ? occurredAt : null,
                failedAt: payload.status === client_1.PaymentStatus.FAILED ? occurredAt : null,
                cancelledAt: payload.status === client_1.PaymentStatus.CANCELLED ? occurredAt : null,
                expiredAt: payload.status === client_1.PaymentStatus.EXPIRED ? occurredAt : null,
                attempts: {
                    create: {
                        provider: payload.provider,
                        status: payload.status,
                        providerReference: payload.providerReference ?? null,
                        requestPayloadJson: payload.requestPayloadJson,
                        responsePayloadJson: payload.responsePayloadJson,
                        failureCode: payload.failureCode ?? null,
                        failureMessage: payload.failureMessage ?? null,
                        attemptedAt: occurredAt,
                    },
                },
            },
            include: payment_summary_entity_1.paymentSummaryInclude,
        });
    }
    updateRefundState(payload, client = this.prisma) {
        return client.payment.update({
            where: {
                id: payload.paymentId,
            },
            data: {
                refundedAmount: payload.refundedAmount,
                status: payload.status,
            },
            include: payment_summary_entity_1.paymentSummaryInclude,
        });
    }
    findPaymentProviderEventByProviderEventId(provider, providerEventId, client = this.prisma) {
        return client.paymentProviderEvent.findUnique({
            where: {
                provider_providerEventId: {
                    provider,
                    providerEventId,
                },
            },
            select: payment_provider_event_entity_1.paymentProviderEventSelect,
        });
    }
    findPaymentProviderEventById(paymentProviderEventId, client = this.prisma) {
        return client.paymentProviderEvent.findUnique({
            where: {
                id: paymentProviderEventId,
            },
            select: payment_provider_event_entity_1.paymentProviderEventSelect,
        });
    }
    listProcessablePaymentProviderEvents(limit = 50, client = this.prisma) {
        return client.paymentProviderEvent.findMany({
            where: {
                verificationStatus: {
                    in: [
                        client_1.ProviderEventVerificationStatus.VERIFIED,
                        client_1.ProviderEventVerificationStatus.SKIPPED,
                    ],
                },
                processingStatus: {
                    in: [
                        client_1.ProviderEventProcessingStatus.RECEIVED,
                        client_1.ProviderEventProcessingStatus.FAILED,
                        client_1.ProviderEventProcessingStatus.IGNORED,
                    ],
                },
            },
            select: payment_provider_event_entity_1.paymentProviderEventSelect,
            orderBy: [{ receivedAt: 'asc' }, { id: 'asc' }],
            take: limit,
        });
    }
    createPaymentProviderEvent(payload, client = this.prisma) {
        return client.paymentProviderEvent.create({
            data: {
                provider: payload.provider,
                providerEventId: payload.providerEventId ?? null,
                eventType: payload.eventType,
                paymentId: payload.paymentId ?? null,
                orderId: payload.orderId ?? null,
                providerReference: payload.providerReference ?? null,
                normalizedStatus: payload.normalizedStatus ?? null,
                verificationStatus: payload.verificationStatus,
                processingStatus: payload.processingStatus,
                signatureHeader: payload.signatureHeader ?? null,
                headersJson: payload.headersJson,
                rawPayloadJson: payload.rawPayloadJson,
                normalizedPayloadJson: payload.normalizedPayloadJson,
                processingMetadataJson: payload.processingMetadataJson,
                failureCode: payload.failureCode ?? null,
                failureMessage: payload.failureMessage ?? null,
                receivedAt: payload.receivedAt,
                failedAt: payload.failedAt ?? null,
            },
            select: payment_provider_event_entity_1.paymentProviderEventSelect,
        });
    }
    updatePaymentProviderEventProcessingState(payload, client = this.prisma) {
        const occurredAt = payload.occurredAt ?? new Date();
        return client.paymentProviderEvent.update({
            where: {
                id: payload.paymentProviderEventId,
            },
            data: {
                paymentId: payload.paymentId ?? undefined,
                orderId: payload.orderId ?? undefined,
                providerReference: payload.providerReference ?? undefined,
                processingStatus: payload.processingStatus,
                processingMetadataJson: payload.processingMetadataJson,
                failureCode: payload.failureCode ?? null,
                failureMessage: payload.failureMessage ?? null,
                processedAt: payload.processingStatus === client_1.ProviderEventProcessingStatus.PROCESSED
                    ? occurredAt
                    : null,
                failedAt: payload.processingStatus === client_1.ProviderEventProcessingStatus.FAILED
                    ? occurredAt
                    : null,
                ignoredAt: payload.processingStatus === client_1.ProviderEventProcessingStatus.IGNORED
                    ? occurredAt
                    : null,
            },
            select: payment_provider_event_entity_1.paymentProviderEventSelect,
        });
    }
};
exports.PaymentsRepository = PaymentsRepository;
exports.PaymentsRepository = PaymentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsRepository);
//# sourceMappingURL=payments.repository.js.map
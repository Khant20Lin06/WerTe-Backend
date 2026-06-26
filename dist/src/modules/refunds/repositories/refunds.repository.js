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
exports.RefundsRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const refund_attempt_entity_1 = require("../entities/refund-attempt.entity");
const refund_provider_event_entity_1 = require("../entities/refund-provider-event.entity");
const refund_summary_entity_1 = require("../entities/refund-summary.entity");
let RefundsRepository = class RefundsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findById(refundId, client = this.prisma) {
        return client.refund.findUnique({
            where: {
                id: refundId,
            },
            include: refund_summary_entity_1.refundSummaryInclude,
        });
    }
    findOrderRefund(orderId, refundId, client = this.prisma) {
        return client.refund.findFirst({
            where: {
                id: refundId,
                orderId,
            },
            include: refund_summary_entity_1.refundSummaryInclude,
        });
    }
    findCustomerRefund(customerProfileId, refundId, client = this.prisma) {
        return client.refund.findFirst({
            where: {
                id: refundId,
                order: {
                    is: {
                        customerProfileId,
                    },
                },
            },
            include: refund_summary_entity_1.refundSummaryInclude,
        });
    }
    findOrderRefunds(orderId, client = this.prisma) {
        return client.refund.findMany({
            where: {
                orderId,
            },
            include: refund_summary_entity_1.refundSummaryInclude,
            orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }],
        });
    }
    findCustomerOrderRefunds(orderId, customerProfileId, client = this.prisma) {
        return client.refund.findMany({
            where: {
                orderId,
                order: {
                    is: {
                        customerProfileId,
                    },
                },
            },
            include: refund_summary_entity_1.refundSummaryInclude,
            orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }],
        });
    }
    findPaymentRefunds(paymentId, client = this.prisma) {
        return client.refund.findMany({
            where: {
                paymentId,
            },
            include: refund_summary_entity_1.refundSummaryInclude,
            orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }],
        });
    }
    findLatestByProviderReference(provider, providerReference, client = this.prisma) {
        return client.refund.findFirst({
            where: {
                providerReference,
                payment: {
                    is: {
                        provider,
                    },
                },
            },
            include: refund_summary_entity_1.refundSummaryInclude,
            orderBy: [{ updatedAt: 'desc' }, { requestedAt: 'desc' }, { id: 'desc' }],
        });
    }
    findRefundAttempts(refundId, client = this.prisma) {
        return client.refundAttempt.findMany({
            where: {
                refundId,
            },
            select: refund_attempt_entity_1.refundAttemptSelect,
            orderBy: [{ attemptedAt: 'asc' }, { id: 'asc' }],
        });
    }
    findByIdempotencyKey(idempotencyKey, client = this.prisma) {
        return client.refund.findUnique({
            where: {
                idempotencyKey,
            },
            include: refund_summary_entity_1.refundSummaryInclude,
        });
    }
    createRefundRequest(payload, client = this.prisma) {
        const occurredAt = payload.occurredAt ?? new Date();
        return client.refund.create({
            data: {
                paymentId: payload.paymentId,
                orderId: payload.orderId,
                createdByUserId: payload.createdByUserId,
                status: payload.status,
                amount: payload.amount,
                currencyCode: payload.currencyCode,
                idempotencyKey: payload.idempotencyKey ?? null,
                providerReference: payload.providerReference ?? null,
                reasonCode: payload.reasonCode ?? null,
                note: payload.note ?? null,
                metadataJson: payload.metadataJson,
                requestedAt: occurredAt,
                attempts: {
                    create: {
                        provider: payload.provider,
                        status: payload.status,
                        providerReference: payload.providerReference ?? null,
                        requestPayloadJson: payload.requestPayloadJson,
                        responsePayloadJson: payload.responsePayloadJson,
                        attemptedAt: occurredAt,
                    },
                },
            },
            include: refund_summary_entity_1.refundSummaryInclude,
        });
    }
    transitionRefundStatus(payload, client = this.prisma) {
        const occurredAt = payload.occurredAt ?? new Date();
        return client.refund.update({
            where: {
                id: payload.refundId,
            },
            data: {
                status: payload.status,
                metadataJson: payload.metadataJson,
                providerReference: payload.providerReference ?? null,
                failureCode: payload.failureCode ?? null,
                failureMessage: payload.failureMessage ?? null,
                succeededAt: payload.status === client_1.RefundStatus.SUCCEEDED ? occurredAt : null,
                failedAt: payload.status === client_1.RefundStatus.FAILED ? occurredAt : null,
                cancelledAt: payload.status === client_1.RefundStatus.CANCELLED ? occurredAt : null,
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
            include: refund_summary_entity_1.refundSummaryInclude,
        });
    }
    findRefundProviderEventByProviderEventId(provider, providerEventId, client = this.prisma) {
        return client.refundProviderEvent.findUnique({
            where: {
                provider_providerEventId: {
                    provider,
                    providerEventId,
                },
            },
            select: refund_provider_event_entity_1.refundProviderEventSelect,
        });
    }
    findRefundProviderEventById(refundProviderEventId, client = this.prisma) {
        return client.refundProviderEvent.findUnique({
            where: {
                id: refundProviderEventId,
            },
            select: refund_provider_event_entity_1.refundProviderEventSelect,
        });
    }
    listProcessableRefundProviderEvents(limit = 50, client = this.prisma) {
        return client.refundProviderEvent.findMany({
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
            select: refund_provider_event_entity_1.refundProviderEventSelect,
            orderBy: [{ receivedAt: 'asc' }, { id: 'asc' }],
            take: limit,
        });
    }
    createRefundProviderEvent(payload, client = this.prisma) {
        return client.refundProviderEvent.create({
            data: {
                provider: payload.provider,
                providerEventId: payload.providerEventId ?? null,
                eventType: payload.eventType,
                refundId: payload.refundId ?? null,
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
            select: refund_provider_event_entity_1.refundProviderEventSelect,
        });
    }
    updateRefundProviderEventProcessingState(payload, client = this.prisma) {
        const occurredAt = payload.occurredAt ?? new Date();
        return client.refundProviderEvent.update({
            where: {
                id: payload.refundProviderEventId,
            },
            data: {
                refundId: payload.refundId ?? undefined,
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
            select: refund_provider_event_entity_1.refundProviderEventSelect,
        });
    }
};
exports.RefundsRepository = RefundsRepository;
exports.RefundsRepository = RefundsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RefundsRepository);
//# sourceMappingURL=refunds.repository.js.map
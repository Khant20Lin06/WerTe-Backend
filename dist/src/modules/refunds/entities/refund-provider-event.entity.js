"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundProviderEventEntity = exports.refundProviderEventSelect = void 0;
exports.buildRefundProviderEventEntity = buildRefundProviderEventEntity;
const client_1 = require("@prisma/client");
exports.refundProviderEventSelect = client_1.Prisma.validator()({
    id: true,
    provider: true,
    providerEventId: true,
    eventType: true,
    refundId: true,
    paymentId: true,
    orderId: true,
    providerReference: true,
    normalizedStatus: true,
    verificationStatus: true,
    processingStatus: true,
    signatureHeader: true,
    headersJson: true,
    rawPayloadJson: true,
    normalizedPayloadJson: true,
    processingMetadataJson: true,
    failureCode: true,
    failureMessage: true,
    receivedAt: true,
    processedAt: true,
    failedAt: true,
    ignoredAt: true,
    createdAt: true,
    updatedAt: true,
});
class RefundProviderEventEntity {
}
exports.RefundProviderEventEntity = RefundProviderEventEntity;
function buildRefundProviderEventEntity(event) {
    return {
        refundProviderEventId: event.id,
        provider: event.provider,
        providerEventId: event.providerEventId ?? null,
        eventType: event.eventType,
        refundId: event.refundId ?? null,
        paymentId: event.paymentId ?? null,
        orderId: event.orderId ?? null,
        providerReference: event.providerReference ?? null,
        normalizedStatus: event.normalizedStatus ?? null,
        verificationStatus: event.verificationStatus,
        processingStatus: event.processingStatus,
        signatureHeader: event.signatureHeader ?? null,
        headers: event.headersJson ?? null,
        rawPayload: event.rawPayloadJson,
        normalizedPayload: event.normalizedPayloadJson ?? null,
        processingMetadata: event.processingMetadataJson ?? null,
        failureCode: event.failureCode ?? null,
        failureMessage: event.failureMessage ?? null,
        receivedAt: event.receivedAt.toISOString(),
        processedAt: event.processedAt?.toISOString() ?? null,
        failedAt: event.failedAt?.toISOString() ?? null,
        ignoredAt: event.ignoredAt?.toISOString() ?? null,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=refund-provider-event.entity.js.map
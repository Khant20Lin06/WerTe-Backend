"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundAttemptEntity = exports.refundAttemptSelect = void 0;
exports.buildRefundAttemptEntity = buildRefundAttemptEntity;
const client_1 = require("@prisma/client");
exports.refundAttemptSelect = client_1.Prisma.validator()({
    id: true,
    refundId: true,
    provider: true,
    status: true,
    providerReference: true,
    requestPayloadJson: true,
    responsePayloadJson: true,
    failureCode: true,
    failureMessage: true,
    attemptedAt: true,
    createdAt: true,
    updatedAt: true,
});
class RefundAttemptEntity {
}
exports.RefundAttemptEntity = RefundAttemptEntity;
function buildRefundAttemptEntity(attempt) {
    return {
        refundAttemptId: attempt.id,
        refundId: attempt.refundId,
        provider: attempt.provider,
        status: attempt.status,
        providerReference: attempt.providerReference ?? null,
        requestPayload: attempt.requestPayloadJson ?? null,
        responsePayload: attempt.responsePayloadJson ?? null,
        failureCode: attempt.failureCode ?? null,
        failureMessage: attempt.failureMessage ?? null,
        attemptedAt: attempt.attemptedAt.toISOString(),
        createdAt: attempt.createdAt.toISOString(),
        updatedAt: attempt.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=refund-attempt.entity.js.map
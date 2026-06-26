"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentAttemptEntity = exports.paymentAttemptSelect = void 0;
exports.buildPaymentAttemptEntity = buildPaymentAttemptEntity;
const client_1 = require("@prisma/client");
exports.paymentAttemptSelect = client_1.Prisma.validator()({
    id: true,
    paymentId: true,
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
class PaymentAttemptEntity {
}
exports.PaymentAttemptEntity = PaymentAttemptEntity;
function buildPaymentAttemptEntity(attempt) {
    return {
        paymentAttemptId: attempt.id,
        paymentId: attempt.paymentId,
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
//# sourceMappingURL=payment-attempt.entity.js.map
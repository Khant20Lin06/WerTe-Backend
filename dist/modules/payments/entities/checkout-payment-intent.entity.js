"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutPaymentIntentEntity = exports.checkoutPaymentIntentSelect = void 0;
exports.buildCheckoutPaymentIntentEntity = buildCheckoutPaymentIntentEntity;
const client_1 = require("@prisma/client");
exports.checkoutPaymentIntentSelect = client_1.Prisma.validator()({
    id: true,
    orderId: true,
    customerProfileId: true,
    method: true,
    provider: true,
    status: true,
    amount: true,
    currencyCode: true,
    idempotencyKey: true,
    providerReference: true,
    providerReceiptId: true,
    failureCode: true,
    failureMessage: true,
    requiresActionAt: true,
    succeededAt: true,
    failedAt: true,
    cancelledAt: true,
    expiredAt: true,
    createdAt: true,
    updatedAt: true,
});
class CheckoutPaymentIntentEntity {
}
exports.CheckoutPaymentIntentEntity = CheckoutPaymentIntentEntity;
function buildCheckoutPaymentIntentEntity(payment) {
    return {
        paymentId: payment.id,
        orderId: payment.orderId,
        customerProfileId: payment.customerProfileId,
        method: payment.method,
        provider: payment.provider,
        status: payment.status,
        amount: payment.amount.toString(),
        currencyCode: payment.currencyCode,
        idempotencyKey: payment.idempotencyKey ?? null,
        providerReference: payment.providerReference ?? null,
        providerReceiptId: payment.providerReceiptId ?? null,
        failureCode: payment.failureCode ?? null,
        failureMessage: payment.failureMessage ?? null,
        requiresActionAt: payment.requiresActionAt?.toISOString() ?? null,
        succeededAt: payment.succeededAt?.toISOString() ?? null,
        failedAt: payment.failedAt?.toISOString() ?? null,
        cancelledAt: payment.cancelledAt?.toISOString() ?? null,
        expiredAt: payment.expiredAt?.toISOString() ?? null,
        requiresCustomerAction: payment.status === client_1.PaymentStatus.REQUIRES_ACTION,
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=checkout-payment-intent.entity.js.map
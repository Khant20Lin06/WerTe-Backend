"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutSubmissionEntity = exports.checkoutSubmissionSelect = void 0;
exports.buildCheckoutSubmission = buildCheckoutSubmission;
const client_1 = require("@prisma/client");
exports.checkoutSubmissionSelect = client_1.Prisma.validator()({
    id: true,
    orderCode: true,
    customerProfileId: true,
    branchId: true,
    addressId: true,
    cartId: true,
    idempotencyKey: true,
    status: true,
    currencyCode: true,
    subtotalAmount: true,
    discountAmount: true,
    deliveryFee: true,
    totalAmount: true,
    placedAt: true,
});
class CheckoutSubmissionEntity {
}
exports.CheckoutSubmissionEntity = CheckoutSubmissionEntity;
function buildCheckoutSubmission(order, options) {
    return {
        orderId: order.id,
        orderCode: order.orderCode,
        customerProfileId: order.customerProfileId,
        branchId: order.branchId,
        addressId: order.addressId,
        cartId: order.cartId,
        idempotencyKey: order.idempotencyKey,
        status: order.status,
        currencyCode: order.currencyCode,
        subtotalAmount: order.subtotalAmount.toString(),
        discountAmount: order.discountAmount.toString(),
        deliveryFee: order.deliveryFee.toString(),
        totalAmount: order.totalAmount.toString(),
        placedAt: order.placedAt.toISOString(),
        isIdempotentReplay: options?.isIdempotentReplay ?? false,
    };
}
//# sourceMappingURL=checkout-submission.entity.js.map
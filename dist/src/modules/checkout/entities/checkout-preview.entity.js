"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutPreviewEntity = exports.CheckoutPreviewPricingEntity = void 0;
exports.buildCheckoutPreview = buildCheckoutPreview;
class CheckoutPreviewPricingEntity {
}
exports.CheckoutPreviewPricingEntity = CheckoutPreviewPricingEntity;
class CheckoutPreviewEntity {
}
exports.CheckoutPreviewEntity = CheckoutPreviewEntity;
function buildCheckoutPreview(input) {
    return {
        currencyCode: input.context.currencyCode,
        customer: input.context.customer,
        address: input.context.address,
        branch: input.context.branch,
        cart: input.context.cart,
        pricing: {
            currencyCode: input.context.currencyCode,
            subtotalAmount: input.subtotalAmount.toString(),
            discountAmount: input.discountAmount.toString(),
            deliveryFee: input.deliveryFee.toString(),
            totalAmount: input.totalAmount.toString(),
            appliedPromotion: input.appliedPromotion ?? null,
        },
    };
}
//# sourceMappingURL=checkout-preview.entity.js.map
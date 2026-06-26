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
exports.CheckoutSubmissionDto = exports.CheckoutPaymentIntentDto = void 0;
exports.toCheckoutSubmissionDto = toCheckoutSubmissionDto;
const swagger_1 = require("@nestjs/swagger");
const applied_promotion_dto_1 = require("../../promotions/dto/applied-promotion.dto");
class CheckoutPaymentIntentDto {
}
exports.CheckoutPaymentIntentDto = CheckoutPaymentIntentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Created payment intent identifier.',
        example: 'payment_1',
    }),
    __metadata("design:type", String)
], CheckoutPaymentIntentDto.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Order identifier associated with the payment intent.',
        example: 'order_1',
    }),
    __metadata("design:type", String)
], CheckoutPaymentIntentDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer profile identifier associated with the payment intent.',
        example: 'cust_prof_1',
    }),
    __metadata("design:type", String)
], CheckoutPaymentIntentDto.prototype, "customerProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Checkout payment method.',
        example: 'CASH_ON_DELIVERY',
    }),
    __metadata("design:type", String)
], CheckoutPaymentIntentDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Resolved payment provider.',
        example: 'COD',
    }),
    __metadata("design:type", String)
], CheckoutPaymentIntentDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current payment intent status.',
        example: 'PENDING',
    }),
    __metadata("design:type", String)
], CheckoutPaymentIntentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment amount serialized as a string.',
        example: '6500',
    }),
    __metadata("design:type", String)
], CheckoutPaymentIntentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment currency code.',
        example: 'MMK',
    }),
    __metadata("design:type", String)
], CheckoutPaymentIntentDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Client-generated idempotency key reused for the payment intent.',
        example: 'checkout-usr_1-001',
    }),
    __metadata("design:type", Object)
], CheckoutPaymentIntentDto.prototype, "idempotencyKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Provider reference when available.',
        example: 'pi_123',
    }),
    __metadata("design:type", Object)
], CheckoutPaymentIntentDto.prototype, "providerReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Provider receipt identifier when available.',
        example: 'receipt_123',
    }),
    __metadata("design:type", Object)
], CheckoutPaymentIntentDto.prototype, "providerReceiptId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Failure code when the payment intent is in a failed state.',
        example: 'provider_timeout',
    }),
    __metadata("design:type", Object)
], CheckoutPaymentIntentDto.prototype, "failureCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Failure message when the payment intent is in a failed state.',
        example: 'Provider timeout',
    }),
    __metadata("design:type", Object)
], CheckoutPaymentIntentDto.prototype, "failureMessage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Timestamp indicating when customer action became required.',
        example: '2026-04-24T10:00:00.000Z',
    }),
    __metadata("design:type", Object)
], CheckoutPaymentIntentDto.prototype, "requiresActionAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Timestamp for successful payment capture.',
        example: '2026-04-24T10:05:00.000Z',
    }),
    __metadata("design:type", Object)
], CheckoutPaymentIntentDto.prototype, "succeededAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Timestamp for failed payment processing.',
        example: '2026-04-24T10:05:00.000Z',
    }),
    __metadata("design:type", Object)
], CheckoutPaymentIntentDto.prototype, "failedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Timestamp for cancelled payment intents.',
        example: '2026-04-24T10:05:00.000Z',
    }),
    __metadata("design:type", Object)
], CheckoutPaymentIntentDto.prototype, "cancelledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Timestamp for expired payment intents.',
        example: '2026-04-24T10:05:00.000Z',
    }),
    __metadata("design:type", Object)
], CheckoutPaymentIntentDto.prototype, "expiredAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the current payment intent requires a customer-side action.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], CheckoutPaymentIntentDto.prototype, "requiresCustomerAction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ISO timestamp for payment intent creation.',
        example: '2026-04-24T10:00:00.000Z',
    }),
    __metadata("design:type", String)
], CheckoutPaymentIntentDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ISO timestamp for payment intent update.',
        example: '2026-04-24T10:00:00.000Z',
    }),
    __metadata("design:type", String)
], CheckoutPaymentIntentDto.prototype, "updatedAt", void 0);
class CheckoutSubmissionDto {
}
exports.CheckoutSubmissionDto = CheckoutSubmissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Created order identifier.',
        example: 'order_1',
    }),
    __metadata("design:type", String)
], CheckoutSubmissionDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer-facing order code.',
        example: 'ORD-00000001',
    }),
    __metadata("design:type", String)
], CheckoutSubmissionDto.prototype, "orderCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer profile identifier.',
        example: 'cust_prof_1',
    }),
    __metadata("design:type", String)
], CheckoutSubmissionDto.prototype, "customerProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier that received the order.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], CheckoutSubmissionDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Delivery address identifier used for the order.',
        example: 'addr_1',
    }),
    __metadata("design:type", Object)
], CheckoutSubmissionDto.prototype, "addressId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Source cart identifier used for checkout.',
        example: 'cart_1',
    }),
    __metadata("design:type", Object)
], CheckoutSubmissionDto.prototype, "cartId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Client-generated idempotency key for the checkout request.',
        example: 'checkout-usr_1-001',
    }),
    __metadata("design:type", Object)
], CheckoutSubmissionDto.prototype, "idempotencyKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Initial order status.',
        example: 'PLACED',
    }),
    __metadata("design:type", String)
], CheckoutSubmissionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code for the order totals.',
        example: 'MMK',
    }),
    __metadata("design:type", String)
], CheckoutSubmissionDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Applied promotion summary when a promotion discounted the order.',
        type: () => applied_promotion_dto_1.AppliedPromotionDto,
    }),
    __metadata("design:type", Object)
], CheckoutSubmissionDto.prototype, "appliedPromotion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Subtotal amount serialized as a string.',
        example: '6500',
    }),
    __metadata("design:type", String)
], CheckoutSubmissionDto.prototype, "subtotalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Discount amount serialized as a string.',
        example: '0',
    }),
    __metadata("design:type", String)
], CheckoutSubmissionDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Delivery fee serialized as a string.',
        example: '0',
    }),
    __metadata("design:type", String)
], CheckoutSubmissionDto.prototype, "deliveryFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Final total amount serialized as a string.',
        example: '6500',
    }),
    __metadata("design:type", String)
], CheckoutSubmissionDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ISO timestamp for order placement.',
        example: '2026-04-19T10:00:00.000Z',
    }),
    __metadata("design:type", String)
], CheckoutSubmissionDto.prototype, "placedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this response came from an idempotent replay instead of a new order creation.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], CheckoutSubmissionDto.prototype, "isIdempotentReplay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment intent created or replayed for the submitted checkout.',
        type: () => CheckoutPaymentIntentDto,
    }),
    __metadata("design:type", CheckoutPaymentIntentDto)
], CheckoutSubmissionDto.prototype, "paymentIntent", void 0);
function toCheckoutPaymentIntentDto(paymentIntent) {
    return {
        paymentId: paymentIntent.paymentId,
        orderId: paymentIntent.orderId,
        customerProfileId: paymentIntent.customerProfileId,
        method: paymentIntent.method,
        provider: paymentIntent.provider,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currencyCode: paymentIntent.currencyCode,
        idempotencyKey: paymentIntent.idempotencyKey,
        providerReference: paymentIntent.providerReference,
        providerReceiptId: paymentIntent.providerReceiptId,
        failureCode: paymentIntent.failureCode,
        failureMessage: paymentIntent.failureMessage,
        requiresActionAt: paymentIntent.requiresActionAt,
        succeededAt: paymentIntent.succeededAt,
        failedAt: paymentIntent.failedAt,
        cancelledAt: paymentIntent.cancelledAt,
        expiredAt: paymentIntent.expiredAt,
        requiresCustomerAction: paymentIntent.requiresCustomerAction,
        createdAt: paymentIntent.createdAt,
        updatedAt: paymentIntent.updatedAt,
    };
}
function toCheckoutSubmissionDto(submission) {
    return {
        orderId: submission.orderId,
        orderCode: submission.orderCode,
        customerProfileId: submission.customerProfileId,
        branchId: submission.branchId,
        addressId: submission.addressId,
        cartId: submission.cartId,
        idempotencyKey: submission.idempotencyKey,
        status: submission.status,
        currencyCode: submission.currencyCode,
        appliedPromotion: (0, applied_promotion_dto_1.toAppliedPromotionDto)(submission.appliedPromotion),
        subtotalAmount: submission.subtotalAmount,
        discountAmount: submission.discountAmount,
        deliveryFee: submission.deliveryFee,
        totalAmount: submission.totalAmount,
        placedAt: submission.placedAt,
        isIdempotentReplay: submission.isIdempotentReplay,
        paymentIntent: toCheckoutPaymentIntentDto(submission.paymentIntent),
    };
}
//# sourceMappingURL=checkout-submission.dto.js.map
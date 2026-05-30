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
exports.CheckoutSubmissionDto = void 0;
exports.toCheckoutSubmissionDto = toCheckoutSubmissionDto;
const swagger_1 = require("@nestjs/swagger");
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
        subtotalAmount: submission.subtotalAmount,
        discountAmount: submission.discountAmount,
        deliveryFee: submission.deliveryFee,
        totalAmount: submission.totalAmount,
        placedAt: submission.placedAt,
        isIdempotentReplay: submission.isIdempotentReplay,
    };
}
//# sourceMappingURL=checkout-submission.dto.js.map
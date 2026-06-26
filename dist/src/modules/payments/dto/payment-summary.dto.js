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
exports.PaymentDetailDto = exports.PaymentSummaryDto = void 0;
exports.toPaymentSummaryDto = toPaymentSummaryDto;
exports.toPaymentDetailDto = toPaymentDetailDto;
const swagger_1 = require("@nestjs/swagger");
class PaymentRelatedRefundDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'refund_1' }),
    __metadata("design:type", String)
], PaymentRelatedRefundDto.prototype, "refundId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SUCCEEDED' }),
    __metadata("design:type", String)
], PaymentRelatedRefundDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1500' }),
    __metadata("design:type", String)
], PaymentRelatedRefundDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MMK' }),
    __metadata("design:type", String)
], PaymentRelatedRefundDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'refund_ref_1' }),
    __metadata("design:type", Object)
], PaymentRelatedRefundDto.prototype, "providerReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'customer_support' }),
    __metadata("design:type", Object)
], PaymentRelatedRefundDto.prototype, "reasonCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Goodwill refund' }),
    __metadata("design:type", Object)
], PaymentRelatedRefundDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-24T09:00:00.000Z' }),
    __metadata("design:type", String)
], PaymentRelatedRefundDto.prototype, "requestedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-04-24T09:10:00.000Z' }),
    __metadata("design:type", Object)
], PaymentRelatedRefundDto.prototype, "succeededAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], PaymentRelatedRefundDto.prototype, "failedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], PaymentRelatedRefundDto.prototype, "cancelledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'usr_admin_1' }),
    __metadata("design:type", Object)
], PaymentRelatedRefundDto.prototype, "createdByUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ADMIN' }),
    __metadata("design:type", Object)
], PaymentRelatedRefundDto.prototype, "createdByUserRole", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '099999999' }),
    __metadata("design:type", Object)
], PaymentRelatedRefundDto.prototype, "createdByUserPhone", void 0);
class PaymentSummaryDto {
}
exports.PaymentSummaryDto = PaymentSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'payment_1' }),
    __metadata("design:type", String)
], PaymentSummaryDto.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order_1' }),
    __metadata("design:type", String)
], PaymentSummaryDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cust_prof_1' }),
    __metadata("design:type", String)
], PaymentSummaryDto.prototype, "customerProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CARD' }),
    __metadata("design:type", String)
], PaymentSummaryDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'STRIPE' }),
    __metadata("design:type", String)
], PaymentSummaryDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SUCCEEDED' }),
    __metadata("design:type", String)
], PaymentSummaryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6500' }),
    __metadata("design:type", String)
], PaymentSummaryDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1500' }),
    __metadata("design:type", String)
], PaymentSummaryDto.prototype, "refundedAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MMK' }),
    __metadata("design:type", String)
], PaymentSummaryDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'idem_1' }),
    __metadata("design:type", Object)
], PaymentSummaryDto.prototype, "idempotencyKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'pi_123' }),
    __metadata("design:type", Object)
], PaymentSummaryDto.prototype, "providerReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'receipt_123' }),
    __metadata("design:type", Object)
], PaymentSummaryDto.prototype, "providerReceiptId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], PaymentSummaryDto.prototype, "failureCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], PaymentSummaryDto.prototype, "failureMessage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-04-24T08:00:00.000Z' }),
    __metadata("design:type", Object)
], PaymentSummaryDto.prototype, "requiresActionAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-04-24T08:10:00.000Z' }),
    __metadata("design:type", Object)
], PaymentSummaryDto.prototype, "succeededAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], PaymentSummaryDto.prototype, "failedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], PaymentSummaryDto.prototype, "cancelledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], PaymentSummaryDto.prototype, "expiredAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-24T08:00:00.000Z' }),
    __metadata("design:type", String)
], PaymentSummaryDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-24T08:10:00.000Z' }),
    __metadata("design:type", String)
], PaymentSummaryDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => PaymentRelatedRefundDto, isArray: true }),
    __metadata("design:type", Array)
], PaymentSummaryDto.prototype, "refunds", void 0);
class PaymentAttemptDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'payment_attempt_1' }),
    __metadata("design:type", String)
], PaymentAttemptDto.prototype, "paymentAttemptId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'payment_1' }),
    __metadata("design:type", String)
], PaymentAttemptDto.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'STRIPE' }),
    __metadata("design:type", String)
], PaymentAttemptDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SUCCEEDED' }),
    __metadata("design:type", String)
], PaymentAttemptDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'pi_123' }),
    __metadata("design:type", Object)
], PaymentAttemptDto.prototype, "providerReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], PaymentAttemptDto.prototype, "failureCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], PaymentAttemptDto.prototype, "failureMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-24T08:10:00.000Z' }),
    __metadata("design:type", String)
], PaymentAttemptDto.prototype, "attemptedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-24T08:10:00.000Z' }),
    __metadata("design:type", String)
], PaymentAttemptDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-24T08:10:00.000Z' }),
    __metadata("design:type", String)
], PaymentAttemptDto.prototype, "updatedAt", void 0);
class PaymentDetailDto extends PaymentSummaryDto {
}
exports.PaymentDetailDto = PaymentDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => PaymentAttemptDto, isArray: true }),
    __metadata("design:type", Array)
], PaymentDetailDto.prototype, "attempts", void 0);
function toPaymentRelatedRefundDto(refund) {
    return {
        refundId: refund.refundId,
        status: refund.status,
        amount: refund.amount,
        currencyCode: refund.currencyCode,
        providerReference: refund.providerReference,
        reasonCode: refund.reasonCode,
        note: refund.note,
        requestedAt: refund.requestedAt,
        succeededAt: refund.succeededAt,
        failedAt: refund.failedAt,
        cancelledAt: refund.cancelledAt,
        createdByUserId: refund.createdByUserId,
        createdByUserRole: refund.createdByUserRole,
        createdByUserPhone: refund.createdByUserPhone,
    };
}
function toPaymentSummaryDto(payment) {
    return {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        customerProfileId: payment.customerProfileId,
        method: payment.method,
        provider: payment.provider,
        status: payment.status,
        amount: payment.amount,
        refundedAmount: payment.refundedAmount,
        currencyCode: payment.currencyCode,
        idempotencyKey: payment.idempotencyKey,
        providerReference: payment.providerReference,
        providerReceiptId: payment.providerReceiptId,
        failureCode: payment.failureCode,
        failureMessage: payment.failureMessage,
        requiresActionAt: payment.requiresActionAt,
        succeededAt: payment.succeededAt,
        failedAt: payment.failedAt,
        cancelledAt: payment.cancelledAt,
        expiredAt: payment.expiredAt,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        refunds: payment.refunds.map((refund) => toPaymentRelatedRefundDto(refund)),
    };
}
function toPaymentAttemptDto(attempt) {
    return {
        paymentAttemptId: attempt.paymentAttemptId,
        paymentId: attempt.paymentId,
        provider: attempt.provider,
        status: attempt.status,
        providerReference: attempt.providerReference,
        failureCode: attempt.failureCode,
        failureMessage: attempt.failureMessage,
        attemptedAt: attempt.attemptedAt,
        createdAt: attempt.createdAt,
        updatedAt: attempt.updatedAt,
    };
}
function toPaymentDetailDto(payment) {
    return {
        ...toPaymentSummaryDto(payment),
        attempts: payment.attempts.map((attempt) => toPaymentAttemptDto(attempt)),
    };
}
//# sourceMappingURL=payment-summary.dto.js.map
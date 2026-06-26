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
exports.RefundDetailDto = exports.RefundSummaryDto = void 0;
exports.toRefundSummaryDto = toRefundSummaryDto;
exports.toRefundDetailDto = toRefundDetailDto;
const swagger_1 = require("@nestjs/swagger");
class RefundSummaryDto {
}
exports.RefundSummaryDto = RefundSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'refund_1' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "refundId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'payment_1' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order_1' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'usr_admin_1' }),
    __metadata("design:type", Object)
], RefundSummaryDto.prototype, "createdByUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SUCCEEDED' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1500' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MMK' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'refund-idem-1' }),
    __metadata("design:type", Object)
], RefundSummaryDto.prototype, "idempotencyKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'refund_ref_1' }),
    __metadata("design:type", Object)
], RefundSummaryDto.prototype, "providerReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'customer_support' }),
    __metadata("design:type", Object)
], RefundSummaryDto.prototype, "reasonCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Goodwill refund' }),
    __metadata("design:type", Object)
], RefundSummaryDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], RefundSummaryDto.prototype, "failureCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], RefundSummaryDto.prototype, "failureMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-24T09:00:00.000Z' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "requestedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-04-24T09:10:00.000Z' }),
    __metadata("design:type", Object)
], RefundSummaryDto.prototype, "succeededAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], RefundSummaryDto.prototype, "failedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], RefundSummaryDto.prototype, "cancelledAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CARD' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'STRIPE' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "paymentProvider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PARTIALLY_REFUNDED' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10000' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "paymentAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1500' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "paymentRefundedAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ADMIN' }),
    __metadata("design:type", Object)
], RefundSummaryDto.prototype, "createdByUserRole", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '099999999' }),
    __metadata("design:type", Object)
], RefundSummaryDto.prototype, "createdByUserPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-24T09:00:00.000Z' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-24T09:10:00.000Z' }),
    __metadata("design:type", String)
], RefundSummaryDto.prototype, "updatedAt", void 0);
class RefundAttemptDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'refund_attempt_1' }),
    __metadata("design:type", String)
], RefundAttemptDto.prototype, "refundAttemptId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'refund_1' }),
    __metadata("design:type", String)
], RefundAttemptDto.prototype, "refundId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'STRIPE' }),
    __metadata("design:type", String)
], RefundAttemptDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SUCCEEDED' }),
    __metadata("design:type", String)
], RefundAttemptDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'refund_ref_1' }),
    __metadata("design:type", Object)
], RefundAttemptDto.prototype, "providerReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], RefundAttemptDto.prototype, "failureCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], RefundAttemptDto.prototype, "failureMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-24T09:10:00.000Z' }),
    __metadata("design:type", String)
], RefundAttemptDto.prototype, "attemptedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-24T09:10:00.000Z' }),
    __metadata("design:type", String)
], RefundAttemptDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-24T09:10:00.000Z' }),
    __metadata("design:type", String)
], RefundAttemptDto.prototype, "updatedAt", void 0);
class RefundDetailDto extends RefundSummaryDto {
}
exports.RefundDetailDto = RefundDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => RefundAttemptDto, isArray: true }),
    __metadata("design:type", Array)
], RefundDetailDto.prototype, "attempts", void 0);
function toRefundSummaryDto(refund) {
    return {
        refundId: refund.refundId,
        paymentId: refund.paymentId,
        orderId: refund.orderId,
        createdByUserId: refund.createdByUserId,
        status: refund.status,
        amount: refund.amount,
        currencyCode: refund.currencyCode,
        idempotencyKey: refund.idempotencyKey,
        providerReference: refund.providerReference,
        reasonCode: refund.reasonCode,
        note: refund.note,
        failureCode: refund.failureCode,
        failureMessage: refund.failureMessage,
        requestedAt: refund.requestedAt,
        succeededAt: refund.succeededAt,
        failedAt: refund.failedAt,
        cancelledAt: refund.cancelledAt,
        paymentMethod: refund.payment.method,
        paymentProvider: refund.payment.provider,
        paymentStatus: refund.payment.status,
        paymentAmount: refund.payment.amount,
        paymentRefundedAmount: refund.payment.refundedAmount,
        createdByUserRole: refund.createdByUser?.role ?? null,
        createdByUserPhone: refund.createdByUser?.phone ?? null,
        createdAt: refund.createdAt,
        updatedAt: refund.updatedAt,
    };
}
function toRefundAttemptDto(attempt) {
    return {
        refundAttemptId: attempt.refundAttemptId,
        refundId: attempt.refundId,
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
function toRefundDetailDto(refund) {
    return {
        ...toRefundSummaryDto(refund),
        attempts: refund.attempts.map((attempt) => toRefundAttemptDto(attempt)),
    };
}
//# sourceMappingURL=refund-summary.dto.js.map
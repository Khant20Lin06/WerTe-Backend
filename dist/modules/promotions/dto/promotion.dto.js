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
exports.PromotionDto = void 0;
exports.toPromotionDto = toPromotionDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class PromotionDto {
}
exports.PromotionDto = PromotionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'promo_1' }),
    __metadata("design:type", String)
], PromotionDto.prototype, "promotionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'branch_1' }),
    __metadata("design:type", String)
], PromotionDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SAVE10' }),
    __metadata("design:type", String)
], PromotionDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Save 10 percent' }),
    __metadata("design:type", String)
], PromotionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Weekend promo for grocery orders.' }),
    __metadata("design:type", Object)
], PromotionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.PromotionDiscountType,
        example: client_1.PromotionDiscountType.PERCENTAGE,
    }),
    __metadata("design:type", String)
], PromotionDto.prototype, "discountType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10' }),
    __metadata("design:type", String)
], PromotionDto.prototype, "discountValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '5000' }),
    __metadata("design:type", String)
], PromotionDto.prototype, "minimumSubtotalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2500' }),
    __metadata("design:type", Object)
], PromotionDto.prototype, "maximumDiscountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    __metadata("design:type", Object)
], PromotionDto.prototype, "perCustomerLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-05-03T00:00:00.000Z' }),
    __metadata("design:type", Object)
], PromotionDto.prototype, "startsAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-05-31T23:59:59.000Z' }),
    __metadata("design:type", Object)
], PromotionDto.prototype, "endsAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], PromotionDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], PromotionDto.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-02T10:00:00.000Z' }),
    __metadata("design:type", String)
], PromotionDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-02T10:00:00.000Z' }),
    __metadata("design:type", String)
], PromotionDto.prototype, "updatedAt", void 0);
function toPromotionDto(promotion) {
    return {
        promotionId: promotion.promotionId,
        branchId: promotion.branchId,
        code: promotion.code,
        name: promotion.name,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        minimumSubtotalAmount: promotion.minimumSubtotalAmount,
        maximumDiscountAmount: promotion.maximumDiscountAmount,
        perCustomerLimit: promotion.perCustomerLimit,
        startsAt: promotion.startsAt,
        endsAt: promotion.endsAt,
        isActive: promotion.isActive,
        deletedAt: promotion.deletedAt,
        createdAt: promotion.createdAt,
        updatedAt: promotion.updatedAt,
    };
}
//# sourceMappingURL=promotion.dto.js.map
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
exports.AdminPromotionDto = void 0;
exports.toAdminPromotionDto = toAdminPromotionDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class AdminPromotionDto {
}
exports.AdminPromotionDto = AdminPromotionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'promo_1' }),
    __metadata("design:type", String)
], AdminPromotionDto.prototype, "promotionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'branch_1' }),
    __metadata("design:type", String)
], AdminPromotionDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mama Kitchen — Main Branch' }),
    __metadata("design:type", Object)
], AdminPromotionDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mama Kitchen' }),
    __metadata("design:type", Object)
], AdminPromotionDto.prototype, "merchantName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SAVE10' }),
    __metadata("design:type", String)
], AdminPromotionDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Save 10 percent' }),
    __metadata("design:type", String)
], AdminPromotionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], AdminPromotionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PromotionDiscountType }),
    __metadata("design:type", String)
], AdminPromotionDto.prototype, "discountType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10' }),
    __metadata("design:type", String)
], AdminPromotionDto.prototype, "discountValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '5000' }),
    __metadata("design:type", String)
], AdminPromotionDto.prototype, "minimumSubtotalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2500' }),
    __metadata("design:type", Object)
], AdminPromotionDto.prototype, "maximumDiscountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-05-03T00:00:00.000Z' }),
    __metadata("design:type", Object)
], AdminPromotionDto.prototype, "startsAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-05-31T23:59:59.000Z' }),
    __metadata("design:type", Object)
], AdminPromotionDto.prototype, "endsAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], AdminPromotionDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 42, description: 'Number of orders that used this promotion' }),
    __metadata("design:type", Number)
], AdminPromotionDto.prototype, "usageCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-02T10:00:00.000Z' }),
    __metadata("design:type", String)
], AdminPromotionDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-02T10:00:00.000Z' }),
    __metadata("design:type", String)
], AdminPromotionDto.prototype, "updatedAt", void 0);
function toAdminPromotionDto(record, branch) {
    return {
        promotionId: record.id,
        branchId: record.branchId,
        branchName: branch?.name ?? null,
        merchantName: branch?.merchant?.name ?? null,
        code: record.code,
        name: record.name,
        description: record.description,
        discountType: record.discountType,
        discountValue: record.discountValue.toString(),
        minimumSubtotalAmount: record.minimumSubtotalAmount.toString(),
        maximumDiscountAmount: record.maximumDiscountAmount?.toString() ?? null,
        startsAt: record.startsAt?.toISOString() ?? null,
        endsAt: record.endsAt?.toISOString() ?? null,
        isActive: record.isActive,
        usageCount: record._count.orders,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=admin-promotion.dto.js.map
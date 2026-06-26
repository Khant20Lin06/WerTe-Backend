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
exports.AppliedPromotionDto = void 0;
exports.toAppliedPromotionDto = toAppliedPromotionDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class AppliedPromotionDto {
}
exports.AppliedPromotionDto = AppliedPromotionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'promo_1' }),
    __metadata("design:type", String)
], AppliedPromotionDto.prototype, "promotionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SAVE10' }),
    __metadata("design:type", String)
], AppliedPromotionDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Save 10 percent' }),
    __metadata("design:type", String)
], AppliedPromotionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.PromotionDiscountType,
        example: client_1.PromotionDiscountType.PERCENTAGE,
    }),
    __metadata("design:type", String)
], AppliedPromotionDto.prototype, "discountType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '650' }),
    __metadata("design:type", String)
], AppliedPromotionDto.prototype, "discountAmount", void 0);
function toAppliedPromotionDto(promotion) {
    if (promotion === undefined || promotion === null) {
        return null;
    }
    return {
        promotionId: promotion.promotionId,
        code: promotion.code,
        name: promotion.name,
        discountType: promotion.discountType,
        discountAmount: promotion.discountAmount,
    };
}
//# sourceMappingURL=applied-promotion.dto.js.map
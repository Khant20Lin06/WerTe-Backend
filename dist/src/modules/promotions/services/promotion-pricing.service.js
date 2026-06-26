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
exports.PromotionPricingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const applied_promotion_entity_1 = require("../entities/applied-promotion.entity");
const promotions_repository_1 = require("../repositories/promotions.repository");
let PromotionPricingService = class PromotionPricingService {
    constructor(promotionsRepository) {
        this.promotionsRepository = promotionsRepository;
    }
    async evaluatePromotionForCheckout(input) {
        const normalizedCode = this.normalizePromotionCode(input.promotionCode);
        if (normalizedCode === null) {
            return null;
        }
        const promotion = await this.promotionsRepository.findPromotionByBranchIdAndCode(input.branchId, normalizedCode);
        if (promotion === null || !promotion.isActive) {
            throw new app_exception_1.AppException('The promotion code is invalid or unavailable for this branch.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    branchId: input.branchId,
                    promotionCode: normalizedCode,
                },
            });
        }
        const now = new Date();
        if (promotion.startsAt !== null && promotion.startsAt > now) {
            throw new app_exception_1.AppException('The promotion code is not active yet.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    promotionId: promotion.id,
                    startsAt: promotion.startsAt.toISOString(),
                },
            });
        }
        if (promotion.endsAt !== null && promotion.endsAt < now) {
            throw new app_exception_1.AppException('The promotion code has expired.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    promotionId: promotion.id,
                    endsAt: promotion.endsAt.toISOString(),
                },
            });
        }
        if (promotion.minimumSubtotalAmount.gt(input.subtotalAmount)) {
            throw new app_exception_1.AppException('The checkout subtotal does not satisfy the promotion minimum.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    promotionId: promotion.id,
                    minimumSubtotalAmount: promotion.minimumSubtotalAmount.toString(),
                    subtotalAmount: input.subtotalAmount.toString(),
                },
            });
        }
        const uncappedDiscount = promotion.discountType === client_1.PromotionDiscountType.FIXED_AMOUNT
            ? new client_1.Prisma.Decimal(promotion.discountValue)
            : input.subtotalAmount
                .mul(promotion.discountValue)
                .div(new client_1.Prisma.Decimal(100));
        const cappedDiscount = promotion.maximumDiscountAmount === null
            ? uncappedDiscount
            : client_1.Prisma.Decimal.min(uncappedDiscount, new client_1.Prisma.Decimal(promotion.maximumDiscountAmount));
        const discountAmount = client_1.Prisma.Decimal.min(cappedDiscount, input.subtotalAmount);
        return {
            promotionId: promotion.id,
            code: promotion.code,
            name: promotion.name,
            discountType: promotion.discountType,
            discountAmount,
            appliedPromotion: (0, applied_promotion_entity_1.buildAppliedPromotionEntity)({
                promotionId: promotion.id,
                code: promotion.code,
                name: promotion.name,
                discountType: promotion.discountType,
                discountAmount,
            }),
        };
    }
    normalizePromotionCode(code) {
        const normalized = code?.trim().toUpperCase() ?? '';
        return normalized.length > 0 ? normalized : null;
    }
};
exports.PromotionPricingService = PromotionPricingService;
exports.PromotionPricingService = PromotionPricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [promotions_repository_1.PromotionsRepository])
], PromotionPricingService);
//# sourceMappingURL=promotion-pricing.service.js.map
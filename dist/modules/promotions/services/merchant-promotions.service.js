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
exports.MerchantPromotionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const branches_service_1 = require("../../branches/services/branches.service");
const promotion_dto_1 = require("../dto/promotion.dto");
const promotion_entity_1 = require("../entities/promotion.entity");
const promotions_repository_1 = require("../repositories/promotions.repository");
const promotion_pricing_service_1 = require("./promotion-pricing.service");
let MerchantPromotionsService = class MerchantPromotionsService {
    constructor(branchesService, promotionsRepository, promotionPricingService) {
        this.branchesService = branchesService;
        this.promotionsRepository = promotionsRepository;
        this.promotionPricingService = promotionPricingService;
    }
    async listBranchPromotions(currentUser, branchId) {
        await this.requireOwnedBranch(currentUser, branchId);
        const promotions = await this.promotionsRepository.listBranchPromotions(branchId);
        return promotions.map((promotion) => (0, promotion_dto_1.toPromotionDto)((0, promotion_entity_1.buildPromotionEntity)(promotion)));
    }
    async getBranchPromotion(currentUser, branchId, promotionId) {
        await this.requireOwnedBranch(currentUser, branchId);
        const promotion = await this.requireBranchPromotion(branchId, promotionId);
        return (0, promotion_dto_1.toPromotionDto)((0, promotion_entity_1.buildPromotionEntity)(promotion));
    }
    async createBranchPromotion(currentUser, branchId, payload) {
        await this.requireOwnedBranch(currentUser, branchId);
        this.assertPromotionWindow(payload.startsAt, payload.endsAt);
        this.assertDiscountPayload(payload.discountType, payload.discountValue, payload.maximumDiscountAmount);
        const code = this.requireNormalizedCode(payload.code);
        await this.assertCodeIsAvailable(branchId, code);
        const promotion = await this.promotionsRepository.createPromotion({
            branchId,
            code,
            name: payload.name.trim(),
            description: this.normalizeOptionalString(payload.description),
            discountType: payload.discountType,
            discountValue: payload.discountValue,
            minimumSubtotalAmount: payload.minimumSubtotalAmount ?? 0,
            maximumDiscountAmount: payload.maximumDiscountAmount ?? null,
            perCustomerLimit: payload.perCustomerLimit ?? null,
            startsAt: this.toOptionalDate(payload.startsAt),
            endsAt: this.toOptionalDate(payload.endsAt),
            isActive: payload.isActive ?? true,
        });
        return (0, promotion_dto_1.toPromotionDto)((0, promotion_entity_1.buildPromotionEntity)(promotion));
    }
    async updateBranchPromotion(currentUser, branchId, promotionId, payload) {
        await this.requireOwnedBranch(currentUser, branchId);
        const promotion = await this.requireBranchPromotion(branchId, promotionId);
        const nextCode = payload.code !== undefined
            ? this.requireNormalizedCode(payload.code)
            : promotion.code;
        const nextDiscountType = payload.discountType ?? promotion.discountType;
        const nextDiscountValue = payload.discountValue ?? Number(promotion.discountValue);
        const nextMaximumDiscountAmount = payload.maximumDiscountAmount !== undefined
            ? payload.maximumDiscountAmount
            : promotion.maximumDiscountAmount?.toNumber();
        const nextStartsAt = payload.startsAt !== undefined
            ? payload.startsAt
            : promotion.startsAt?.toISOString();
        const nextEndsAt = payload.endsAt !== undefined ? payload.endsAt : promotion.endsAt?.toISOString();
        this.assertPromotionWindow(nextStartsAt, nextEndsAt);
        this.assertDiscountPayload(nextDiscountType, nextDiscountValue, nextMaximumDiscountAmount);
        if (nextCode !== promotion.code) {
            await this.assertCodeIsAvailable(branchId, nextCode, promotionId);
        }
        const updatedPromotion = await this.promotionsRepository.updatePromotion(promotionId, {
            ...(payload.code !== undefined ? { code: nextCode } : {}),
            ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
            ...(payload.description !== undefined
                ? { description: this.normalizeOptionalString(payload.description) }
                : {}),
            ...(payload.discountType !== undefined
                ? { discountType: payload.discountType }
                : {}),
            ...(payload.discountValue !== undefined
                ? { discountValue: payload.discountValue }
                : {}),
            ...(payload.minimumSubtotalAmount !== undefined
                ? { minimumSubtotalAmount: payload.minimumSubtotalAmount }
                : {}),
            ...(payload.maximumDiscountAmount !== undefined
                ? { maximumDiscountAmount: payload.maximumDiscountAmount }
                : {}),
            ...(payload.perCustomerLimit !== undefined
                ? { perCustomerLimit: payload.perCustomerLimit ?? null }
                : {}),
            ...(payload.startsAt !== undefined
                ? { startsAt: this.toOptionalDate(payload.startsAt) }
                : {}),
            ...(payload.endsAt !== undefined
                ? { endsAt: this.toOptionalDate(payload.endsAt) }
                : {}),
            ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        });
        return (0, promotion_dto_1.toPromotionDto)((0, promotion_entity_1.buildPromotionEntity)(updatedPromotion));
    }
    async deleteBranchPromotion(currentUser, branchId, promotionId) {
        await this.requireOwnedBranch(currentUser, branchId);
        await this.requireBranchPromotion(branchId, promotionId);
        await this.promotionsRepository.softDeletePromotion(promotionId);
    }
    async requireOwnedBranch(currentUser, branchId) {
        const branch = await this.branchesService.findOwnedByUserId(currentUser.userId, branchId);
        if (branch === null) {
            throw new app_exception_1.AppException('The requested branch was not found for the authenticated merchant.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return branch;
    }
    async requireBranchPromotion(branchId, promotionId) {
        const promotion = await this.promotionsRepository.findPromotionById(promotionId);
        if (promotion === null || promotion.branchId !== branchId) {
            throw new app_exception_1.AppException('Promotion was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return promotion;
    }
    async assertCodeIsAvailable(branchId, code, existingPromotionId) {
        const existing = await this.promotionsRepository.findPromotionByBranchIdAndCode(branchId, code);
        if (existing === null || existing.id === existingPromotionId) {
            return;
        }
        throw new app_exception_1.AppException('This promotion code is already in use for the branch.', common_1.HttpStatus.CONFLICT, {
            code: error_codes_1.ErrorCodes.conflict,
            details: {
                branchId,
                code,
            },
        });
    }
    requireNormalizedCode(code) {
        const normalized = this.promotionPricingService.normalizePromotionCode(code);
        if (normalized === null) {
            throw new app_exception_1.AppException('A non-empty promotion code is required.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        return normalized;
    }
    assertPromotionWindow(startsAt, endsAt) {
        const startDate = this.toOptionalDate(startsAt);
        const endDate = this.toOptionalDate(endsAt);
        if (startDate !== null &&
            endDate !== null &&
            endDate.getTime() <= startDate.getTime()) {
            throw new app_exception_1.AppException('Promotion end time must be later than the start time.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
    }
    assertDiscountPayload(discountType, discountValue, maximumDiscountAmount) {
        if (discountType === client_1.PromotionDiscountType.PERCENTAGE &&
            discountValue > 100) {
            throw new app_exception_1.AppException('Percentage promotions cannot exceed 100 percent.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        if (maximumDiscountAmount !== undefined &&
            maximumDiscountAmount !== null &&
            maximumDiscountAmount <= 0) {
            throw new app_exception_1.AppException('Maximum discount amount must be greater than zero.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
    }
    normalizeOptionalString(value) {
        const normalized = value?.trim();
        return normalized !== undefined && normalized.length > 0 ? normalized : null;
    }
    toOptionalDate(value) {
        if (value === undefined || value === null || value.trim().length === 0) {
            return null;
        }
        return new Date(value);
    }
};
exports.MerchantPromotionsService = MerchantPromotionsService;
exports.MerchantPromotionsService = MerchantPromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [branches_service_1.BranchesService,
        promotions_repository_1.PromotionsRepository,
        promotion_pricing_service_1.PromotionPricingService])
], MerchantPromotionsService);
//# sourceMappingURL=merchant-promotions.service.js.map
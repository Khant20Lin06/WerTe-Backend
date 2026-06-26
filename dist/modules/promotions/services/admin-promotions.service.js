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
exports.AdminPromotionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const admin_promotion_dto_1 = require("../dto/admin-promotion.dto");
const promotions_repository_1 = require("../repositories/promotions.repository");
const promotion_pricing_service_1 = require("./promotion-pricing.service");
let AdminPromotionsService = class AdminPromotionsService {
    constructor(promotionsRepository, promotionPricingService, prisma) {
        this.promotionsRepository = promotionsRepository;
        this.promotionPricingService = promotionPricingService;
        this.prisma = prisma;
    }
    async listPromotions() {
        const records = await this.promotionsRepository.findAll();
        const branchIds = [...new Set(records.map(r => r.branchId))];
        const branches = await this.prisma.branch.findMany({
            where: { id: { in: branchIds } },
            select: {
                id: true,
                name: true,
                merchant: { select: { name: true } },
            },
        });
        const branchMap = new Map(branches.map(b => [b.id, b]));
        return records.map(r => (0, admin_promotion_dto_1.toAdminPromotionDto)(r, branchMap.get(r.branchId) ?? null));
    }
    async createPromotion(branchId, payload) {
        this.assertPromotionWindow(payload.startsAt, payload.endsAt);
        this.assertDiscountPayload(payload.discountType, payload.discountValue, payload.maximumDiscountAmount);
        const code = this.requireNormalizedCode(payload.code);
        await this.assertCodeIsAvailable(branchId, code);
        const record = await this.promotionsRepository.createPromotion({
            branchId,
            code,
            name: payload.name.trim(),
            description: this.normalizeOptionalString(payload.description),
            discountType: payload.discountType,
            discountValue: payload.discountValue,
            minimumSubtotalAmount: payload.minimumSubtotalAmount ?? 0,
            maximumDiscountAmount: payload.maximumDiscountAmount ?? null,
            startsAt: this.toOptionalDate(payload.startsAt),
            endsAt: this.toOptionalDate(payload.endsAt),
            isActive: payload.isActive ?? true,
        });
        const withCount = { ...record, _count: { orders: 0 } };
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
            select: { name: true, merchant: { select: { name: true } } },
        });
        return (0, admin_promotion_dto_1.toAdminPromotionDto)(withCount, branch);
    }
    async updatePromotion(promotionId, payload) {
        const existing = await this.promotionsRepository.findPromotionById(promotionId);
        if (existing === null) {
            throw new app_exception_1.AppException('Promotion not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        const nextCode = payload.code !== undefined
            ? this.requireNormalizedCode(payload.code)
            : existing.code;
        if (nextCode !== existing.code) {
            await this.assertCodeIsAvailable(existing.branchId, nextCode, promotionId);
        }
        const record = await this.promotionsRepository.updatePromotion(promotionId, {
            ...(payload.code !== undefined ? { code: nextCode } : {}),
            ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
            ...(payload.description !== undefined
                ? { description: this.normalizeOptionalString(payload.description) }
                : {}),
            ...(payload.discountType !== undefined ? { discountType: payload.discountType } : {}),
            ...(payload.discountValue !== undefined ? { discountValue: payload.discountValue } : {}),
            ...(payload.minimumSubtotalAmount !== undefined
                ? { minimumSubtotalAmount: payload.minimumSubtotalAmount }
                : {}),
            ...(payload.maximumDiscountAmount !== undefined
                ? { maximumDiscountAmount: payload.maximumDiscountAmount }
                : {}),
            ...(payload.startsAt !== undefined
                ? { startsAt: this.toOptionalDate(payload.startsAt) }
                : {}),
            ...(payload.endsAt !== undefined ? { endsAt: this.toOptionalDate(payload.endsAt) } : {}),
            ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        });
        const usageCount = await this.prisma.order.count({
            where: { promotionId },
        });
        const branch = await this.prisma.branch.findUnique({
            where: { id: record.branchId },
            select: { name: true, merchant: { select: { name: true } } },
        });
        return (0, admin_promotion_dto_1.toAdminPromotionDto)({ ...record, _count: { orders: usageCount } }, branch);
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
    async assertCodeIsAvailable(branchId, code, existingId) {
        const found = await this.promotionsRepository.findPromotionByBranchIdAndCode(branchId, code);
        if (found !== null && found.id !== existingId) {
            throw new app_exception_1.AppException('This promotion code is already in use for the branch.', common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
    }
    assertPromotionWindow(startsAt, endsAt) {
        const s = this.toOptionalDate(startsAt);
        const e = this.toOptionalDate(endsAt);
        if (s !== null && e !== null && e.getTime() <= s.getTime()) {
            throw new app_exception_1.AppException('Promotion end time must be later than the start time.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
    }
    assertDiscountPayload(type, value, max) {
        if (type === client_1.PromotionDiscountType.PERCENTAGE && value > 100) {
            throw new app_exception_1.AppException('Percentage promotions cannot exceed 100%.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        if (max !== undefined && max !== null && max <= 0) {
            throw new app_exception_1.AppException('Maximum discount amount must be greater than zero.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
    }
    normalizeOptionalString(value) {
        const t = value?.trim();
        return t !== undefined && t.length > 0 ? t : null;
    }
    toOptionalDate(value) {
        if (!value || value.trim().length === 0)
            return null;
        return new Date(value);
    }
};
exports.AdminPromotionsService = AdminPromotionsService;
exports.AdminPromotionsService = AdminPromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [promotions_repository_1.PromotionsRepository,
        promotion_pricing_service_1.PromotionPricingService,
        prisma_service_1.PrismaService])
], AdminPromotionsService);
//# sourceMappingURL=admin-promotions.service.js.map
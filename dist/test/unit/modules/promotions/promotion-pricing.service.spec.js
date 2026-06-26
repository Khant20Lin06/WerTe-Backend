"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const promotion_pricing_service_1 = require("../../../../src/modules/promotions/services/promotion-pricing.service");
describe('PromotionPricingService', () => {
    it('returns null when no promotion code is supplied', async () => {
        const service = new promotion_pricing_service_1.PromotionPricingService({});
        await expect(service.evaluatePromotionForCheckout({
            branchId: 'branch_1',
            subtotalAmount: new client_1.Prisma.Decimal('6500'),
        })).resolves.toBeNull();
    });
    it('applies a percentage promotion and respects the maximum discount cap', async () => {
        const repository = {
            findPromotionByBranchIdAndCode: jest.fn().mockResolvedValue({
                id: 'promo_1',
                branchId: 'branch_1',
                code: 'SAVE20',
                name: 'Save 20 percent',
                description: null,
                discountType: client_1.PromotionDiscountType.PERCENTAGE,
                discountValue: new client_1.Prisma.Decimal('20'),
                minimumSubtotalAmount: new client_1.Prisma.Decimal('5000'),
                maximumDiscountAmount: new client_1.Prisma.Decimal('1000'),
                startsAt: new Date('2026-01-01T00:00:00.000Z'),
                endsAt: new Date('2099-12-31T23:59:59.000Z'),
                isActive: true,
                createdAt: new Date('2026-05-02T00:00:00.000Z'),
                updatedAt: new Date('2026-05-02T00:00:00.000Z'),
            }),
        };
        const service = new promotion_pricing_service_1.PromotionPricingService(repository);
        const result = await service.evaluatePromotionForCheckout({
            branchId: 'branch_1',
            subtotalAmount: new client_1.Prisma.Decimal('6500'),
            promotionCode: 'save20',
        });
        expect(repository.findPromotionByBranchIdAndCode).toHaveBeenCalledWith('branch_1', 'SAVE20');
        expect(result).toMatchObject({
            promotionId: 'promo_1',
            code: 'SAVE20',
            discountType: client_1.PromotionDiscountType.PERCENTAGE,
            appliedPromotion: {
                code: 'SAVE20',
                discountAmount: '1000',
            },
        });
        expect(result?.discountAmount.toString()).toBe('1000');
    });
    it('rejects promotions when the subtotal does not meet the minimum requirement', async () => {
        const service = new promotion_pricing_service_1.PromotionPricingService({
            findPromotionByBranchIdAndCode: jest.fn().mockResolvedValue({
                id: 'promo_1',
                branchId: 'branch_1',
                code: 'SAVE10',
                name: 'Save 10 percent',
                description: null,
                discountType: client_1.PromotionDiscountType.PERCENTAGE,
                discountValue: new client_1.Prisma.Decimal('10'),
                minimumSubtotalAmount: new client_1.Prisma.Decimal('8000'),
                maximumDiscountAmount: null,
                startsAt: null,
                endsAt: null,
                isActive: true,
                createdAt: new Date('2026-05-02T00:00:00.000Z'),
                updatedAt: new Date('2026-05-02T00:00:00.000Z'),
            }),
        });
        await expect(service.evaluatePromotionForCheckout({
            branchId: 'branch_1',
            subtotalAmount: new client_1.Prisma.Decimal('6500'),
            promotionCode: 'SAVE10',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
        });
    });
});
//# sourceMappingURL=promotion-pricing.service.spec.js.map
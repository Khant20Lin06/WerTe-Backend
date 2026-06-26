"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const merchant_promotions_service_1 = require("../../../../src/modules/promotions/services/merchant-promotions.service");
describe('MerchantPromotionsService', () => {
    const currentUser = {
        userId: 'usr_merchant_1',
        sessionId: 'session_1',
        role: client_1.UserRole.MERCHANT,
        tokenType: 'access',
        actorContext: {
            userId: 'usr_merchant_1',
            phone: '0999999999',
            role: client_1.UserRole.MERCHANT,
            status: client_1.UserStatus.ACTIVE,
            merchantId: 'merchant_1',
        },
    };
    const makeBranch = () => ({
        id: 'branch_1',
        merchantId: 'merchant_1',
        name: 'Downtown Branch',
        contactPhone: null,
        line1: null,
        township: 'Botahtaung',
        latitude: null,
        longitude: null,
        storeType: 'restaurant',
        primaryStoreTypeId: null,
        status: client_1.BranchStatus.ACTIVE,
        createdAt: new Date('2026-05-02T00:00:00.000Z'),
        updatedAt: new Date('2026-05-02T00:00:00.000Z'),
        merchant: {
            id: 'merchant_1',
            userId: 'usr_merchant_1',
            name: 'Merchant One',
            storeType: 'restaurant',
            status: client_1.MerchantStatus.ACTIVE,
            user: {
                id: 'usr_merchant_1',
                phone: '0999999999',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
            },
        },
        branchZones: [],
    });
    const makePromotion = (overrides) => ({
        id: 'promo_1',
        branchId: 'branch_1',
        code: 'SAVE10',
        name: 'Save 10 percent',
        description: null,
        discountType: client_1.PromotionDiscountType.PERCENTAGE,
        discountValue: new client_1.Prisma.Decimal('10'),
        minimumSubtotalAmount: new client_1.Prisma.Decimal('5000'),
        maximumDiscountAmount: null,
        startsAt: null,
        endsAt: null,
        isActive: true,
        createdAt: new Date('2026-05-02T00:00:00.000Z'),
        updatedAt: new Date('2026-05-02T00:00:00.000Z'),
        ...overrides,
    });
    const makePromotionPricingService = () => ({
        normalizePromotionCode: jest.fn((code) => {
            const normalized = code?.trim().toUpperCase() ?? '';
            return normalized.length > 0 ? normalized : null;
        }),
    });
    it('lists promotions for a merchant-owned branch', async () => {
        const service = new merchant_promotions_service_1.MerchantPromotionsService({
            findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
        }, {
            listBranchPromotions: jest.fn().mockResolvedValue([makePromotion()]),
        }, makePromotionPricingService());
        await expect(service.listBranchPromotions(currentUser, 'branch_1')).resolves.toEqual([
            expect.objectContaining({
                promotionId: 'promo_1',
                code: 'SAVE10',
                discountValue: '10',
            }),
        ]);
    });
    it('creates a branch promotion with a normalized code', async () => {
        const repository = {
            findPromotionByBranchIdAndCode: jest.fn().mockResolvedValue(null),
            createPromotion: jest.fn().mockResolvedValue(makePromotion()),
        };
        const service = new merchant_promotions_service_1.MerchantPromotionsService({
            findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
        }, repository, makePromotionPricingService());
        const result = await service.createBranchPromotion(currentUser, 'branch_1', {
            code: ' save10 ',
            name: 'Save 10 percent',
            discountType: client_1.PromotionDiscountType.PERCENTAGE,
            discountValue: 10,
            minimumSubtotalAmount: 5000,
        });
        expect(repository.createPromotion).toHaveBeenCalledWith(expect.objectContaining({
            branchId: 'branch_1',
            code: 'SAVE10',
        }));
        expect(result.code).toBe('SAVE10');
    });
    it('rejects duplicate promotion codes on the same branch', async () => {
        const service = new merchant_promotions_service_1.MerchantPromotionsService({
            findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
        }, {
            findPromotionByBranchIdAndCode: jest
                .fn()
                .mockResolvedValue(makePromotion()),
        }, makePromotionPricingService());
        await expect(service.createBranchPromotion(currentUser, 'branch_1', {
            code: 'SAVE10',
            name: 'Save 10 percent',
            discountType: client_1.PromotionDiscountType.PERCENTAGE,
            discountValue: 10,
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
        });
    });
});
//# sourceMappingURL=merchant-promotions.service.spec.js.map
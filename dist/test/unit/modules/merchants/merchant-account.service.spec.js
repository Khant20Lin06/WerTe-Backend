"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const merchant_policy_service_1 = require("../../../../src/modules/merchants/policies/merchant-policy.service");
const merchant_account_service_1 = require("../../../../src/modules/merchants/services/merchant-account.service");
describe('MerchantAccountService', () => {
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
    const makeMerchant = (overrides) => ({
        id: 'merchant_1',
        userId: 'usr_merchant_1',
        name: 'Tea House',
        supportPhone: '0942000000',
        storeType: 'restaurant',
        primaryStoreTypeId: 'store_type_restaurant',
        status: client_1.MerchantStatus.ACTIVE,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        user: {
            id: 'usr_merchant_1',
            phone: '0999999999',
            role: client_1.UserRole.MERCHANT,
            status: client_1.UserStatus.ACTIVE,
        },
        ...overrides,
    });
    it('returns the authenticated merchant profile', async () => {
        const merchantsService = {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeMerchant()),
        };
        const service = new merchant_account_service_1.MerchantAccountService(merchantsService, {}, new merchant_policy_service_1.MerchantPolicyService());
        await expect(service.getCurrentMerchantProfile(currentUser)).resolves.toEqual({
            id: 'merchant_1',
            name: 'Tea House',
            phone: '0999999999',
            supportPhone: '0942000000',
            storeType: 'restaurant',
            status: client_1.MerchantStatus.ACTIVE,
            createdAt: '2026-04-19T00:00:00.000Z',
            updatedAt: '2026-04-19T00:00:00.000Z',
        });
    });
    it('rejects when no owned merchant profile exists', async () => {
        const merchantsService = {
            findOwnedByUserId: jest.fn().mockResolvedValue(null),
        };
        const service = new merchant_account_service_1.MerchantAccountService(merchantsService, {}, new merchant_policy_service_1.MerchantPolicyService());
        await expect(service.getCurrentMerchantProfile(currentUser)).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.notFound,
            }),
        });
    });
    it('updates the merchant default store type', async () => {
        const merchantsRepository = {
            update: jest.fn().mockResolvedValue(makeMerchant({
                storeType: 'grocery',
            })),
        };
        const service = new merchant_account_service_1.MerchantAccountService({
            findOwnedByUserId: jest.fn().mockResolvedValue(makeMerchant()),
            invalidateCache: jest.fn().mockResolvedValue(undefined),
        }, merchantsRepository, new merchant_policy_service_1.MerchantPolicyService());
        const result = await service.updateCurrentMerchantProfile(currentUser, {
            storeType: 'grocery',
        });
        expect(merchantsRepository.update).toHaveBeenCalledWith('merchant_1', {
            storeType: 'grocery',
        });
        expect(result.storeType).toBe('grocery');
    });
});
//# sourceMappingURL=merchant-account.service.spec.js.map
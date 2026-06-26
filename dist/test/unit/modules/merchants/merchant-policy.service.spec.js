"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const merchant_policy_service_1 = require("../../../../src/modules/merchants/policies/merchant-policy.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('MerchantPolicyService', () => {
    const service = new merchant_policy_service_1.MerchantPolicyService();
    const merchant = {
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
    };
    it('allows the owning merchant user to access the merchant profile', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_merchant_1',
            role: client_1.UserRole.MERCHANT,
            actorContext: {
                userId: 'usr_merchant_1',
                phone: '0999999999',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
                merchantId: 'merchant_1',
            },
        });
        expect(service.canAccessMerchant(currentUser, merchant)).toBe(true);
    });
    it('denies access when the merchant scope mismatches', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_merchant_1',
            role: client_1.UserRole.MERCHANT,
            actorContext: {
                userId: 'usr_merchant_1',
                phone: '0999999999',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
                merchantId: 'merchant_2',
            },
        });
        expect(service.canAccessMerchant(currentUser, merchant)).toBe(false);
    });
});
//# sourceMappingURL=merchant-policy.service.spec.js.map
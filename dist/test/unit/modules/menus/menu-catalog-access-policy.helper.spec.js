"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const menu_catalog_access_policy_helper_1 = require("../../../../src/modules/menus/policies/menu-catalog-access-policy.helper");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('menu-catalog-access-policy helper', () => {
    it('allows merchant catalog access when role, owner, and merchant scope match', () => {
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
        expect((0, menu_catalog_access_policy_helper_1.hasMerchantCatalogAccess)({
            currentUser,
            ownerUserId: 'usr_merchant_1',
            merchantId: 'merchant_1',
        })).toBe(true);
    });
    it('denies merchant catalog access when the merchant scope mismatches', () => {
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
        expect((0, menu_catalog_access_policy_helper_1.hasMerchantCatalogAccess)({
            currentUser,
            ownerUserId: 'usr_merchant_1',
            merchantId: 'merchant_1',
        })).toBe(false);
    });
});
//# sourceMappingURL=menu-catalog-access-policy.helper.spec.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const menu_item_policy_service_1 = require("../../../../src/modules/menus/policies/menu-item-policy.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const menu_catalog_policy_fixture_1 = require("./helpers/menu-catalog-policy.fixture");
describe('MenuItemPolicyService', () => {
    const service = new menu_item_policy_service_1.MenuItemPolicyService();
    it('allows the owning merchant to use a category in the same merchant scope', () => {
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
        expect(service.canUseCategory(currentUser, (0, menu_catalog_policy_fixture_1.makeMenuCategoryOwnershipRecord)())).toBe(true);
    });
    it('denies item management outside the merchant scope', () => {
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
        expect(service.canManageItem(currentUser, (0, menu_catalog_policy_fixture_1.makeMenuItemOwnershipRecord)())).toBe(false);
    });
});
//# sourceMappingURL=menu-item-policy.service.spec.js.map
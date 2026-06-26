"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const menu_category_policy_service_1 = require("../../../../src/modules/menus/policies/menu-category-policy.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const menu_catalog_policy_fixture_1 = require("./helpers/menu-catalog-policy.fixture");
describe('MenuCategoryPolicyService', () => {
    const service = new menu_category_policy_service_1.MenuCategoryPolicyService();
    it('allows the owning merchant to manage a branch catalog', () => {
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
        expect(service.canManageBranchCatalog(currentUser, (0, menu_catalog_policy_fixture_1.makeBranchOwnershipRecord)())).toBe(true);
    });
    it('denies category management outside the merchant scope', () => {
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
        expect(service.canManageCategory(currentUser, (0, menu_catalog_policy_fixture_1.makeMenuCategoryOwnershipRecord)())).toBe(false);
    });
});
//# sourceMappingURL=menu-category-policy.service.spec.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const menu_option_group_policy_service_1 = require("../../../../src/modules/menus/policies/menu-option-group-policy.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const menu_catalog_policy_fixture_1 = require("./helpers/menu-catalog-policy.fixture");
describe('MenuOptionGroupPolicyService', () => {
    const service = new menu_option_group_policy_service_1.MenuOptionGroupPolicyService();
    it('allows the owning merchant to manage option groups for an owned item', () => {
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
        expect(service.canManageItem(currentUser, (0, menu_catalog_policy_fixture_1.makeMenuItemOwnershipRecord)())).toBe(true);
    });
    it('denies option-group management outside the merchant scope', () => {
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
        expect(service.canManageOptionGroup(currentUser, (0, menu_catalog_policy_fixture_1.makeItemOptionGroupOwnershipRecord)())).toBe(false);
    });
});
//# sourceMappingURL=menu-option-group-policy.service.spec.js.map
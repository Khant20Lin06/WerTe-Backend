"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const finance_access_policy_helper_1 = require("../../../../src/modules/payments/policies/finance-access-policy.helper");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('FinanceAccessPolicyHelper', () => {
    it('detects customer finance scope when a customer profile is present', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            actorContext: {
                userId: 'usr_customer_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_1',
            },
        });
        expect((0, finance_access_policy_helper_1.hasCustomerFinanceScope)(currentUser)).toBe(true);
        expect((0, finance_access_policy_helper_1.requireCustomerFinanceScope)(currentUser)).toBe('cust_prof_1');
    });
    it('rejects finance customer scope access when the actor is not a scoped customer', () => {
        const adminUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_admin_1',
            role: client_1.UserRole.ADMIN,
            actorContext: {
                userId: 'usr_admin_1',
                phone: '099999999',
                role: client_1.UserRole.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        expect((0, finance_access_policy_helper_1.hasCustomerFinanceScope)(adminUser)).toBe(false);
        expect(() => (0, finance_access_policy_helper_1.requireCustomerFinanceScope)(adminUser)).toThrow(expect.objectContaining({
            status: common_1.HttpStatus.FORBIDDEN,
        }));
    });
    it('detects admin finance access and rejects non-admin actors', () => {
        const adminUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_admin_1',
            role: client_1.UserRole.ADMIN,
            actorContext: {
                userId: 'usr_admin_1',
                phone: '099999999',
                role: client_1.UserRole.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        expect((0, finance_access_policy_helper_1.hasAdminFinanceAccess)(adminUser)).toBe(true);
        expect(() => (0, finance_access_policy_helper_1.requireAdminFinanceAccess)(adminUser, 'payments')).not.toThrow();
        expect((0, finance_access_policy_helper_1.hasAdminFinanceAccess)((0, authenticated_user_factory_1.makeAuthenticatedUser)())).toBe(false);
        expect(() => (0, finance_access_policy_helper_1.requireAdminFinanceAccess)((0, authenticated_user_factory_1.makeAuthenticatedUser)(), 'refunds')).toThrow(expect.objectContaining({
            status: common_1.HttpStatus.FORBIDDEN,
        }));
    });
});
//# sourceMappingURL=finance-access-policy.helper.spec.js.map
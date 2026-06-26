"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const checkout_customer_access_policy_helper_1 = require("../../../../src/modules/checkout/policies/checkout-customer-access-policy.helper");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('checkout customer access policy helper', () => {
    it('allows checkout access when customer user and scoped profile match', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            role: client_1.UserRole.CUSTOMER,
            actorContext: {
                userId: 'usr_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_1',
            },
        });
        expect((0, checkout_customer_access_policy_helper_1.hasCheckoutCustomerAccess)({
            currentUser,
            ownerUserId: 'usr_1',
            customerProfileId: 'cust_prof_1',
        })).toBe(true);
    });
    it('denies checkout access when the actor-scoped customer profile mismatches', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            role: client_1.UserRole.CUSTOMER,
            actorContext: {
                userId: 'usr_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_2',
            },
        });
        expect((0, checkout_customer_access_policy_helper_1.hasCheckoutCustomerAccess)({
            currentUser,
            ownerUserId: 'usr_1',
            customerProfileId: 'cust_prof_1',
        })).toBe(false);
    });
    it('denies checkout access for non-customer actors', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            role: client_1.UserRole.ADMIN,
            actorContext: {
                userId: 'usr_admin_1',
                phone: '0999999999',
                role: client_1.UserRole.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        expect((0, checkout_customer_access_policy_helper_1.hasCheckoutCustomerAccess)({
            currentUser,
            ownerUserId: 'usr_admin_1',
            customerProfileId: 'cust_prof_1',
        })).toBe(false);
    });
    it('allows checkout access when the actor has no scoped customer profile but still owns the resource', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            role: client_1.UserRole.CUSTOMER,
            actorContext: {
                userId: 'usr_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        expect((0, checkout_customer_access_policy_helper_1.hasCheckoutCustomerAccess)({
            currentUser,
            ownerUserId: 'usr_1',
            customerProfileId: 'cust_prof_1',
        })).toBe(true);
    });
});
//# sourceMappingURL=checkout-customer-access-policy.helper.spec.js.map
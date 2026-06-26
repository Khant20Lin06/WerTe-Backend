"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const customer_cart_access_policy_helper_1 = require("../../../../src/modules/carts/policies/customer-cart-access-policy.helper");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('customer cart access policy helper', () => {
    it('allows customer cart access when user and actor-scoped customer profile match', () => {
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
        expect((0, customer_cart_access_policy_helper_1.hasCustomerCartAccess)({
            currentUser,
            ownerUserId: 'usr_1',
            customerProfileId: 'cust_prof_1',
        })).toBe(true);
    });
    it('denies customer cart access when the actor-scoped customer profile mismatches', () => {
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
        expect((0, customer_cart_access_policy_helper_1.hasCustomerCartAccess)({
            currentUser,
            ownerUserId: 'usr_1',
            customerProfileId: 'cust_prof_1',
        })).toBe(false);
    });
    it('denies customer cart access for non-customer actors', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            role: client_1.UserRole.MERCHANT,
            actorContext: {
                userId: 'usr_merchant_1',
                phone: '0999999999',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
                merchantId: 'merchant_1',
            },
        });
        expect((0, customer_cart_access_policy_helper_1.hasCustomerCartAccess)({
            currentUser,
            ownerUserId: 'usr_merchant_1',
            customerProfileId: 'cust_prof_1',
        })).toBe(false);
    });
});
//# sourceMappingURL=customer-cart-access-policy.helper.spec.js.map
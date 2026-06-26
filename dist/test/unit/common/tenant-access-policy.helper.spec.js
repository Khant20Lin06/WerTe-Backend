"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const tenant_access_policy_helper_1 = require("../../../src/common/policies/tenant-access-policy.helper");
const authenticated_user_factory_1 = require("../helpers/authenticated-user.factory");
describe('tenant access policy helper', () => {
    it('allows owned resource access when role, owner, and scope all match', () => {
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
        expect((0, tenant_access_policy_helper_1.hasOwnedResourceAccess)({
            currentUser,
            expectedRole: client_1.UserRole.CUSTOMER,
            ownerUserId: 'usr_1',
            resourceId: 'cust_prof_1',
            actorScopedResourceId: currentUser.actorContext.customerProfileId,
        })).toBe(true);
    });
    it('denies owned resource access when the scoped resource mismatches', () => {
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
        expect((0, tenant_access_policy_helper_1.hasOwnedResourceAccess)({
            currentUser,
            expectedRole: client_1.UserRole.CUSTOMER,
            ownerUserId: 'usr_1',
            resourceId: 'cust_prof_1',
            actorScopedResourceId: currentUser.actorContext.customerProfileId,
        })).toBe(false);
    });
    it('allows open scope when the actor-scoped resource id is undefined', () => {
        expect((0, tenant_access_policy_helper_1.matchesActorScopedResource)(undefined, 'merchant_1')).toBe(true);
    });
    it('supports multi-role checks for shared read scenarios', () => {
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
        expect((0, tenant_access_policy_helper_1.hasAnyRole)(currentUser, [client_1.UserRole.ADMIN, client_1.UserRole.MERCHANT])).toBe(true);
    });
});
//# sourceMappingURL=tenant-access-policy.helper.spec.js.map
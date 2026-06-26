"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const customer_profile_policy_service_1 = require("../../../../src/modules/customer-profiles/policies/customer-profile-policy.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('CustomerProfilePolicyService', () => {
    const service = new customer_profile_policy_service_1.CustomerProfilePolicyService();
    const profile = {
        id: 'cust_prof_1',
        userId: 'usr_1',
        fullName: 'Mg Mg',
        avatarUrl: null,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        user: {
            id: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
        },
    };
    it('allows the owning customer to access the profile', () => {
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
        expect(service.canAccessProfile(currentUser, profile)).toBe(true);
    });
    it('denies access when the actor is not the owning customer', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            role: client_1.UserRole.ADMIN,
            actorContext: {
                userId: 'usr_admin_1',
                phone: '09111111111',
                role: client_1.UserRole.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        expect(service.canAccessProfile(currentUser, profile)).toBe(false);
    });
});
//# sourceMappingURL=customer-profile-policy.service.spec.js.map
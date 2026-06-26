"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const customer_profile_policy_service_1 = require("../../../../src/modules/customer-profiles/policies/customer-profile-policy.service");
const customer_profile_account_service_1 = require("../../../../src/modules/customer-profiles/services/customer-profile-account.service");
describe('CustomerProfileAccountService', () => {
    const currentUser = {
        userId: 'usr_1',
        sessionId: 'session_1',
        role: client_1.UserRole.CUSTOMER,
        tokenType: 'access',
        actorContext: {
            userId: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
            customerProfileId: 'cust_prof_1',
        },
    };
    const makeProfile = (overrides) => ({
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
        ...overrides,
    });
    it('returns the authenticated customer profile', async () => {
        const profilesService = {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
        };
        const service = new customer_profile_account_service_1.CustomerProfileAccountService(profilesService, {}, new customer_profile_policy_service_1.CustomerProfilePolicyService());
        await expect(service.getCurrentProfile(currentUser)).resolves.toEqual({
            id: 'cust_prof_1',
            phone: '09123456789',
            fullName: 'Mg Mg',
            avatarUrl: null,
            status: client_1.UserStatus.ACTIVE,
            createdAt: '2026-04-19T00:00:00.000Z',
            updatedAt: '2026-04-19T00:00:00.000Z',
        });
    });
    it('rejects when the authenticated customer has no owned profile', async () => {
        const profilesService = {
            findOwnedByUserId: jest.fn().mockResolvedValue(null),
        };
        const service = new customer_profile_account_service_1.CustomerProfileAccountService(profilesService, {}, new customer_profile_policy_service_1.CustomerProfilePolicyService());
        await expect(service.getCurrentProfile(currentUser)).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.notFound,
            }),
        });
    });
});
//# sourceMappingURL=customer-profile-account.service.spec.js.map
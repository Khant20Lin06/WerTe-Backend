"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const customer_profiles_service_1 = require("../../../../src/modules/customer-profiles/services/customer-profiles.service");
describe('CustomerProfilesService', () => {
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
    it('builds an ownership summary from the customer profile aggregate', () => {
        const repository = {};
        const service = new customer_profiles_service_1.CustomerProfilesService(repository);
        const ownership = service.buildOwnership(makeProfile());
        expect(ownership).toEqual({
            customerProfileId: 'cust_prof_1',
            userId: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            userStatus: client_1.UserStatus.ACTIVE,
            fullName: 'Mg Mg',
            avatarUrl: null,
        });
    });
    it('returns null when the profile does not belong to the requesting user', async () => {
        const repository = {
            findById: jest.fn().mockResolvedValue(makeProfile()),
        };
        const service = new customer_profiles_service_1.CustomerProfilesService(repository);
        const profile = await service.findOwnedByUserId('usr_2', 'cust_prof_1');
        expect(profile).toBeNull();
    });
});
//# sourceMappingURL=customer-profiles.service.spec.js.map
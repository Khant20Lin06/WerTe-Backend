"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const users_service_1 = require("../../../../src/modules/users/services/users.service");
describe('UsersService', () => {
    const makeUser = (overrides) => ({
        id: 'usr_1',
        phone: '09123456789',
        passwordHash: 'hash',
        role: client_1.UserRole.CUSTOMER,
        status: client_1.UserStatus.ACTIVE,
        lastLoginAt: null,
        createdAt: new Date('2026-04-18T00:00:00.000Z'),
        updatedAt: new Date('2026-04-18T00:00:00.000Z'),
        customerProfile: { id: 'cust_prof_1' },
        riderProfile: null,
        merchantProfile: null,
        staffProfile: null,
        ...overrides,
    });
    it('builds actor context from the user identity aggregate', () => {
        const repository = {};
        const service = new users_service_1.UsersService(repository);
        const actorContext = service.buildActorContext(makeUser());
        expect(actorContext).toEqual({
            userId: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
            customerProfileId: 'cust_prof_1',
            riderId: undefined,
            riderStatus: undefined,
            merchantId: undefined,
            merchantStatus: undefined,
            staffMemberId: undefined,
            staffRole: undefined,
            staffStatus: undefined,
            staffBranchIds: undefined,
            staffMerchantId: undefined,
        });
    });
    it('returns null when the phone belongs to a non-active user', async () => {
        const repository = {
            findByPhone: jest.fn().mockResolvedValue(makeUser({
                status: client_1.UserStatus.SUSPENDED,
            })),
        };
        const service = new users_service_1.UsersService(repository);
        const result = await service.findActiveByPhone('09123456789');
        expect(result).toBeNull();
    });
});
//# sourceMappingURL=users.service.spec.js.map
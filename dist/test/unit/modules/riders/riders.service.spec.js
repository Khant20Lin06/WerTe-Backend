"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const riders_service_1 = require("../../../../src/modules/riders/services/riders.service");
describe('RidersService', () => {
    const makeRider = (overrides) => ({
        id: 'rider_1',
        userId: 'usr_rider_1',
        displayName: 'Ko Aung',
        vehicleType: 'bike',
        currentTownship: 'Kamaryut',
        status: client_1.RiderStatus.ACTIVE,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        user: {
            id: 'usr_rider_1',
            phone: '0977777777',
            role: client_1.UserRole.RIDER,
            status: client_1.UserStatus.ACTIVE,
        },
        availability: null,
        ...overrides,
    });
    it('builds rider ownership details from the rider aggregate', () => {
        const repository = {};
        const service = new riders_service_1.RidersService(repository);
        const ownership = service.buildOwnership(makeRider());
        expect(ownership).toEqual({
            riderId: 'rider_1',
            userId: 'usr_rider_1',
            phone: '0977777777',
            role: client_1.UserRole.RIDER,
            userStatus: client_1.UserStatus.ACTIVE,
            displayName: 'Ko Aung',
            vehicleType: 'bike',
            currentTownship: 'Kamaryut',
            status: client_1.RiderStatus.ACTIVE,
            availability: null,
        });
    });
    it('returns null when the rider does not belong to the authenticated user', async () => {
        const repository = {
            findById: jest.fn().mockResolvedValue(makeRider()),
        };
        const service = new riders_service_1.RidersService(repository);
        const rider = await service.findOwnedByUserId('usr_rider_2', 'rider_1');
        expect(rider).toBeNull();
    });
});
//# sourceMappingURL=riders.service.spec.js.map
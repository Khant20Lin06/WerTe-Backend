"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const rider_policy_service_1 = require("../../../../src/modules/riders/policies/rider-policy.service");
const rider_account_service_1 = require("../../../../src/modules/riders/services/rider-account.service");
describe('RiderAccountService', () => {
    const currentUser = {
        userId: 'usr_rider_1',
        sessionId: 'session_1',
        role: client_1.UserRole.RIDER,
        tokenType: 'access',
        actorContext: {
            userId: 'usr_rider_1',
            phone: '0977777777',
            role: client_1.UserRole.RIDER,
            status: client_1.UserStatus.ACTIVE,
            riderId: 'rider_1',
        },
    };
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
        availability: {
            isOnline: true,
            isAvailable: true,
            lastStatusChangedAt: new Date('2026-04-19T00:05:00.000Z'),
            updatedAt: new Date('2026-04-19T00:05:00.000Z'),
        },
        ...overrides,
    });
    it('returns the authenticated rider profile', async () => {
        const ridersService = {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeRider()),
        };
        const service = new rider_account_service_1.RiderAccountService(ridersService, {}, new rider_policy_service_1.RiderPolicyService());
        await expect(service.getCurrentRiderProfile(currentUser)).resolves.toEqual({
            id: 'rider_1',
            phone: '0977777777',
            displayName: 'Ko Aung',
            vehicleType: 'bike',
            currentTownship: 'Kamaryut',
            status: client_1.RiderStatus.ACTIVE,
            accountStatus: client_1.UserStatus.ACTIVE,
            createdAt: '2026-04-19T00:00:00.000Z',
            updatedAt: '2026-04-19T00:00:00.000Z',
        });
    });
    it('returns a lightweight operational summary for later dispatch flows', async () => {
        const ridersService = {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeRider()),
        };
        const service = new rider_account_service_1.RiderAccountService(ridersService, {}, new rider_policy_service_1.RiderPolicyService());
        await expect(service.getOperationalSummary(currentUser)).resolves.toEqual({
            riderId: 'rider_1',
            status: client_1.RiderStatus.ACTIVE,
            accountStatus: client_1.UserStatus.ACTIVE,
            vehicleType: 'bike',
            currentTownship: 'Kamaryut',
            isDispatchEligible: true,
            isOnline: true,
            isAvailable: true,
            lastStatusChangedAt: '2026-04-19T00:05:00.000Z',
            updatedAt: '2026-04-19T00:05:00.000Z',
        });
    });
    it('rejects when the authenticated rider has no owned rider profile', async () => {
        const ridersService = {
            findOwnedByUserId: jest.fn().mockResolvedValue(null),
        };
        const service = new rider_account_service_1.RiderAccountService(ridersService, {}, new rider_policy_service_1.RiderPolicyService());
        await expect(service.getCurrentRiderProfile(currentUser)).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.notFound,
            }),
        });
    });
});
//# sourceMappingURL=rider-account.service.spec.js.map
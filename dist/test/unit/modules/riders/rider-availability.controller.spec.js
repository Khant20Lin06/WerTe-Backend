"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const rider_availability_controller_1 = require("../../../../src/modules/riders/controllers/rider-availability.controller");
describe('RiderAvailabilityController', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_rider_1',
        role: client_1.UserRole.RIDER,
        actorContext: {
            userId: 'usr_rider_1',
            phone: '0977777777',
            role: client_1.UserRole.RIDER,
            status: client_1.UserStatus.ACTIVE,
            riderId: 'rider_1',
        },
    });
    const availabilitySnapshot = {
        riderId: 'rider_1',
        status: client_1.RiderStatus.ACTIVE,
        accountStatus: client_1.UserStatus.ACTIVE,
        currentTownship: 'Kamaryut',
        isOnline: true,
        isAvailable: true,
        isDispatchEligible: true,
        lastStatusChangedAt: '2026-04-19T00:05:00.000Z',
        updatedAt: '2026-04-19T00:05:00.000Z',
    };
    it('delegates availability reads to the rider availability service', async () => {
        const riderAvailabilityService = {
            getCurrentAvailability: jest.fn().mockResolvedValue(availabilitySnapshot),
        };
        const controller = new rider_availability_controller_1.RiderAvailabilityController(riderAvailabilityService);
        const result = await controller.getCurrentAvailability(currentUser);
        expect(riderAvailabilityService.getCurrentAvailability).toHaveBeenCalledWith(currentUser);
        expect(result).toEqual(availabilitySnapshot);
    });
    it('delegates online requests to the rider availability service', async () => {
        const riderAvailabilityService = {
            markCurrentRiderOnline: jest.fn().mockResolvedValue(availabilitySnapshot),
        };
        const controller = new rider_availability_controller_1.RiderAvailabilityController(riderAvailabilityService);
        const result = await controller.markOnline(currentUser);
        expect(riderAvailabilityService.markCurrentRiderOnline).toHaveBeenCalledWith(currentUser);
        expect(result).toEqual(availabilitySnapshot);
    });
    it('delegates offline requests to the rider availability service', async () => {
        const riderAvailabilityService = {
            markCurrentRiderOffline: jest.fn().mockResolvedValue({
                ...availabilitySnapshot,
                isOnline: false,
                isAvailable: false,
                isDispatchEligible: false,
            }),
        };
        const controller = new rider_availability_controller_1.RiderAvailabilityController(riderAvailabilityService);
        const result = await controller.markOffline(currentUser);
        expect(riderAvailabilityService.markCurrentRiderOffline).toHaveBeenCalledWith(currentUser);
        expect(result).toMatchObject({
            isOnline: false,
            isAvailable: false,
            isDispatchEligible: false,
        });
    });
});
//# sourceMappingURL=rider-availability.controller.spec.js.map
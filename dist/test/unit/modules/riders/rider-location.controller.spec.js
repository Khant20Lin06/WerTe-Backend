"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const rider_location_controller_1 = require("../../../../src/modules/riders/controllers/rider-location.controller");
describe('RiderLocationController', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_rider_1',
        role: client_1.UserRole.RIDER,
        actorContext: {
            userId: 'usr_rider_1',
            phone: '0999999999',
            role: client_1.UserRole.RIDER,
            status: client_1.UserStatus.ACTIVE,
            riderId: 'rider_1',
        },
    });
    it('delegates rider location ingest requests to the rider location service', async () => {
        const riderLocationService = {
            ingestCurrentRiderLocation: jest.fn().mockResolvedValue({
                riderId: 'rider_1',
                deliveryId: 'delivery_1',
                latitude: '16.834',
                longitude: '96.176',
                heading: null,
                speed: null,
                accuracyMeters: null,
                recordedAt: '2026-04-19T10:12:00.000Z',
                duplicate: false,
            }),
        };
        const controller = new rider_location_controller_1.RiderLocationController(riderLocationService);
        const result = await controller.ingest(currentUser, {
            latitude: 16.834,
            longitude: 96.176,
            recordedAt: '2026-04-19T10:12:00.000Z',
        });
        expect(riderLocationService.ingestCurrentRiderLocation).toHaveBeenCalledWith(currentUser, {
            latitude: 16.834,
            longitude: 96.176,
            recordedAt: '2026-04-19T10:12:00.000Z',
        });
        expect(result).toMatchObject({
            riderId: 'rider_1',
            deliveryId: 'delivery_1',
            duplicate: false,
        });
    });
});
//# sourceMappingURL=rider-location.controller.spec.js.map
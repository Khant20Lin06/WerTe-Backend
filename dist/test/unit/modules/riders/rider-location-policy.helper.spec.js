"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const rider_location_policy_helper_1 = require("../../../../src/modules/riders/policies/rider-location-policy.helper");
function makeRider(overrides) {
    return {
        id: 'rider_1',
        userId: 'usr_rider_1',
        displayName: 'Ko Aung',
        vehicleType: 'bike',
        currentTownship: 'Pabedan',
        status: client_1.RiderStatus.ACTIVE,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        user: {
            id: 'usr_rider_1',
            phone: '0999999999',
            role: client_1.UserRole.RIDER,
            status: client_1.UserStatus.ACTIVE,
        },
        availability: {
            isOnline: true,
            isAvailable: true,
            lastStatusChangedAt: new Date('2026-04-19T10:00:00.000Z'),
            updatedAt: new Date('2026-04-19T10:00:00.000Z'),
        },
        ...overrides,
    };
}
describe('rider location policy helper', () => {
    it('allows location ingest for active riders that are online or actively delivering', () => {
        expect((0, rider_location_policy_helper_1.canIngestRiderLocation)(makeRider(), false)).toBe(true);
        expect((0, rider_location_policy_helper_1.canIngestRiderLocation)(makeRider({
            availability: {
                isOnline: false,
                isAvailable: false,
                lastStatusChangedAt: new Date('2026-04-19T10:00:00.000Z'),
                updatedAt: new Date('2026-04-19T10:00:00.000Z'),
            },
        }), true)).toBe(true);
        expect((0, rider_location_policy_helper_1.canIngestRiderLocation)(makeRider({
            availability: {
                isOnline: false,
                isAvailable: false,
                lastStatusChangedAt: new Date('2026-04-19T10:00:00.000Z'),
                updatedAt: new Date('2026-04-19T10:00:00.000Z'),
            },
        }), false)).toBe(false);
        expect((0, rider_location_policy_helper_1.canIngestRiderLocation)(makeRider({
            status: client_1.RiderStatus.SUSPENDED,
        }), true)).toBe(false);
    });
    it('detects duplicate rider locations only when every tracked field matches', () => {
        const currentLocation = {
            riderId: 'rider_1',
            deliveryId: 'delivery_1',
            latitude: { toString: () => '16.834' },
            longitude: { toString: () => '96.176' },
            heading: null,
            speed: null,
            accuracyMeters: null,
            recordedAt: new Date('2026-04-19T10:12:00.000Z'),
        };
        expect((0, rider_location_policy_helper_1.isDuplicateRiderLocation)(currentLocation, {
            deliveryId: 'delivery_1',
            latitude: 16.834,
            longitude: 96.176,
            heading: null,
            speed: null,
            accuracyMeters: null,
            recordedAt: new Date('2026-04-19T10:12:00.000Z'),
        })).toBe(true);
        expect((0, rider_location_policy_helper_1.isDuplicateRiderLocation)(currentLocation, {
            deliveryId: 'delivery_1',
            latitude: 16.834,
            longitude: 96.177,
            heading: null,
            speed: null,
            accuracyMeters: null,
            recordedAt: new Date('2026-04-19T10:12:00.000Z'),
        })).toBe(false);
    });
});
//# sourceMappingURL=rider-location-policy.helper.spec.js.map
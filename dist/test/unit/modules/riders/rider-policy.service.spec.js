"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const rider_policy_service_1 = require("../../../../src/modules/riders/policies/rider-policy.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('RiderPolicyService', () => {
    const service = new rider_policy_service_1.RiderPolicyService();
    const rider = {
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
    };
    it('allows the owning rider to access the rider profile', () => {
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
        expect(service.canAccessRider(currentUser, rider)).toBe(true);
    });
    it('denies access when the actor is not the owning rider', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_rider_2',
            role: client_1.UserRole.RIDER,
            actorContext: {
                userId: 'usr_rider_2',
                phone: '0970000000',
                role: client_1.UserRole.RIDER,
                status: client_1.UserStatus.ACTIVE,
                riderId: 'rider_1',
            },
        });
        expect(service.canAccessRider(currentUser, rider)).toBe(false);
    });
});
//# sourceMappingURL=rider-policy.service.spec.js.map
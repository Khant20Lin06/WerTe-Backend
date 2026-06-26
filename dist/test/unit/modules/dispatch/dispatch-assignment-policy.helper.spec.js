"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dispatch_assignment_policy_helper_1 = require("../../../../src/modules/dispatch/policies/dispatch-assignment-policy.helper");
describe('dispatch assignment policy helper', () => {
    it('returns true only for active, online, available riders', () => {
        expect((0, dispatch_assignment_policy_helper_1.isDispatchEligibleRider)({
            status: client_1.RiderStatus.ACTIVE,
            user: {
                status: client_1.UserStatus.ACTIVE,
            },
            availability: {
                isOnline: true,
                isAvailable: true,
            },
        })).toBe(true);
        expect((0, dispatch_assignment_policy_helper_1.isDispatchEligibleRider)({
            status: client_1.RiderStatus.SUSPENDED,
            user: {
                status: client_1.UserStatus.ACTIVE,
            },
            availability: {
                isOnline: true,
                isAvailable: true,
            },
        })).toBe(false);
        expect((0, dispatch_assignment_policy_helper_1.isDispatchEligibleRider)({
            status: client_1.RiderStatus.ACTIVE,
            user: {
                status: client_1.UserStatus.SUSPENDED,
            },
            availability: {
                isOnline: true,
                isAvailable: true,
            },
        })).toBe(false);
        expect((0, dispatch_assignment_policy_helper_1.isDispatchEligibleRider)({
            status: client_1.RiderStatus.ACTIVE,
            user: {
                status: client_1.UserStatus.ACTIVE,
            },
            availability: {
                isOnline: true,
                isAvailable: false,
            },
        })).toBe(false);
        expect((0, dispatch_assignment_policy_helper_1.isDispatchEligibleRider)({
            status: client_1.RiderStatus.ACTIVE,
            user: {
                status: client_1.UserStatus.ACTIVE,
            },
            availability: null,
        })).toBe(false);
    });
});
//# sourceMappingURL=dispatch-assignment-policy.helper.spec.js.map
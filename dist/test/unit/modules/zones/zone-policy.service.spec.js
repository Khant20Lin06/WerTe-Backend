"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const zone_policy_service_1 = require("../../../../src/modules/zones/policies/zone-policy.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('ZonePolicyService', () => {
    const service = new zone_policy_service_1.ZonePolicyService();
    it('allows admins to manage zones', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_admin_1',
            role: client_1.UserRole.ADMIN,
            actorContext: {
                userId: 'usr_admin_1',
                phone: '09111111111',
                role: client_1.UserRole.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        expect(service.canManageZones(currentUser)).toBe(true);
    });
    it('allows merchants to read active zones', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_merchant_1',
            role: client_1.UserRole.MERCHANT,
            actorContext: {
                userId: 'usr_merchant_1',
                phone: '0999999999',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
                merchantId: 'merchant_1',
            },
        });
        expect(service.canReadActiveZones(currentUser)).toBe(true);
    });
    it('denies customers from reading active zone management data', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_customer_1',
            role: client_1.UserRole.CUSTOMER,
            actorContext: {
                userId: 'usr_customer_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_1',
            },
        });
        expect(service.canReadActiveZones(currentUser)).toBe(false);
    });
});
//# sourceMappingURL=zone-policy.service.spec.js.map
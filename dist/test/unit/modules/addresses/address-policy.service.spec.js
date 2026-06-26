"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const address_policy_service_1 = require("../../../../src/modules/addresses/policies/address-policy.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('AddressPolicyService', () => {
    const service = new address_policy_service_1.AddressPolicyService();
    const profile = {
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
    };
    const address = {
        id: 'addr_1',
        customerProfileId: 'cust_prof_1',
        label: 'Home',
        line1: 'No. 1, Main Road',
        line2: null,
        landmark: null,
        township: 'Thingangyun',
        city: 'Yangon',
        postalCode: null,
        deliveryInstructions: null,
        isDefault: true,
        latitude: new client_1.Prisma.Decimal('16.834'),
        longitude: new client_1.Prisma.Decimal('96.176'),
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        customerProfile: {
            id: 'cust_prof_1',
            userId: 'usr_1',
            user: {
                id: 'usr_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
            },
        },
    };
    it('allows the owning customer to list addresses', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            role: client_1.UserRole.CUSTOMER,
            actorContext: {
                userId: 'usr_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_1',
            },
        });
        expect(service.canListAddresses(currentUser, profile)).toBe(true);
    });
    it('denies managing addresses outside the actor scope', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            role: client_1.UserRole.CUSTOMER,
            actorContext: {
                userId: 'usr_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_2',
            },
        });
        expect(service.canManageAddress(currentUser, address)).toBe(false);
    });
});
//# sourceMappingURL=address-policy.service.spec.js.map
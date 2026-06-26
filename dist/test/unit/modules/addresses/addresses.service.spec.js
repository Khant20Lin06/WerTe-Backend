"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const addresses_service_1 = require("../../../../src/modules/addresses/services/addresses.service");
describe('AddressesService', () => {
    const makeAddress = (overrides) => ({
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
        latitude: new client_1.Prisma.Decimal('16.8340'),
        longitude: new client_1.Prisma.Decimal('96.1760'),
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
        ...overrides,
    });
    it('builds ownership details for address reads', () => {
        const repository = {};
        const service = new addresses_service_1.AddressesService(repository);
        const ownership = service.buildOwnership(makeAddress());
        expect(ownership).toEqual({
            addressId: 'addr_1',
            customerProfileId: 'cust_prof_1',
            userId: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            userStatus: client_1.UserStatus.ACTIVE,
            label: 'Home',
            line1: 'No. 1, Main Road',
            township: 'Thingangyun',
            city: 'Yangon',
            isDefault: true,
        });
    });
    it('returns null when the address does not belong to the requesting user', async () => {
        const repository = {
            findById: jest.fn().mockResolvedValue(makeAddress()),
        };
        const service = new addresses_service_1.AddressesService(repository);
        const address = await service.findOwnedByUserId('usr_2', 'addr_1');
        expect(address).toBeNull();
    });
});
//# sourceMappingURL=addresses.service.spec.js.map
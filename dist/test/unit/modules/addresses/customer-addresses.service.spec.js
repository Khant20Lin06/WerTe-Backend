"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const address_policy_service_1 = require("../../../../src/modules/addresses/policies/address-policy.service");
const customer_addresses_service_1 = require("../../../../src/modules/addresses/services/customer-addresses.service");
describe('CustomerAddressesService', () => {
    const currentUser = {
        userId: 'usr_1',
        sessionId: 'session_1',
        role: client_1.UserRole.CUSTOMER,
        tokenType: 'access',
        actorContext: {
            userId: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
            customerProfileId: 'cust_prof_1',
        },
    };
    const makeProfile = (overrides) => ({
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
        ...overrides,
    });
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
    const prismaService = {
        runInTransaction: jest.fn(async (callback) => callback({})),
    };
    it('promotes the first created address to default automatically', async () => {
        const addressesRepository = {
            countByCustomerProfileId: jest.fn().mockResolvedValue(0),
            clearDefaultByCustomerProfileId: jest.fn().mockResolvedValue({ count: 0 }),
            create: jest
                .fn()
                .mockImplementation(async (payload) => makeAddress(payload)),
        };
        const service = new customer_addresses_service_1.CustomerAddressesService(prismaService, {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
        }, addressesRepository, new address_policy_service_1.AddressPolicyService());
        const result = await service.createCurrentCustomerAddress(currentUser, {
            label: 'Home',
            line1: 'No. 1, Main Road',
            township: 'Thingangyun',
            latitude: 16.834,
            longitude: 96.176,
        });
        expect(addressesRepository.clearDefaultByCustomerProfileId).toHaveBeenCalled();
        expect(result.isDefault).toBe(true);
    });
    it('rejects attempts to unset the current default address directly', async () => {
        const service = new customer_addresses_service_1.CustomerAddressesService(prismaService, {}, {
            findById: jest.fn().mockResolvedValue(makeAddress()),
        }, new address_policy_service_1.AddressPolicyService());
        await expect(service.updateCurrentCustomerAddress(currentUser, 'addr_1', {
            isDefault: false,
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
    it('promotes another address when deleting the default one', async () => {
        const addressesRepository = {
            findById: jest.fn().mockResolvedValue(makeAddress()),
            delete: jest.fn().mockResolvedValue(makeAddress()),
            findLatestByCustomerProfileId: jest.fn().mockResolvedValue(makeAddress({
                id: 'addr_2',
                isDefault: false,
                createdAt: new Date('2026-04-20T00:00:00.000Z'),
                updatedAt: new Date('2026-04-20T00:00:00.000Z'),
            })),
            update: jest.fn().mockResolvedValue(makeAddress({
                id: 'addr_2',
                isDefault: true,
                createdAt: new Date('2026-04-20T00:00:00.000Z'),
                updatedAt: new Date('2026-04-20T00:00:00.000Z'),
            })),
        };
        const service = new customer_addresses_service_1.CustomerAddressesService(prismaService, {}, addressesRepository, new address_policy_service_1.AddressPolicyService());
        const result = await service.deleteCurrentCustomerAddress(currentUser, 'addr_1');
        expect(addressesRepository.findLatestByCustomerProfileId).toHaveBeenCalledWith('cust_prof_1', expect.anything());
        expect(addressesRepository.update).toHaveBeenCalledWith('addr_2', {
            isDefault: true,
        }, expect.anything());
        expect(result).toEqual({
            deletedAddressId: 'addr_1',
        });
    });
});
//# sourceMappingURL=customer-addresses.service.spec.js.map
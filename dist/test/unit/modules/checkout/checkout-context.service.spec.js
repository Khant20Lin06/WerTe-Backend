"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const checkout_context_service_1 = require("../../../../src/modules/checkout/services/checkout-context.service");
function makeCustomerProfile(overrides) {
    return {
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
    };
}
function makeAddress(overrides) {
    return {
        id: 'addr_1',
        customerProfileId: 'cust_prof_1',
        label: 'Home',
        line1: 'No. 1, Main Road',
        line2: null,
        landmark: null,
        township: 'Botahtaung',
        city: 'Yangon',
        postalCode: null,
        deliveryInstructions: 'Call before arrival',
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
        ...overrides,
    };
}
function makeBranch(overrides) {
    return {
        id: 'branch_1',
        merchantId: 'merchant_1',
        name: 'Downtown Branch',
        contactPhone: null,
        line1: 'No. 1',
        township: 'Botahtaung',
        latitude: null,
        longitude: null,
        storeType: 'restaurant',
        primaryStoreTypeId: 'store_type_restaurant',
        status: client_1.BranchStatus.ACTIVE,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        merchant: {
            id: 'merchant_1',
            userId: 'usr_merchant_1',
            name: 'Merchant One',
            storeType: 'restaurant',
            status: client_1.MerchantStatus.ACTIVE,
            user: {
                id: 'usr_merchant_1',
                phone: '0999999999',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
            },
        },
        operatingHours: null,
        branchZones: [],
        staffAssignments: [],
        ...overrides,
    };
}
function makeCart(overrides) {
    return {
        cartId: 'cart_1',
        customerProfileId: 'cust_prof_1',
        branchId: 'branch_1',
        merchantId: 'merchant_1',
        branchName: 'Downtown Branch',
        branchStatus: client_1.BranchStatus.ACTIVE,
        merchantStatus: client_1.MerchantStatus.ACTIVE,
        status: client_1.CartStatus.ACTIVE,
        totalQuantity: 1,
        subtotalAmount: '3000',
        totalAmount: '3000',
        isEmpty: false,
        items: [],
        ...overrides,
    };
}
describe('CheckoutContextService', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        actorContext: {
            userId: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
            customerProfileId: 'cust_prof_1',
        },
    });
    it('resolves a validated checkout context using an explicitly selected address', async () => {
        const customerProfilesService = {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeCustomerProfile()),
        };
        const addressesService = {
            findById: jest.fn().mockResolvedValue(makeAddress()),
        };
        const branchesService = {
            findById: jest.fn().mockResolvedValue(makeBranch()),
        };
        const cartQueryService = {
            getOwnedActiveCartAggregateOrEmpty: jest.fn().mockResolvedValue(makeCart()),
        };
        const checkoutValidationService = {
            assertCartReadyForCheckout: jest.fn().mockResolvedValue(undefined),
        };
        const service = new checkout_context_service_1.CheckoutContextService(customerProfilesService, addressesService, branchesService, cartQueryService, checkoutValidationService);
        const result = await service.getValidatedCurrentCustomerCheckoutContext(currentUser, {
            branchId: 'branch_1',
            addressId: 'addr_1',
        });
        expect(addressesService.findById).toHaveBeenCalledWith('addr_1');
        expect(checkoutValidationService.assertCartReadyForCheckout).toHaveBeenCalledWith(expect.objectContaining({ id: 'branch_1' }), expect.objectContaining({ cartId: 'cart_1' }));
        expect(result).toMatchObject({
            currencyCode: 'MMK',
            customer: {
                customerProfileId: 'cust_prof_1',
            },
            address: {
                addressId: 'addr_1',
            },
            branch: {
                branchId: 'branch_1',
            },
            cart: {
                cartId: 'cart_1',
            },
        });
    });
    it('falls back to the default customer address when no address id is provided', async () => {
        const customerProfilesService = {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeCustomerProfile()),
        };
        const addressesService = {
            findDefaultByCustomerProfileId: jest.fn().mockResolvedValue(makeAddress()),
        };
        const branchesService = {
            findById: jest.fn().mockResolvedValue(makeBranch()),
        };
        const cartQueryService = {
            getOwnedActiveCartAggregateOrEmpty: jest.fn().mockResolvedValue(makeCart()),
        };
        const checkoutValidationService = {
            assertCartReadyForCheckout: jest.fn().mockResolvedValue(undefined),
        };
        const service = new checkout_context_service_1.CheckoutContextService(customerProfilesService, addressesService, branchesService, cartQueryService, checkoutValidationService);
        const result = await service.getValidatedCurrentCustomerCheckoutContext(currentUser, {
            branchId: 'branch_1',
        });
        expect(addressesService.findDefaultByCustomerProfileId).toHaveBeenCalledWith('cust_prof_1');
        expect(result.address.addressId).toBe('addr_1');
    });
    it('rejects checkout context resolution when no default address exists', async () => {
        const service = new checkout_context_service_1.CheckoutContextService({
            findOwnedByUserId: jest.fn().mockResolvedValue(makeCustomerProfile()),
        }, {
            findDefaultByCustomerProfileId: jest.fn().mockResolvedValue(null),
        }, {}, {}, {});
        await expect(service.getValidatedCurrentCustomerCheckoutContext(currentUser, {
            branchId: 'branch_1',
        })).rejects.toMatchObject({
            status: 422,
        });
    });
    it('rejects checkout context resolution when the requested address belongs to another customer profile', async () => {
        const service = new checkout_context_service_1.CheckoutContextService({
            findOwnedByUserId: jest.fn().mockResolvedValue(makeCustomerProfile()),
        }, {
            findById: jest.fn().mockResolvedValue(makeAddress({
                customerProfile: {
                    id: 'cust_prof_2',
                    userId: 'usr_2',
                    user: {
                        id: 'usr_2',
                        phone: '0991111111',
                        role: client_1.UserRole.CUSTOMER,
                        status: client_1.UserStatus.ACTIVE,
                    },
                },
            })),
        }, {}, {}, {});
        await expect(service.getValidatedCurrentCustomerCheckoutContext(currentUser, {
            branchId: 'branch_1',
            addressId: 'addr_2',
        })).rejects.toMatchObject({
            status: 404,
        });
    });
    it('rejects checkout context resolution when the branch does not exist', async () => {
        const service = new checkout_context_service_1.CheckoutContextService({
            findOwnedByUserId: jest.fn().mockResolvedValue(makeCustomerProfile()),
        }, {
            findDefaultByCustomerProfileId: jest.fn().mockResolvedValue(makeAddress()),
        }, {
            findById: jest.fn().mockResolvedValue(null),
        }, {
            getOwnedActiveCartAggregateOrEmpty: jest.fn().mockResolvedValue(makeCart()),
        }, {});
        await expect(service.getValidatedCurrentCustomerCheckoutContext(currentUser, {
            branchId: 'branch_missing',
        })).rejects.toMatchObject({
            status: 404,
        });
    });
});
//# sourceMappingURL=checkout-context.service.spec.js.map
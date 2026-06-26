"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const carts_service_1 = require("../../../../src/modules/carts/services/carts.service");
describe('CartsService', () => {
    const makeCart = (overrides) => ({
        id: 'cart_1',
        customerProfileId: 'cust_prof_1',
        branchId: 'branch_1',
        status: client_1.CartStatus.ACTIVE,
        totalQuantity: 2,
        subtotalAmount: new client_1.Prisma.Decimal('5500'),
        totalAmount: new client_1.Prisma.Decimal('5500'),
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
        branch: {
            id: 'branch_1',
            merchantId: 'merchant_1',
            status: client_1.BranchStatus.ACTIVE,
            merchant: {
                id: 'merchant_1',
                status: client_1.MerchantStatus.ACTIVE,
                user: {
                    id: 'usr_merchant_1',
                    phone: '0999999999',
                    role: client_1.UserRole.MERCHANT,
                    status: client_1.UserStatus.ACTIVE,
                },
            },
        },
        ...overrides,
    });
    const makeCartItem = (overrides) => ({
        id: 'cart_item_1',
        cartId: 'cart_1',
        menuItemId: 'item_1',
        quantity: 2,
        unitPriceSnapshot: new client_1.Prisma.Decimal('2750'),
        lineTotal: new client_1.Prisma.Decimal('5500'),
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        cart: {
            id: 'cart_1',
            customerProfileId: 'cust_prof_1',
            branchId: 'branch_1',
            status: client_1.CartStatus.ACTIVE,
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
            branch: {
                id: 'branch_1',
                merchantId: 'merchant_1',
                status: client_1.BranchStatus.ACTIVE,
                merchant: {
                    id: 'merchant_1',
                    status: client_1.MerchantStatus.ACTIVE,
                    user: {
                        id: 'usr_merchant_1',
                        phone: '0999999999',
                        role: client_1.UserRole.MERCHANT,
                        status: client_1.UserStatus.ACTIVE,
                    },
                },
            },
        },
        menuItem: {
            id: 'item_1',
            branchId: 'branch_1',
            categoryId: 'cat_1',
            name: 'Mohinga',
            basePrice: new client_1.Prisma.Decimal('2500'),
            isAvailable: true,
            branch: {
                id: 'branch_1',
                merchantId: 'merchant_1',
                status: client_1.BranchStatus.ACTIVE,
                merchant: {
                    id: 'merchant_1',
                    status: client_1.MerchantStatus.ACTIVE,
                    user: {
                        id: 'usr_merchant_1',
                        phone: '0999999999',
                        role: client_1.UserRole.MERCHANT,
                        status: client_1.UserStatus.ACTIVE,
                    },
                },
            },
        },
        ...overrides,
    });
    const makeCartItemOption = (overrides) => ({
        id: 'cart_item_option_1',
        cartItemId: 'cart_item_1',
        itemOptionId: 'option_1',
        nameSnapshot: 'Thin rice noodle',
        priceDeltaSnapshot: new client_1.Prisma.Decimal('250'),
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        cartItem: {
            id: 'cart_item_1',
            cartId: 'cart_1',
            cart: {
                id: 'cart_1',
                customerProfileId: 'cust_prof_1',
                branchId: 'branch_1',
                status: client_1.CartStatus.ACTIVE,
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
                branch: {
                    id: 'branch_1',
                    merchantId: 'merchant_1',
                    status: client_1.BranchStatus.ACTIVE,
                    merchant: {
                        id: 'merchant_1',
                        status: client_1.MerchantStatus.ACTIVE,
                        user: {
                            id: 'usr_merchant_1',
                            phone: '0999999999',
                            role: client_1.UserRole.MERCHANT,
                            status: client_1.UserStatus.ACTIVE,
                        },
                    },
                },
            },
        },
        itemOption: {
            id: 'option_1',
            name: 'Thin rice noodle',
            isActive: true,
            group: {
                id: 'group_1',
                name: 'Choose noodle type',
                isActive: true,
                menuItem: {
                    id: 'item_1',
                    branchId: 'branch_1',
                    name: 'Mohinga',
                    isAvailable: true,
                    branch: {
                        id: 'branch_1',
                        merchantId: 'merchant_1',
                        status: client_1.BranchStatus.ACTIVE,
                        merchant: {
                            id: 'merchant_1',
                            status: client_1.MerchantStatus.ACTIVE,
                            user: {
                                id: 'usr_merchant_1',
                                phone: '0999999999',
                                role: client_1.UserRole.MERCHANT,
                                status: client_1.UserStatus.ACTIVE,
                            },
                        },
                    },
                },
            },
        },
        ...overrides,
    });
    it('finds an active cart owned by a user for a branch', async () => {
        const cartsRepository = {
            findActiveCartByUserIdAndBranchId: jest.fn().mockResolvedValue(makeCart()),
        };
        const service = new carts_service_1.CartsService(cartsRepository);
        const result = await service.findActiveOwnedByUserIdAndBranchId('usr_1', 'branch_1');
        expect(cartsRepository.findActiveCartByUserIdAndBranchId).toHaveBeenCalledWith('usr_1', 'branch_1');
        expect(result?.id).toBe('cart_1');
    });
    it('returns null when a cart item is not owned by the user', async () => {
        const cartsRepository = {
            findCartItemById: jest.fn().mockResolvedValue(makeCartItem({
                cart: {
                    id: 'cart_2',
                    customerProfileId: 'cust_prof_2',
                    branchId: 'branch_1',
                    status: client_1.CartStatus.ACTIVE,
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
                    branch: {
                        id: 'branch_1',
                        merchantId: 'merchant_1',
                        status: client_1.BranchStatus.ACTIVE,
                        merchant: {
                            id: 'merchant_1',
                            status: client_1.MerchantStatus.ACTIVE,
                            user: {
                                id: 'usr_merchant_1',
                                phone: '0999999999',
                                role: client_1.UserRole.MERCHANT,
                                status: client_1.UserStatus.ACTIVE,
                            },
                        },
                    },
                },
            })),
        };
        const service = new carts_service_1.CartsService(cartsRepository);
        const result = await service.findOwnedCartItemByUserId('usr_1', 'cart_item_1');
        expect(result).toBeNull();
    });
    it('builds cart ownership entities with serialized money values', () => {
        const service = new carts_service_1.CartsService({});
        expect(service.buildCartOwnership(makeCart())).toEqual({
            cartId: 'cart_1',
            customerProfileId: 'cust_prof_1',
            userId: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            userStatus: client_1.UserStatus.ACTIVE,
            branchId: 'branch_1',
            merchantId: 'merchant_1',
            merchantStatus: client_1.MerchantStatus.ACTIVE,
            branchStatus: client_1.BranchStatus.ACTIVE,
            status: client_1.CartStatus.ACTIVE,
            totalQuantity: 2,
            subtotalAmount: '5500',
            totalAmount: '5500',
        });
    });
    it('builds cart item option ownership entities with serialized price delta snapshots', () => {
        const service = new carts_service_1.CartsService({});
        expect(service.buildCartItemOptionOwnership(makeCartItemOption())).toEqual({
            cartItemOptionId: 'cart_item_option_1',
            cartItemId: 'cart_item_1',
            cartId: 'cart_1',
            customerProfileId: 'cust_prof_1',
            userId: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            userStatus: client_1.UserStatus.ACTIVE,
            branchId: 'branch_1',
            merchantId: 'merchant_1',
            merchantStatus: client_1.MerchantStatus.ACTIVE,
            branchStatus: client_1.BranchStatus.ACTIVE,
            cartStatus: client_1.CartStatus.ACTIVE,
            itemOptionId: 'option_1',
            itemOptionName: 'Thin rice noodle',
            itemOptionIsActive: true,
            optionGroupId: 'group_1',
            optionGroupName: 'Choose noodle type',
            optionGroupIsActive: true,
            menuItemId: 'item_1',
            menuItemName: 'Mohinga',
            menuItemIsAvailable: true,
            nameSnapshot: 'Thin rice noodle',
            priceDeltaSnapshot: '250',
        });
    });
});
//# sourceMappingURL=carts.service.spec.js.map
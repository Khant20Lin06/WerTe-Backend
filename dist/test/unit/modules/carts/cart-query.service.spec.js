"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const cart_query_service_1 = require("../../../../src/modules/carts/services/cart-query.service");
describe('CartQueryService', () => {
    const makeCartAggregate = (overrides) => ({
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
        },
        branch: {
            id: 'branch_1',
            merchantId: 'merchant_1',
            name: 'Downtown Branch',
            status: client_1.BranchStatus.ACTIVE,
            merchant: {
                id: 'merchant_1',
                status: client_1.MerchantStatus.ACTIVE,
            },
        },
        items: [
            {
                id: 'cart_item_1',
                cartId: 'cart_1',
                menuItemId: 'item_1',
                quantity: 2,
                unitPriceSnapshot: new client_1.Prisma.Decimal('2750'),
                lineTotal: new client_1.Prisma.Decimal('5500'),
                createdAt: new Date('2026-04-19T00:00:00.000Z'),
                updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                menuItem: {
                    id: 'item_1',
                    branchId: 'branch_1',
                    categoryId: 'cat_1',
                    name: 'Mohinga',
                    description: 'Signature breakfast item',
                    imageUrl: 'https://cdn.example.com/menu/mohinga.png',
                    basePrice: new client_1.Prisma.Decimal('2500'),
                    isAvailable: true,
                },
                selectedOptions: [
                    {
                        id: 'cart_item_option_1',
                        cartItemId: 'cart_item_1',
                        itemOptionId: 'option_1',
                        nameSnapshot: 'Thin rice noodle',
                        priceDeltaSnapshot: new client_1.Prisma.Decimal('250'),
                        createdAt: new Date('2026-04-19T00:00:00.000Z'),
                        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                        itemOption: {
                            id: 'option_1',
                            name: 'Thin rice noodle',
                            isActive: true,
                            group: {
                                id: 'group_1',
                                name: 'Choose noodle type',
                                isActive: true,
                            },
                        },
                    },
                ],
            },
        ],
        ...overrides,
    });
    it('returns an empty cart contract when no active cart exists for the branch', async () => {
        const cartsRepository = {
            findActiveCartAggregateByUserIdAndBranchId: jest.fn().mockResolvedValue(null),
        };
        const service = new cart_query_service_1.CartQueryService(cartsRepository);
        const result = await service.getOwnedActiveCartAggregateOrEmpty('usr_1', 'branch_1');
        expect(result).toEqual({
            cartId: null,
            customerProfileId: null,
            branchId: 'branch_1',
            merchantId: null,
            branchName: null,
            branchStatus: null,
            merchantStatus: null,
            status: client_1.CartStatus.ACTIVE,
            totalQuantity: 0,
            subtotalAmount: '0',
            totalAmount: '0',
            isEmpty: true,
            items: [],
        });
    });
    it('builds a nested aggregate for an active cart with selected option snapshots', async () => {
        const cartsRepository = {
            findActiveCartAggregateByUserIdAndBranchId: jest
                .fn()
                .mockResolvedValue(makeCartAggregate()),
        };
        const service = new cart_query_service_1.CartQueryService(cartsRepository);
        const result = await service.getOwnedActiveCartAggregateOrEmpty('usr_1', 'branch_1');
        expect(result).toEqual({
            cartId: 'cart_1',
            customerProfileId: 'cust_prof_1',
            branchId: 'branch_1',
            merchantId: 'merchant_1',
            branchName: 'Downtown Branch',
            branchStatus: client_1.BranchStatus.ACTIVE,
            merchantStatus: client_1.MerchantStatus.ACTIVE,
            status: client_1.CartStatus.ACTIVE,
            totalQuantity: 2,
            subtotalAmount: '5500',
            totalAmount: '5500',
            isEmpty: false,
            items: [
                {
                    cartItemId: 'cart_item_1',
                    menuItemId: 'item_1',
                    branchId: 'branch_1',
                    categoryId: 'cat_1',
                    menuItemName: 'Mohinga',
                    menuItemDescription: 'Signature breakfast item',
                    menuItemImageUrl: 'https://cdn.example.com/menu/mohinga.png',
                    menuItemBasePrice: '2500',
                    menuItemIsAvailable: true,
                    quantity: 2,
                    unitPriceSnapshot: '2750',
                    lineTotal: '5500',
                    selectedOptions: [
                        {
                            cartItemOptionId: 'cart_item_option_1',
                            itemOptionId: 'option_1',
                            itemOptionName: 'Thin rice noodle',
                            itemOptionIsActive: true,
                            optionGroupId: 'group_1',
                            optionGroupName: 'Choose noodle type',
                            optionGroupIsActive: true,
                            nameSnapshot: 'Thin rice noodle',
                            priceDeltaSnapshot: '250',
                        },
                    ],
                },
            ],
        });
    });
    it('returns null for owned-cart aggregate lookup when the user does not own the cart', async () => {
        const cartsRepository = {
            findCartAggregateById: jest.fn().mockResolvedValue(makeCartAggregate({
                customerProfile: {
                    id: 'cust_prof_2',
                    userId: 'usr_2',
                },
            })),
        };
        const service = new cart_query_service_1.CartQueryService(cartsRepository);
        const result = await service.findOwnedCartAggregateByUserId('usr_1', 'cart_1');
        expect(result).toBeNull();
    });
});
//# sourceMappingURL=cart-query.service.spec.js.map
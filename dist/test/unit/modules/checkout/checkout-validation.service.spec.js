"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const checkout_validation_service_1 = require("../../../../src/modules/checkout/services/checkout-validation.service");
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
        branchZones: [],
        operatingHours: null,
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
        items: [
            {
                cartItemId: 'cart_item_1',
                menuItemId: 'item_1',
                branchId: 'branch_1',
                categoryId: 'cat_1',
                menuItemName: 'Mohinga',
                menuItemDescription: 'Breakfast item',
                menuItemImageUrl: null,
                menuItemBasePrice: '2500',
                menuItemIsAvailable: true,
                quantity: 1,
                unitPriceSnapshot: '3000',
                lineTotal: '3000',
                selectedOptions: [
                    {
                        cartItemOptionId: 'cart_item_option_1',
                        itemOptionId: 'option_1',
                        itemOptionName: 'Extra fish cake',
                        itemOptionIsActive: true,
                        optionGroupId: 'group_1',
                        optionGroupName: 'Choose extras',
                        optionGroupIsActive: true,
                        nameSnapshot: 'Extra fish cake',
                        priceDeltaSnapshot: '500',
                    },
                ],
            },
        ],
        ...overrides,
    };
}
describe('CheckoutValidationService', () => {
    const makeMenusService = (overrides) => ({
        findItemById: jest.fn().mockResolvedValue({
            id: 'item_1',
            isAvailable: true,
            isStockTracked: false,
            stockQuantity: null,
            branch: {
                id: 'branch_1',
            },
        }),
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([
            {
                id: 'group_1',
                kind: client_1.ItemOptionGroupKind.ADD_ON,
                minSelect: 1,
                maxSelect: 1,
                isActive: true,
            },
        ]),
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
            {
                id: 'option_1',
                isActive: true,
                isStockTracked: false,
                stockQuantity: null,
                group: {
                    id: 'group_1',
                    kind: client_1.ItemOptionGroupKind.ADD_ON,
                },
            },
        ]),
        findActiveVariantCombinationByMenuItemIdAndOptionIds: jest
            .fn()
            .mockResolvedValue(null),
        ...overrides,
    });
    it('accepts an orderable cart whose selection state still matches active menu rules', async () => {
        const menusService = makeMenusService();
        const service = new checkout_validation_service_1.CheckoutValidationService(menusService);
        await expect(service.assertCartReadyForCheckout(makeBranch(), makeCart())).resolves.toBeUndefined();
    });
    it('rejects checkout when the branch is inactive', async () => {
        const service = new checkout_validation_service_1.CheckoutValidationService({});
        await expect(service.assertCartReadyForCheckout(makeBranch({ status: client_1.BranchStatus.INACTIVE }), makeCart({ items: [] }))).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
    it('rejects checkout when the merchant is inactive', async () => {
        const service = new checkout_validation_service_1.CheckoutValidationService({});
        await expect(service.assertCartReadyForCheckout(makeBranch({
            merchant: {
                ...makeBranch().merchant,
                status: client_1.MerchantStatus.SUSPENDED,
            },
        }), makeCart({ items: [] }))).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
    it('rejects checkout when the active cart is empty', async () => {
        const service = new checkout_validation_service_1.CheckoutValidationService({});
        await expect(service.assertCartReadyForCheckout(makeBranch(), makeCart({
            cartId: null,
            isEmpty: true,
            totalQuantity: 0,
            subtotalAmount: '0',
            totalAmount: '0',
            items: [],
        }))).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
    it('rejects checkout when a cart item is no longer available', async () => {
        const service = new checkout_validation_service_1.CheckoutValidationService({});
        await expect(service.assertCartReadyForCheckout(makeBranch(), makeCart({
            items: [
                {
                    ...makeCart().items[0],
                    menuItemIsAvailable: false,
                },
            ],
        }))).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
    it('rejects checkout when selected options no longer satisfy the active option group rules', async () => {
        const menusService = makeMenusService({
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([]),
        });
        const service = new checkout_validation_service_1.CheckoutValidationService(menusService);
        await expect(service.assertCartReadyForCheckout(makeBranch(), makeCart())).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
    it('rejects checkout when a tracked menu item no longer has enough stock', async () => {
        const service = new checkout_validation_service_1.CheckoutValidationService(makeMenusService({
            findItemById: jest.fn().mockResolvedValue({
                id: 'item_1',
                isAvailable: true,
                isStockTracked: true,
                stockQuantity: 1,
                branch: {
                    id: 'branch_1',
                },
            }),
        }));
        await expect(service.assertCartReadyForCheckout(makeBranch(), makeCart({
            items: [
                {
                    ...makeCart().items[0],
                    quantity: 2,
                },
            ],
        }))).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: expect.objectContaining({
                    menuItemId: 'item_1',
                    stockQuantity: 1,
                    requestedQuantity: 2,
                }),
            }),
        });
    });
    it('rejects checkout when a tracked selected option no longer has enough stock', async () => {
        const service = new checkout_validation_service_1.CheckoutValidationService(makeMenusService({
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
                {
                    id: 'option_1',
                    isActive: true,
                    isStockTracked: true,
                    stockQuantity: 0,
                    group: {
                        id: 'group_1',
                    },
                },
            ]),
        }));
        await expect(service.assertCartReadyForCheckout(makeBranch(), makeCart())).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: expect.objectContaining({
                    itemOptionId: 'option_1',
                    stockQuantity: 0,
                    requestedQuantity: 1,
                }),
            }),
        });
    });
    it('rejects checkout when selected variant options no longer match an active combination', async () => {
        const service = new checkout_validation_service_1.CheckoutValidationService(makeMenusService({
            listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([
                {
                    id: 'group_1',
                    kind: client_1.ItemOptionGroupKind.VARIANT_SELECTOR,
                    minSelect: 1,
                    maxSelect: 1,
                    isActive: true,
                },
            ]),
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
                {
                    id: 'option_1',
                    isActive: true,
                    isStockTracked: false,
                    stockQuantity: null,
                    group: {
                        id: 'group_1',
                        kind: client_1.ItemOptionGroupKind.VARIANT_SELECTOR,
                    },
                },
            ]),
            findActiveVariantCombinationByMenuItemIdAndOptionIds: jest
                .fn()
                .mockResolvedValue(null),
        }));
        await expect(service.assertCartReadyForCheckout(makeBranch(), makeCart())).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: expect.objectContaining({
                    selectedVariantOptionIds: ['option_1'],
                }),
            }),
        });
    });
    it('rejects checkout when the selected variant combination no longer has enough stock', async () => {
        const service = new checkout_validation_service_1.CheckoutValidationService(makeMenusService({
            listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([
                {
                    id: 'group_1',
                    kind: client_1.ItemOptionGroupKind.VARIANT_SELECTOR,
                    minSelect: 1,
                    maxSelect: 1,
                    isActive: true,
                },
            ]),
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
                {
                    id: 'option_1',
                    isActive: true,
                    isStockTracked: false,
                    stockQuantity: null,
                    group: {
                        id: 'group_1',
                        kind: client_1.ItemOptionGroupKind.VARIANT_SELECTOR,
                    },
                },
            ]),
            findActiveVariantCombinationByMenuItemIdAndOptionIds: jest
                .fn()
                .mockResolvedValue({
                id: 'combo_1',
                isStockTracked: true,
                stockQuantity: 0,
            }),
        }));
        await expect(service.assertCartReadyForCheckout(makeBranch(), makeCart())).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: expect.objectContaining({
                    combinationId: 'combo_1',
                    requestedQuantity: 1,
                }),
            }),
        });
    });
});
//# sourceMappingURL=checkout-validation.service.spec.js.map
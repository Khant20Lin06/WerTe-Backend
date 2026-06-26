"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const menu_item_policy_service_1 = require("../../../../src/modules/menus/policies/menu-item-policy.service");
const merchant_menu_variant_combinations_service_1 = require("../../../../src/modules/menus/services/merchant-menu-variant-combinations.service");
describe('MerchantMenuVariantCombinationsService', () => {
    const currentUser = {
        userId: 'usr_merchant_1',
        sessionId: 'session_1',
        role: client_1.UserRole.MERCHANT,
        tokenType: 'access',
        actorContext: {
            userId: 'usr_merchant_1',
            phone: '0999999999',
            role: client_1.UserRole.MERCHANT,
            status: client_1.UserStatus.ACTIVE,
            merchantId: 'merchant_1',
        },
    };
    const makeItem = (overrides) => ({
        id: 'item_1',
        branchId: 'branch_1',
        categoryId: 'cat_1',
        name: 'T-Shirt',
        description: 'Soft cotton tee',
        imageUrl: null,
        imageUrlsJson: null,
        sku: null,
        barcode: null,
        brand: null,
        attributesJson: null,
        basePrice: new client_1.Prisma.Decimal('12000'),
        isStockTracked: false,
        stockQuantity: null,
        lowStockThreshold: null,
        sortOrder: 0,
        isAvailable: true,
        createdAt: new Date('2026-05-02T00:00:00.000Z'),
        updatedAt: new Date('2026-05-02T00:00:00.000Z'),
        branch: {
            id: 'branch_1',
            merchantId: 'merchant_1',
            merchant: {
                id: 'merchant_1',
                user: {
                    id: 'usr_merchant_1',
                    phone: '0999999999',
                    role: client_1.UserRole.MERCHANT,
                    status: client_1.UserStatus.ACTIVE,
                },
            },
        },
        category: {
            id: 'cat_1',
            name: 'Apparel',
            isActive: true,
        },
        storeTypes: [],
        ...overrides,
    });
    const makeVariantGroup = (overrides) => ({
        id: 'group_size',
        menuItemId: 'item_1',
        name: 'Size',
        description: null,
        kind: client_1.ItemOptionGroupKind.VARIANT_SELECTOR,
        minSelect: 1,
        maxSelect: 1,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date('2026-05-02T00:00:00.000Z'),
        updatedAt: new Date('2026-05-02T00:00:00.000Z'),
        menuItem: makeItem(),
        ...overrides,
    });
    const makeOption = (overrides) => ({
        id: 'option_size_s',
        groupId: 'group_size',
        name: 'Small',
        priceDelta: new client_1.Prisma.Decimal('0'),
        isStockTracked: false,
        stockQuantity: null,
        lowStockThreshold: null,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date('2026-05-02T00:00:00.000Z'),
        updatedAt: new Date('2026-05-02T00:00:00.000Z'),
        group: makeVariantGroup(),
        ...overrides,
    });
    const makeCombination = (overrides) => ({
        id: 'combo_1',
        menuItemId: 'item_1',
        name: 'Small / Red',
        sku: 'SKU-TSHIRT-S-RED',
        signature: 'option_color_red|option_size_s',
        isStockTracked: true,
        stockQuantity: 5,
        lowStockThreshold: 1,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date('2026-05-02T00:00:00.000Z'),
        updatedAt: new Date('2026-05-02T00:00:00.000Z'),
        menuItem: makeItem(),
        optionLinks: [
            {
                combinationId: 'combo_1',
                itemOptionId: 'option_size_s',
                itemOption: {
                    id: 'option_size_s',
                    name: 'Small',
                    sortOrder: 0,
                    isActive: true,
                    group: {
                        id: 'group_size',
                        name: 'Size',
                        sortOrder: 0,
                        isActive: true,
                    },
                },
            },
            {
                combinationId: 'combo_1',
                itemOptionId: 'option_color_red',
                itemOption: {
                    id: 'option_color_red',
                    name: 'Red',
                    sortOrder: 0,
                    isActive: true,
                    group: {
                        id: 'group_color',
                        name: 'Color',
                        sortOrder: 1,
                        isActive: true,
                    },
                },
            },
        ],
        ...overrides,
    });
    const prismaService = {
        runInTransaction: jest.fn(async (callback) => callback({})),
    };
    it('creates a variant combination and auto-generates a label when omitted', async () => {
        const menusRepository = {
            findVariantCombinationByMenuItemIdAndSignature: jest
                .fn()
                .mockResolvedValue(null),
            findHighestVariantCombinationSortOrderByMenuItemId: jest
                .fn()
                .mockResolvedValue({ sortOrder: 2 }),
            createVariantCombination: jest.fn().mockResolvedValue(makeCombination({
                sortOrder: 3,
                name: 'Small / Red',
                sku: null,
            })),
            replaceVariantCombinationOptions: jest.fn().mockResolvedValue(undefined),
            findVariantCombinationById: jest.fn().mockResolvedValue(makeCombination({
                sortOrder: 3,
                name: 'Small / Red',
                sku: null,
            })),
        };
        const service = new merchant_menu_variant_combinations_service_1.MerchantMenuVariantCombinationsService(prismaService, {
            findItemOwnedByUserId: jest.fn().mockResolvedValue(makeItem()),
            listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([
                makeVariantGroup(),
                makeVariantGroup({
                    id: 'group_color',
                    name: 'Color',
                    sortOrder: 1,
                }),
            ]),
            listOptionsByOptionGroupId: jest
                .fn()
                .mockResolvedValueOnce([makeOption()])
                .mockResolvedValueOnce([
                makeOption({
                    id: 'option_color_red',
                    groupId: 'group_color',
                    name: 'Red',
                    group: makeVariantGroup({
                        id: 'group_color',
                        name: 'Color',
                        sortOrder: 1,
                    }),
                }),
            ]),
        }, menusRepository, new menu_item_policy_service_1.MenuItemPolicyService());
        const result = await service.createItemVariantCombination(currentUser, 'branch_1', 'item_1', {
            selectedOptionIds: ['option_size_s', 'option_color_red'],
            isStockTracked: true,
            stockQuantity: 5,
            lowStockThreshold: 1,
        });
        expect(menusRepository.createVariantCombination).toHaveBeenCalledWith(expect.objectContaining({
            menuItemId: 'item_1',
            name: 'Small / Red',
            signature: 'option_color_red|option_size_s',
            isStockTracked: true,
            stockQuantity: 5,
            lowStockThreshold: 1,
            sortOrder: 3,
        }), expect.anything());
        expect(menusRepository.replaceVariantCombinationOptions).toHaveBeenCalledWith('combo_1', ['option_size_s', 'option_color_red'], expect.anything());
        expect(result.name).toBe('Small / Red');
    });
    it('rejects duplicate combination signatures for the same menu item', async () => {
        const service = new merchant_menu_variant_combinations_service_1.MerchantMenuVariantCombinationsService(prismaService, {
            findItemOwnedByUserId: jest.fn().mockResolvedValue(makeItem()),
            listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([
                makeVariantGroup(),
            ]),
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([makeOption()]),
        }, {
            findVariantCombinationByMenuItemIdAndSignature: jest
                .fn()
                .mockResolvedValue(makeCombination()),
        }, new menu_item_policy_service_1.MenuItemPolicyService());
        await expect(service.createItemVariantCombination(currentUser, 'branch_1', 'item_1', {
            selectedOptionIds: ['option_size_s'],
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.conflict,
            }),
        });
    });
});
//# sourceMappingURL=merchant-menu-variant-combinations.service.spec.js.map
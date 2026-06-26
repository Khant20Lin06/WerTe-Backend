"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const menu_option_group_policy_service_1 = require("../../../../src/modules/menus/policies/menu-option-group-policy.service");
const merchant_menu_option_groups_service_1 = require("../../../../src/modules/menus/services/merchant-menu-option-groups.service");
describe('MerchantMenuOptionGroupsService', () => {
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
        name: 'Mohinga',
        description: 'Signature breakfast item',
        imageUrl: null,
        imageUrlsJson: null,
        sku: null,
        barcode: null,
        brand: null,
        attributesJson: null,
        basePrice: new client_1.Prisma.Decimal('2500'),
        isStockTracked: false,
        stockQuantity: null,
        lowStockThreshold: null,
        sortOrder: 1,
        isAvailable: true,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
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
            name: 'Popular',
            isActive: true,
        },
        storeTypes: [],
        ...overrides,
    });
    const makeOptionGroup = (overrides) => ({
        id: 'group_1',
        menuItemId: 'item_1',
        name: 'Choose noodle type',
        description: 'Required selection',
        kind: client_1.ItemOptionGroupKind.ADD_ON,
        minSelect: 1,
        maxSelect: 1,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        menuItem: makeItem(),
        ...overrides,
    });
    const prismaService = {
        runInTransaction: jest.fn(async (callback) => callback({})),
    };
    it('lists option groups for a merchant-owned menu item', async () => {
        const service = new merchant_menu_option_groups_service_1.MerchantMenuOptionGroupsService(prismaService, {
            findItemOwnedByUserId: jest.fn().mockResolvedValue(makeItem()),
            listOptionGroupsByMenuItemId: jest
                .fn()
                .mockResolvedValue([makeOptionGroup()]),
        }, {}, new menu_option_group_policy_service_1.MenuOptionGroupPolicyService());
        await expect(service.listItemOptionGroups(currentUser, 'branch_1', 'item_1')).resolves.toEqual([
            {
                id: 'group_1',
                branchId: 'branch_1',
                menuItemId: 'item_1',
                name: 'Choose noodle type',
                description: 'Required selection',
                kind: client_1.ItemOptionGroupKind.ADD_ON,
                minSelect: 1,
                maxSelect: 1,
                sortOrder: 0,
                isActive: true,
                createdAt: '2026-04-19T00:00:00.000Z',
                updatedAt: '2026-04-19T00:00:00.000Z',
            },
        ]);
    });
    it('assigns the next sort order when creating an option group without an explicit sort order', async () => {
        const menusRepository = {
            findHighestOptionGroupSortOrderByMenuItemId: jest
                .fn()
                .mockResolvedValue({ sortOrder: 2 }),
            createOptionGroup: jest.fn().mockResolvedValue(makeOptionGroup({
                id: 'group_2',
                name: 'Choose size',
                minSelect: 0,
                maxSelect: 2,
                sortOrder: 3,
            })),
        };
        const service = new merchant_menu_option_groups_service_1.MerchantMenuOptionGroupsService(prismaService, {
            findItemOwnedByUserId: jest.fn().mockResolvedValue(makeItem()),
        }, menusRepository, new menu_option_group_policy_service_1.MenuOptionGroupPolicyService());
        const result = await service.createItemOptionGroup(currentUser, 'branch_1', 'item_1', {
            name: 'Choose size',
            minSelect: 0,
            maxSelect: 2,
            kind: client_1.ItemOptionGroupKind.ADD_ON,
        });
        expect(menusRepository.createOptionGroup).toHaveBeenCalledWith(expect.objectContaining({
            menuItemId: 'item_1',
            name: 'Choose size',
            minSelect: 0,
            maxSelect: 2,
            kind: client_1.ItemOptionGroupKind.ADD_ON,
            sortOrder: 3,
            isActive: true,
        }), expect.anything());
        expect(result.sortOrder).toBe(3);
    });
    it('rejects invalid selection bounds when maxSelect is smaller than minSelect', async () => {
        const service = new merchant_menu_option_groups_service_1.MerchantMenuOptionGroupsService(prismaService, {
            findItemOwnedByUserId: jest.fn().mockResolvedValue(makeItem()),
        }, {}, new menu_option_group_policy_service_1.MenuOptionGroupPolicyService());
        await expect(service.createItemOptionGroup(currentUser, 'branch_1', 'item_1', {
            name: 'Invalid',
            minSelect: 2,
            maxSelect: 1,
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
    it('rejects option group updates when the group does not belong to the requested menu item', async () => {
        const service = new merchant_menu_option_groups_service_1.MerchantMenuOptionGroupsService(prismaService, {
            findOptionGroupOwnedByUserId: jest.fn().mockResolvedValue(makeOptionGroup({
                menuItem: makeItem({
                    id: 'item_2',
                }),
            })),
        }, {}, new menu_option_group_policy_service_1.MenuOptionGroupPolicyService());
        await expect(service.updateItemOptionGroup(currentUser, 'branch_1', 'item_1', 'group_1', {
            name: 'Renamed',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.notFound,
            }),
        });
    });
    it('rejects variant selector groups that allow more than one selection', async () => {
        const service = new merchant_menu_option_groups_service_1.MerchantMenuOptionGroupsService(prismaService, {
            findItemOwnedByUserId: jest.fn().mockResolvedValue(makeItem()),
        }, {}, new menu_option_group_policy_service_1.MenuOptionGroupPolicyService());
        await expect(service.createItemOptionGroup(currentUser, 'branch_1', 'item_1', {
            name: 'Choose size',
            kind: client_1.ItemOptionGroupKind.VARIANT_SELECTOR,
            minSelect: 1,
            maxSelect: 2,
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
});
//# sourceMappingURL=merchant-menu-option-groups.service.spec.js.map
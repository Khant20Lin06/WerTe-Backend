"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const menu_option_policy_service_1 = require("../../../../src/modules/menus/policies/menu-option-policy.service");
const merchant_menu_options_service_1 = require("../../../../src/modules/menus/services/merchant-menu-options.service");
describe('MerchantMenuOptionsService', () => {
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
    const makeOption = (overrides) => ({
        id: 'option_1',
        groupId: 'group_1',
        name: 'Thin rice noodle',
        priceDelta: new client_1.Prisma.Decimal('0'),
        isStockTracked: false,
        stockQuantity: null,
        lowStockThreshold: null,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        group: makeOptionGroup(),
        ...overrides,
    });
    const prismaService = {
        runInTransaction: jest.fn(async (callback) => callback({})),
    };
    const makeAuditService = () => ({
        logAction: jest.fn().mockResolvedValue({}),
    });
    const makeNotificationEventService = () => ({
        publishMerchantInventoryAlert: jest.fn().mockResolvedValue(undefined),
    });
    it('lists options for a merchant-owned option group', async () => {
        const service = new merchant_menu_options_service_1.MerchantMenuOptionsService(prismaService, {
            findOptionGroupOwnedByUserId: jest.fn().mockResolvedValue(makeOptionGroup()),
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([makeOption()]),
        }, {}, new menu_option_policy_service_1.MenuOptionPolicyService(), makeAuditService(), makeNotificationEventService());
        await expect(service.listGroupOptions(currentUser, 'branch_1', 'item_1', 'group_1')).resolves.toEqual([
            {
                id: 'option_1',
                branchId: 'branch_1',
                menuItemId: 'item_1',
                optionGroupId: 'group_1',
                name: 'Thin rice noodle',
                priceDelta: '0',
                isStockTracked: false,
                stockQuantity: null,
                lowStockThreshold: null,
                isInStock: true,
                isLowStock: false,
                sortOrder: 0,
                isActive: true,
                createdAt: '2026-04-19T00:00:00.000Z',
                updatedAt: '2026-04-19T00:00:00.000Z',
            },
        ]);
    });
    it('assigns the next sort order when creating an option without an explicit sort order', async () => {
        const menusRepository = {
            findHighestOptionSortOrderByOptionGroupId: jest
                .fn()
                .mockResolvedValue({ sortOrder: 3 }),
            createOption: jest.fn().mockResolvedValue(makeOption({
                id: 'option_2',
                name: 'Flat noodle',
                priceDelta: new client_1.Prisma.Decimal('500'),
                sortOrder: 4,
            })),
        };
        const service = new merchant_menu_options_service_1.MerchantMenuOptionsService(prismaService, {
            findOptionGroupOwnedByUserId: jest.fn().mockResolvedValue(makeOptionGroup()),
        }, menusRepository, new menu_option_policy_service_1.MenuOptionPolicyService(), makeAuditService(), makeNotificationEventService());
        const result = await service.createGroupOption(currentUser, 'branch_1', 'item_1', 'group_1', {
            name: 'Flat noodle',
            priceDelta: 500,
        });
        expect(menusRepository.createOption).toHaveBeenCalledWith(expect.objectContaining({
            groupId: 'group_1',
            name: 'Flat noodle',
            priceDelta: 500,
            isStockTracked: false,
            stockQuantity: null,
            lowStockThreshold: null,
            sortOrder: 4,
            isActive: true,
        }), expect.anything());
        expect(result.sortOrder).toBe(4);
    });
    it('enables option-level stock tracking when inventory values are provided on create', async () => {
        const menusRepository = {
            findHighestOptionSortOrderByOptionGroupId: jest
                .fn()
                .mockResolvedValue({ sortOrder: 0 }),
            createOption: jest.fn().mockResolvedValue(makeOption({
                id: 'option_2',
                name: 'Large cup',
                priceDelta: new client_1.Prisma.Decimal('300'),
                isStockTracked: true,
                stockQuantity: 5,
                lowStockThreshold: 2,
                sortOrder: 1,
            })),
        };
        const service = new merchant_menu_options_service_1.MerchantMenuOptionsService(prismaService, {
            findOptionGroupOwnedByUserId: jest.fn().mockResolvedValue(makeOptionGroup()),
        }, menusRepository, new menu_option_policy_service_1.MenuOptionPolicyService(), makeAuditService(), makeNotificationEventService());
        const result = await service.createGroupOption(currentUser, 'branch_1', 'item_1', 'group_1', {
            name: 'Large cup',
            priceDelta: 300,
            stockQuantity: 5,
            lowStockThreshold: 2,
        });
        expect(menusRepository.createOption).toHaveBeenCalledWith(expect.objectContaining({
            groupId: 'group_1',
            isStockTracked: true,
            stockQuantity: 5,
            lowStockThreshold: 2,
        }), expect.anything());
        expect(result).toMatchObject({
            isStockTracked: true,
            stockQuantity: 5,
            lowStockThreshold: 2,
            isInStock: true,
            isLowStock: false,
        });
    });
    it('rejects option lookup when the option does not belong to the requested option group', async () => {
        const service = new merchant_menu_options_service_1.MerchantMenuOptionsService(prismaService, {
            findOptionOwnedByUserId: jest.fn().mockResolvedValue(makeOption({
                group: makeOptionGroup({
                    id: 'group_2',
                }),
            })),
        }, {}, new menu_option_policy_service_1.MenuOptionPolicyService(), makeAuditService(), makeNotificationEventService());
        await expect(service.getGroupOption(currentUser, 'branch_1', 'item_1', 'group_1', 'option_1')).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.notFound,
            }),
        });
    });
    it('updates option price delta and availability within the owning option group', async () => {
        const menusRepository = {
            updateOption: jest.fn().mockResolvedValue(makeOption({
                priceDelta: new client_1.Prisma.Decimal('250'),
                isActive: false,
            })),
        };
        const service = new merchant_menu_options_service_1.MerchantMenuOptionsService(prismaService, {
            findOptionOwnedByUserId: jest.fn().mockResolvedValue(makeOption()),
        }, menusRepository, new menu_option_policy_service_1.MenuOptionPolicyService(), makeAuditService(), makeNotificationEventService());
        const result = await service.updateGroupOption(currentUser, 'branch_1', 'item_1', 'group_1', 'option_1', {
            priceDelta: 250,
            isActive: false,
        });
        expect(menusRepository.updateOption).toHaveBeenCalledWith('option_1', expect.objectContaining({
            priceDelta: 250,
            isActive: false,
        }));
        expect(result.priceDelta).toBe('250');
        expect(result.isActive).toBe(false);
    });
    it('adjusts tracked option inventory and writes an audit record', async () => {
        const menusRepository = {
            adjustTrackedOptionStock: jest.fn().mockResolvedValue(true),
            findOptionById: jest.fn().mockResolvedValue(makeOption({
                isStockTracked: true,
                stockQuantity: 7,
                lowStockThreshold: 2,
            })),
        };
        const auditService = makeAuditService();
        const notificationEventService = makeNotificationEventService();
        const service = new merchant_menu_options_service_1.MerchantMenuOptionsService(prismaService, {
            findOptionOwnedByUserId: jest.fn().mockResolvedValue(makeOption({
                isStockTracked: true,
                stockQuantity: 4,
                lowStockThreshold: 2,
            })),
        }, menusRepository, new menu_option_policy_service_1.MenuOptionPolicyService(), auditService, notificationEventService);
        const result = await service.adjustGroupOptionInventory(currentUser, 'branch_1', 'item_1', 'group_1', 'option_1', {
            delta: 3,
            reasonCode: 'manual_restock_after_return',
            note: 'Returned stock added back.',
        });
        expect(menusRepository.adjustTrackedOptionStock).toHaveBeenCalledWith('option_1', 3, expect.anything());
        expect(result.stockQuantity).toBe(7);
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            action: 'item_options.inventory_adjusted',
            resourceType: 'ITEM_OPTION',
            resourceId: 'option_1',
            branchId: 'branch_1',
        }));
        expect(notificationEventService.publishMerchantInventoryAlert).not.toHaveBeenCalled();
    });
    it('publishes a merchant inventory alert when an option crosses into out of stock', async () => {
        const menusRepository = {
            adjustTrackedOptionStock: jest.fn().mockResolvedValue(true),
            findOptionById: jest.fn().mockResolvedValue(makeOption({
                isStockTracked: true,
                stockQuantity: 0,
                lowStockThreshold: 2,
            })),
        };
        const notificationEventService = makeNotificationEventService();
        const service = new merchant_menu_options_service_1.MerchantMenuOptionsService(prismaService, {
            findOptionOwnedByUserId: jest.fn().mockResolvedValue(makeOption({
                isStockTracked: true,
                stockQuantity: 2,
                lowStockThreshold: 2,
            })),
        }, menusRepository, new menu_option_policy_service_1.MenuOptionPolicyService(), makeAuditService(), notificationEventService);
        await service.adjustGroupOptionInventory(currentUser, 'branch_1', 'item_1', 'group_1', 'option_1', {
            delta: -2,
            reasonCode: 'manual_damage_writeoff',
        });
        expect(notificationEventService.publishMerchantInventoryAlert).toHaveBeenCalledWith(expect.objectContaining({
            resourceType: 'ITEM_OPTION',
            resourceId: 'option_1',
            attentionLevel: 'OUT_OF_STOCK',
            stockQuantity: 0,
            lowStockThreshold: 2,
            menuItemName: 'Mohinga',
        }));
    });
});
//# sourceMappingURL=merchant-menu-options.service.spec.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const menu_category_policy_service_1 = require("../../../../src/modules/menus/policies/menu-category-policy.service");
const merchant_menu_categories_service_1 = require("../../../../src/modules/menus/services/merchant-menu-categories.service");
describe('MerchantMenuCategoriesService', () => {
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
    const makeBranch = (overrides) => ({
        id: 'branch_1',
        merchantId: 'merchant_1',
        name: 'Downtown Branch',
        contactPhone: '0942000000',
        line1: 'No. 10, Merchant Street',
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
            name: 'Tea House',
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
    });
    const makeCategory = (overrides) => ({
        id: 'cat_1',
        branchId: 'branch_1',
        name: 'Popular',
        description: 'Most ordered items',
        sortOrder: 1,
        isActive: true,
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
        storeTypes: [],
        ...overrides,
    });
    const prismaService = {
        runInTransaction: jest.fn(async (callback) => callback({})),
    };
    const makeAuditService = () => ({
        logAction: jest.fn().mockResolvedValue({}),
    });
    it('lists categories for a merchant-owned branch', async () => {
        const service = new merchant_menu_categories_service_1.MerchantMenuCategoriesService(prismaService, {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
        }, {
            listCategoriesByBranchId: jest.fn().mockResolvedValue([makeCategory()]),
        }, {}, new menu_category_policy_service_1.MenuCategoryPolicyService(), makeAuditService());
        await expect(service.listBranchCategories(currentUser, 'branch_1')).resolves.toEqual([
            {
                id: 'cat_1',
                branchId: 'branch_1',
                name: 'Popular',
                description: 'Most ordered items',
                sortOrder: 1,
                isActive: true,
                storeTypes: [],
                createdAt: '2026-04-19T00:00:00.000Z',
                updatedAt: '2026-04-19T00:00:00.000Z',
            },
        ]);
    });
    it('assigns the next sort order when creating a category without an explicit sort order', async () => {
        const menusRepository = {
            findHighestCategorySortOrderByBranchId: jest
                .fn()
                .mockResolvedValue({ sortOrder: 4 }),
            listApprovedStoreTypesByBranchId: jest.fn().mockResolvedValue([
                {
                    branchId: 'branch_1',
                    storeTypeId: 'store_type_grocery',
                    status: client_1.BranchStoreTypeStatus.APPROVED,
                    isPrimary: true,
                    sortOrder: 0,
                    requestedByUserId: 'usr_admin_1',
                    approvedByUserId: 'usr_admin_1',
                    approvedAt: new Date('2026-04-19T00:00:00.000Z'),
                    rejectedAt: null,
                    hiddenAt: null,
                    reason: null,
                    createdAt: new Date('2026-04-19T00:00:00.000Z'),
                    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                    storeType: {
                        id: 'store_type_grocery',
                        code: 'grocery',
                        name: 'Grocery',
                        sortOrder: 10,
                    },
                },
            ]),
            createCategory: jest.fn().mockResolvedValue(makeCategory({
                id: 'cat_2',
                name: 'New Category',
                sortOrder: 5,
                storeTypes: [
                    {
                        categoryId: 'cat_2',
                        storeTypeId: 'store_type_grocery',
                        storeType: {
                            id: 'store_type_grocery',
                            code: 'grocery',
                            name: 'Grocery',
                            sortOrder: 10,
                        },
                    },
                ],
            })),
            replaceCategoryStoreTypes: jest.fn().mockResolvedValue(undefined),
            findCategoryById: jest.fn().mockResolvedValue(makeCategory({
                id: 'cat_2',
                name: 'New Category',
                sortOrder: 5,
                storeTypes: [
                    {
                        categoryId: 'cat_2',
                        storeTypeId: 'store_type_grocery',
                        storeType: {
                            id: 'store_type_grocery',
                            code: 'grocery',
                            name: 'Grocery',
                            sortOrder: 10,
                        },
                    },
                ],
            })),
        };
        const auditService = makeAuditService();
        const service = new merchant_menu_categories_service_1.MerchantMenuCategoriesService(prismaService, {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
        }, {}, menusRepository, new menu_category_policy_service_1.MenuCategoryPolicyService(), auditService);
        const result = await service.createBranchCategory(currentUser, 'branch_1', {
            name: 'New Category',
            storeTypeIds: ['store_type_grocery'],
        });
        expect(menusRepository.createCategory).toHaveBeenCalledWith(expect.objectContaining({
            branchId: 'branch_1',
            name: 'New Category',
            sortOrder: 5,
            isActive: true,
        }), expect.anything());
        expect(menusRepository.replaceCategoryStoreTypes).toHaveBeenCalledWith('cat_2', ['store_type_grocery'], expect.anything());
        expect(result.sortOrder).toBe(5);
        expect(result.storeTypes).toEqual([
            {
                id: 'store_type_grocery',
                code: 'grocery',
                name: 'Grocery',
                sortOrder: 10,
            },
        ]);
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            action: 'menu_categories.scope_created',
            resourceType: 'MENU_CATEGORY',
            resourceId: 'cat_2',
            branchId: 'branch_1',
        }));
    });
    it('rejects category store type scopes that are not approved for the branch', async () => {
        const menusRepository = {
            findHighestCategorySortOrderByBranchId: jest.fn().mockResolvedValue(null),
            listApprovedStoreTypesByBranchId: jest.fn().mockResolvedValue([]),
            createCategory: jest.fn(),
            replaceCategoryStoreTypes: jest.fn(),
            findCategoryById: jest.fn(),
        };
        const service = new merchant_menu_categories_service_1.MerchantMenuCategoriesService(prismaService, {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
        }, {}, menusRepository, new menu_category_policy_service_1.MenuCategoryPolicyService(), makeAuditService());
        await expect(service.createBranchCategory(currentUser, 'branch_1', {
            name: 'Scoped Category',
            storeTypeIds: ['store_type_unknown'],
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.BAD_REQUEST,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.validationFailed,
            }),
        });
        expect(menusRepository.createCategory).not.toHaveBeenCalled();
    });
    it('rejects category updates when the category does not belong to the requested branch', async () => {
        const service = new merchant_menu_categories_service_1.MerchantMenuCategoriesService(prismaService, {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
        }, {
            findCategoryOwnedByUserId: jest.fn().mockResolvedValue(makeCategory({
                branch: {
                    id: 'branch_2',
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
            })),
        }, {}, new menu_category_policy_service_1.MenuCategoryPolicyService(), makeAuditService());
        await expect(service.updateBranchCategory(currentUser, 'branch_1', 'cat_1', {
            name: 'Renamed',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.notFound,
            }),
        });
    });
    it('writes a scope audit record when category scope changes', async () => {
        const updatedCategory = makeCategory({
            storeTypes: [
                {
                    categoryId: 'cat_1',
                    storeTypeId: 'store_type_grocery',
                    storeType: {
                        id: 'store_type_grocery',
                        code: 'grocery',
                        name: 'Grocery',
                        sortOrder: 10,
                    },
                },
            ],
        });
        const menusRepository = {
            updateCategory: jest.fn().mockResolvedValue(updatedCategory),
            listApprovedStoreTypesByBranchId: jest.fn().mockResolvedValue([
                {
                    branchId: 'branch_1',
                    storeTypeId: 'store_type_grocery',
                    status: client_1.BranchStoreTypeStatus.APPROVED,
                    isPrimary: true,
                    sortOrder: 0,
                    requestedByUserId: 'usr_admin_1',
                    approvedByUserId: 'usr_admin_1',
                    approvedAt: new Date('2026-04-19T00:00:00.000Z'),
                    rejectedAt: null,
                    hiddenAt: null,
                    reason: null,
                    createdAt: new Date('2026-04-19T00:00:00.000Z'),
                    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                    storeType: {
                        id: 'store_type_grocery',
                        code: 'grocery',
                        name: 'Grocery',
                        sortOrder: 10,
                    },
                },
            ]),
            replaceCategoryStoreTypes: jest.fn().mockResolvedValue(undefined),
            findCategoryById: jest.fn().mockResolvedValue(updatedCategory),
        };
        const auditService = makeAuditService();
        const service = new merchant_menu_categories_service_1.MerchantMenuCategoriesService(prismaService, {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
        }, {
            findCategoryOwnedByUserId: jest.fn().mockResolvedValue(makeCategory()),
        }, menusRepository, new menu_category_policy_service_1.MenuCategoryPolicyService(), auditService);
        await service.updateBranchCategory(currentUser, 'branch_1', 'cat_1', {
            storeTypeIds: ['store_type_grocery'],
        });
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            action: 'menu_categories.scope_updated',
            resourceType: 'MENU_CATEGORY',
            resourceId: 'cat_1',
            branchId: 'branch_1',
        }));
    });
});
//# sourceMappingURL=merchant-menu-categories.service.spec.js.map
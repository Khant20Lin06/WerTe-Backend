"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const merchant_catalog_read_service_1 = require("../../../../src/modules/menus/services/merchant-catalog-read.service");
describe('MerchantCatalogReadService', () => {
    const makeCatalog = (overrides) => ({
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
            name: 'Tea House',
            status: client_1.MerchantStatus.ACTIVE,
            user: {
                id: 'usr_merchant_1',
                phone: '0999999999',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
            },
        },
        storeTypes: [
            {
                branchId: 'branch_1',
                storeTypeId: 'store_type_restaurant',
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
                    id: 'store_type_restaurant',
                    code: 'restaurant',
                    name: 'Restaurant',
                    sortOrder: 10,
                },
            },
        ],
        menuCategories: [],
        menuItems: [],
        operatingHours: null,
        staffAssignments: [],
        ...overrides,
    });
    it('returns null when the catalog branch is not owned by the merchant user', async () => {
        const menusService = {
            findOwnedBranchCatalogByUserId: jest.fn().mockResolvedValue(null),
            buildBranchCatalog: jest.fn(),
        };
        const service = new merchant_catalog_read_service_1.MerchantCatalogReadService(menusService);
        const result = await service.getOwnedBranchCatalog('usr_merchant_2', 'branch_1');
        expect(result).toBeNull();
    });
    it('returns the built catalog for the owning merchant user', async () => {
        const catalogRecord = makeCatalog();
        const menusService = {
            findOwnedBranchCatalogByUserId: jest.fn().mockResolvedValue(catalogRecord),
            buildBranchCatalog: jest.fn().mockReturnValue({
                branchId: 'branch_1',
                merchantId: 'merchant_1',
                merchantUserId: 'usr_merchant_1',
                branchName: 'Downtown Branch',
                township: 'Botahtaung',
                branchStatus: client_1.BranchStatus.ACTIVE,
                approvedStoreTypes: [],
                categories: [],
                uncategorizedItems: [],
            }),
        };
        const service = new merchant_catalog_read_service_1.MerchantCatalogReadService(menusService);
        const result = await service.getOwnedBranchCatalog('usr_merchant_1', 'branch_1');
        expect(menusService.buildBranchCatalog).toHaveBeenCalledWith(catalogRecord);
        expect(result?.branchId).toBe('branch_1');
    });
    it('builds a scope overview for the owning merchant user', async () => {
        const catalogRecord = makeCatalog();
        const menusService = {
            findOwnedBranchCatalogByUserId: jest.fn().mockResolvedValue(catalogRecord),
            buildBranchCatalog: jest.fn().mockReturnValue({
                branchId: 'branch_1',
                merchantId: 'merchant_1',
                merchantUserId: 'usr_merchant_1',
                branchName: 'Downtown Branch',
                township: 'Botahtaung',
                branchStatus: client_1.BranchStatus.ACTIVE,
                approvedStoreTypes: [
                    {
                        id: 'store_type_restaurant',
                        code: 'restaurant',
                        name: 'Restaurant',
                        sortOrder: 10,
                    },
                    {
                        id: 'store_type_grocery',
                        code: 'grocery',
                        name: 'Grocery',
                        sortOrder: 20,
                    },
                ],
                categories: [
                    {
                        categoryId: 'cat_1',
                        name: 'Popular',
                        description: null,
                        sortOrder: 0,
                        isActive: true,
                        scopedStoreTypes: [],
                        items: [
                            {
                                itemId: 'item_1',
                                categoryId: 'cat_1',
                                name: 'Mohinga',
                                description: null,
                                imageUrl: null,
                                imageUrls: [],
                                sku: null,
                                barcode: null,
                                brand: null,
                                attributes: null,
                                basePrice: '2500',
                                isStockTracked: false,
                                stockQuantity: null,
                                lowStockThreshold: null,
                                isInStock: true,
                                isLowStock: false,
                                sortOrder: 0,
                                isAvailable: true,
                                scopedStoreTypes: [],
                                optionGroups: [],
                            },
                            {
                                itemId: 'item_2',
                                categoryId: 'cat_1',
                                name: 'Fresh Juice',
                                description: null,
                                imageUrl: null,
                                imageUrls: [],
                                sku: null,
                                barcode: null,
                                brand: null,
                                attributes: null,
                                basePrice: '1800',
                                isStockTracked: false,
                                stockQuantity: null,
                                lowStockThreshold: null,
                                isInStock: true,
                                isLowStock: false,
                                sortOrder: 1,
                                isAvailable: true,
                                scopedStoreTypes: [
                                    {
                                        id: 'store_type_grocery',
                                        code: 'grocery',
                                        name: 'Grocery',
                                        sortOrder: 20,
                                    },
                                ],
                                optionGroups: [],
                            },
                        ],
                    },
                ],
                uncategorizedItems: [
                    {
                        itemId: 'item_3',
                        categoryId: null,
                        name: 'Chef Special',
                        description: null,
                        imageUrl: null,
                        imageUrls: [],
                        sku: null,
                        barcode: null,
                        brand: null,
                        attributes: null,
                        basePrice: '3200',
                        isStockTracked: false,
                        stockQuantity: null,
                        lowStockThreshold: null,
                        isInStock: true,
                        isLowStock: false,
                        sortOrder: 0,
                        isAvailable: true,
                        scopedStoreTypes: [
                            {
                                id: 'store_type_restaurant',
                                code: 'restaurant',
                                name: 'Restaurant',
                                sortOrder: 10,
                            },
                        ],
                        optionGroups: [],
                    },
                ],
            }),
        };
        const service = new merchant_catalog_read_service_1.MerchantCatalogReadService(menusService);
        const result = await service.getOwnedBranchScopeOverview('usr_merchant_1', 'branch_1');
        expect(result.approvedStoreTypes).toHaveLength(2);
        expect(result.totals).toEqual({
            totalCategories: 1,
            scopedCategories: 0,
            unscopedCategories: 1,
            totalItems: 3,
            scopedItems: 2,
            unscopedItems: 1,
        });
        expect(result.storeTypeUsage).toEqual([
            {
                storeType: {
                    id: 'store_type_restaurant',
                    code: 'restaurant',
                    name: 'Restaurant',
                    sortOrder: 10,
                },
                scopedCategoryCount: 0,
                scopedItemCount: 1,
            },
            {
                storeType: {
                    id: 'store_type_grocery',
                    code: 'grocery',
                    name: 'Grocery',
                    sortOrder: 20,
                },
                scopedCategoryCount: 0,
                scopedItemCount: 1,
            },
        ]);
    });
    it('throws not found when the merchant does not own the requested branch scope overview', async () => {
        const menusService = {
            findOwnedBranchCatalogByUserId: jest.fn().mockResolvedValue(null),
            buildBranchCatalog: jest.fn(),
        };
        const service = new merchant_catalog_read_service_1.MerchantCatalogReadService(menusService);
        await expect(service.getOwnedBranchScopeOverview('usr_merchant_2', 'branch_1')).rejects.toBeInstanceOf(app_exception_1.AppException);
    });
});
//# sourceMappingURL=merchant-catalog-read.service.spec.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const customer_store_discovery_service_1 = require("../../../../src/modules/store-types/services/customer-store-discovery.service");
const list_customer_stores_query_dto_1 = require("../../../../src/modules/store-types/dto/list-customer-stores-query.dto");
describe('CustomerStoreDiscoveryService', () => {
    const customerUser = {
        userId: 'usr_customer_1',
        sessionId: 'session_1',
        role: client_1.UserRole.CUSTOMER,
        tokenType: 'access',
        actorContext: {
            userId: 'usr_customer_1',
            phone: '09111111111',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
            customerProfileId: 'customer_profile_1',
        },
    };
    const merchantUser = {
        userId: 'usr_merchant_1',
        sessionId: 'session_2',
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
    const makeDiscoveryBranch = (overrides) => ({
        id: 'branch_1',
        merchantId: 'merchant_1',
        name: 'Downtown Branch',
        contactPhone: null,
        line1: null,
        township: 'Kamaryut',
        latitude: null,
        longitude: null,
        storeType: 'grocery',
        primaryStoreTypeId: 'store_type_grocery',
        status: client_1.BranchStatus.ACTIVE,
        createdAt: new Date('2026-04-30T00:00:00.000Z'),
        updatedAt: new Date('2026-04-30T00:00:00.000Z'),
        merchant: {
            id: 'merchant_1',
            name: 'City Mart',
            status: client_1.MerchantStatus.ACTIVE,
        },
        operatingHours: null,
        storeTypes: [
            {
                branchId: 'branch_1',
                storeTypeId: 'store_type_grocery',
                status: client_1.BranchStoreTypeStatus.APPROVED,
                isPrimary: true,
                sortOrder: 0,
                requestedByUserId: 'usr_admin_1',
                approvedByUserId: 'usr_admin_1',
                approvedAt: new Date('2026-04-30T01:00:00.000Z'),
                rejectedAt: null,
                hiddenAt: null,
                reason: null,
                createdAt: new Date('2026-04-30T01:00:00.000Z'),
                updatedAt: new Date('2026-04-30T01:00:00.000Z'),
                storeType: {
                    id: 'store_type_grocery',
                    code: 'grocery',
                    name: 'Grocery',
                    sortOrder: 10,
                },
            },
            {
                branchId: 'branch_1',
                storeTypeId: 'store_type_pharmacy',
                status: client_1.BranchStoreTypeStatus.APPROVED,
                isPrimary: false,
                sortOrder: 1,
                requestedByUserId: 'usr_admin_1',
                approvedByUserId: 'usr_admin_1',
                approvedAt: new Date('2026-04-30T01:00:00.000Z'),
                rejectedAt: null,
                hiddenAt: null,
                reason: null,
                createdAt: new Date('2026-04-30T01:00:00.000Z'),
                updatedAt: new Date('2026-04-30T01:00:00.000Z'),
                storeType: {
                    id: 'store_type_pharmacy',
                    code: 'pharmacy',
                    name: 'Pharmacy',
                    sortOrder: 20,
                },
            },
        ],
        ...overrides,
    });
    const makeVisibleBranchCatalog = (overrides) => ({
        branchId: 'branch_1',
        merchantId: 'merchant_1',
        merchantUserId: 'usr_merchant_1',
        branchName: 'Downtown Branch',
        township: 'Kamaryut',
        branchStatus: client_1.BranchStatus.ACTIVE,
        approvedStoreTypes: [
            {
                id: 'store_type_grocery',
                code: 'grocery',
                name: 'Grocery',
                sortOrder: 10,
            },
            {
                id: 'store_type_pharmacy',
                code: 'pharmacy',
                name: 'Pharmacy',
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
                        name: 'Milk Tea',
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
                        variantCombinations: [],
                        optionGroups: [],
                    },
                ],
            },
        ],
        uncategorizedItems: [
            {
                itemId: 'item_2',
                categoryId: null,
                name: 'Brownie',
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
                scopedStoreTypes: [],
                variantCombinations: [],
                optionGroups: [],
            },
        ],
        ...overrides,
    });
    it('lists discoverable stores with primary and approved store types', async () => {
        const storeTypesRepository = {
            listCustomerDiscoverableBranches: jest
                .fn()
                .mockResolvedValue([makeDiscoveryBranch()]),
        };
        const service = new customer_store_discovery_service_1.CustomerStoreDiscoveryService(storeTypesRepository, {}, { isCacheable: () => false, getList: jest.fn().mockResolvedValue(null), setList: jest.fn() });
        const result = await service.listDiscoverableStores(customerUser, {
            storeTypeCode: 'Grocery',
            storeTypeCodes: ['pharmacy'],
            township: 'Kamaryut',
            keyword: 'city',
            sortBy: list_customer_stores_query_dto_1.CustomerStoreSortBy.NAME_ASC,
        });
        expect(storeTypesRepository.listCustomerDiscoverableBranches).toHaveBeenCalledWith({
            branchId: undefined,
            merchantId: undefined,
            storeTypeCodes: ['grocery', 'pharmacy'],
            township: 'Kamaryut',
            keyword: 'city',
        });
        expect(result).toEqual([
            {
                branchId: 'branch_1',
                branchName: 'Downtown Branch',
                merchantId: 'merchant_1',
                merchantName: 'City Mart',
                township: 'Kamaryut',
                primaryStoreType: {
                    id: 'store_type_grocery',
                    code: 'grocery',
                    name: 'Grocery',
                    sortOrder: 10,
                },
                approvedStoreTypes: [
                    {
                        id: 'store_type_grocery',
                        code: 'grocery',
                        name: 'Grocery',
                        sortOrder: 10,
                    },
                    {
                        id: 'store_type_pharmacy',
                        code: 'pharmacy',
                        name: 'Pharmacy',
                        sortOrder: 20,
                    },
                ],
            },
        ]);
    });
    it('returns discovery facets and respects selected store types when choosing the primary badge', async () => {
        const storeTypesRepository = {
            listCustomerDiscoverableBranches: jest
                .fn()
                .mockResolvedValue([makeDiscoveryBranch()]),
        };
        const service = new customer_store_discovery_service_1.CustomerStoreDiscoveryService(storeTypesRepository, {}, { isCacheable: () => false, getList: jest.fn().mockResolvedValue(null), setList: jest.fn() });
        const listResult = await service.listDiscoverableStores(customerUser, {
            storeTypeCodes: ['pharmacy'],
        });
        const facetResult = await service.getDiscoverableStoreFacets(customerUser, {
            storeTypeCodes: ['pharmacy'],
        });
        expect(listResult[0]?.primaryStoreType).toEqual({
            id: 'store_type_pharmacy',
            code: 'pharmacy',
            name: 'Pharmacy',
            sortOrder: 20,
        });
        expect(facetResult).toEqual({
            totalStoreCount: 1,
            storeTypes: [
                {
                    id: 'store_type_grocery',
                    code: 'grocery',
                    name: 'Grocery',
                    count: 1,
                },
                {
                    id: 'store_type_pharmacy',
                    code: 'pharmacy',
                    name: 'Pharmacy',
                    count: 1,
                },
            ],
            townships: [
                {
                    township: 'Kamaryut',
                    count: 1,
                },
            ],
        });
    });
    it('supports alternate customer discovery sort modes', async () => {
        const storeTypesRepository = {
            listCustomerDiscoverableBranches: jest.fn().mockResolvedValue([
                makeDiscoveryBranch({
                    id: 'branch_2',
                    name: 'Alpha Branch',
                    township: 'Bahan',
                    merchant: {
                        id: 'merchant_2',
                        name: 'Alpha Market',
                        status: client_1.MerchantStatus.ACTIVE,
                    },
                }),
                makeDiscoveryBranch({
                    id: 'branch_1',
                    name: 'Beta Branch',
                    township: 'Kamaryut',
                    merchant: {
                        id: 'merchant_1',
                        name: 'Beta Market',
                        status: client_1.MerchantStatus.ACTIVE,
                    },
                }),
            ]),
        };
        const service = new customer_store_discovery_service_1.CustomerStoreDiscoveryService(storeTypesRepository, {}, { isCacheable: () => false, getList: jest.fn().mockResolvedValue(null), setList: jest.fn() });
        const result = await service.listDiscoverableStores(customerUser, {
            sortBy: list_customer_stores_query_dto_1.CustomerStoreSortBy.TOWNSHIP_DESC,
        });
        expect(result.map((store) => store.branchName)).toEqual([
            'Beta Branch',
            'Alpha Branch',
        ]);
    });
    it('filters out branches that somehow have no approved active store types', async () => {
        const service = new customer_store_discovery_service_1.CustomerStoreDiscoveryService({
            listCustomerDiscoverableBranches: jest.fn().mockResolvedValue([
                makeDiscoveryBranch({
                    id: 'branch_2',
                    storeTypes: [],
                }),
            ]),
        }, {}, { isCacheable: () => false, getList: jest.fn().mockResolvedValue(null), setList: jest.fn() });
        await expect(service.listDiscoverableStores(customerUser, {})).resolves.toEqual([]);
    });
    it('returns store detail with catalog entry options and visible catalog counts', async () => {
        const storeTypesRepository = {
            listCustomerDiscoverableBranches: jest
                .fn()
                .mockResolvedValue([makeDiscoveryBranch()]),
        };
        const customerCatalogReadService = {
            getVisibleBranchCatalogOrThrow: jest
                .fn()
                .mockResolvedValue(makeVisibleBranchCatalog()),
        };
        const service = new customer_store_discovery_service_1.CustomerStoreDiscoveryService(storeTypesRepository, customerCatalogReadService, { isCacheable: () => false, getList: jest.fn().mockResolvedValue(null), setList: jest.fn() });
        const result = await service.getDiscoverableStoreDetail(customerUser, 'branch_1');
        expect(storeTypesRepository.listCustomerDiscoverableBranches).toHaveBeenCalledWith({
            branchId: 'branch_1',
            merchantId: undefined,
            storeTypeCodes: undefined,
            township: undefined,
            keyword: undefined,
        });
        expect(customerCatalogReadService.getVisibleBranchCatalogOrThrow).toHaveBeenCalledWith('branch_1');
        expect(result).toMatchObject({
            branchId: 'branch_1',
            branchName: 'Downtown Branch',
            merchantId: 'merchant_1',
            merchantName: 'City Mart',
            branchStatus: client_1.BranchStatus.ACTIVE,
            visibleCategoryCount: 1,
            visibleItemCount: 2,
            catalogEntries: [
                {
                    storeType: {
                        code: 'grocery',
                    },
                    isPrimary: true,
                },
                {
                    storeType: {
                        code: 'pharmacy',
                    },
                    isPrimary: false,
                },
            ],
        });
    });
    it('returns a selected store-type catalog entry for a discoverable branch', async () => {
        const storeTypesRepository = {
            listCustomerDiscoverableBranches: jest
                .fn()
                .mockResolvedValue([makeDiscoveryBranch()]),
        };
        const customerCatalogReadService = {
            getVisibleBranchCatalogOrThrow: jest
                .fn()
                .mockResolvedValue(makeVisibleBranchCatalog()),
        };
        const service = new customer_store_discovery_service_1.CustomerStoreDiscoveryService(storeTypesRepository, customerCatalogReadService, { isCacheable: () => false, getList: jest.fn().mockResolvedValue(null), setList: jest.fn() });
        const result = await service.getDiscoverableStoreCatalogEntry(customerUser, 'branch_1', {
            storeTypeCode: 'Pharmacy',
        });
        expect(result.selectedCatalogEntry).toEqual({
            storeType: {
                id: 'store_type_pharmacy',
                code: 'pharmacy',
                name: 'Pharmacy',
                sortOrder: 20,
            },
            isPrimary: false,
        });
        expect(customerCatalogReadService.getVisibleBranchCatalogOrThrow).toHaveBeenCalledWith('branch_1', {
            storeTypeCode: 'pharmacy',
        });
        expect(result.catalog.branchId).toBe('branch_1');
        expect(result.store.visibleItemCount).toBe(2);
    });
    it('rejects catalog entry requests for store types the branch does not expose', async () => {
        const service = new customer_store_discovery_service_1.CustomerStoreDiscoveryService({
            listCustomerDiscoverableBranches: jest
                .fn()
                .mockResolvedValue([makeDiscoveryBranch()]),
        }, {
            getVisibleBranchCatalogOrThrow: jest
                .fn()
                .mockResolvedValue(makeVisibleBranchCatalog()),
        }, { isCacheable: () => false, getList: jest.fn().mockResolvedValue(null), setList: jest.fn() });
        await expect(service.getDiscoverableStoreCatalogEntry(customerUser, 'branch_1', {
            storeTypeCode: 'beauty',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.notFound,
            }),
        });
    });
    it('rejects non-customer actors from customer discovery surface', async () => {
        const service = new customer_store_discovery_service_1.CustomerStoreDiscoveryService({}, {}, { isCacheable: () => false, getList: jest.fn().mockResolvedValue(null), setList: jest.fn() });
        await expect(service.listDiscoverableStores(merchantUser, {})).rejects.toMatchObject({
            status: common_1.HttpStatus.FORBIDDEN,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.forbidden,
            }),
        });
    });
});
//# sourceMappingURL=customer-store-discovery.service.spec.js.map
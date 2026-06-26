"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const customer_catalog_read_service_1 = require("../../../../src/modules/menus/services/customer-catalog-read.service");
describe('CustomerCatalogReadService', () => {
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
            {
                branchId: 'branch_1',
                storeTypeId: 'store_type_pharmacy',
                status: client_1.BranchStoreTypeStatus.APPROVED,
                isPrimary: false,
                sortOrder: 1,
                requestedByUserId: 'usr_admin_1',
                approvedByUserId: 'usr_admin_1',
                approvedAt: new Date('2026-04-19T00:00:00.000Z'),
                rejectedAt: null,
                hiddenAt: null,
                reason: null,
                createdAt: new Date('2026-04-19T00:00:00.000Z'),
                updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                storeType: {
                    id: 'store_type_pharmacy',
                    code: 'pharmacy',
                    name: 'Pharmacy',
                    sortOrder: 20,
                },
            },
        ],
        menuCategories: [],
        menuItems: [],
        operatingHours: null,
        staffAssignments: [],
        ...overrides,
    });
    it('returns null when no branch catalog exists', async () => {
        const menusService = {
            findBranchCatalogByBranchId: jest.fn().mockResolvedValue(null),
            buildBranchCatalog: jest.fn(),
        };
        const service = new customer_catalog_read_service_1.CustomerCatalogReadService(menusService);
        const result = await service.getVisibleBranchCatalog('branch_404');
        expect(result).toBeNull();
    });
    it('requests an active-only catalog build for customer-visible reads', async () => {
        const catalogRecord = makeCatalog();
        const menusService = {
            findBranchCatalogByBranchId: jest.fn().mockResolvedValue(catalogRecord),
            buildBranchCatalog: jest.fn().mockReturnValue({
                branchId: 'branch_1',
                merchantId: 'merchant_1',
                merchantUserId: 'usr_merchant_1',
                branchName: 'Downtown Branch',
                township: 'Botahtaung',
                branchStatus: client_1.BranchStatus.ACTIVE,
                categories: [],
                uncategorizedItems: [],
            }),
        };
        const service = new customer_catalog_read_service_1.CustomerCatalogReadService(menusService);
        await service.getVisibleBranchCatalog('branch_1');
        expect(menusService.buildBranchCatalog).toHaveBeenCalledWith(catalogRecord, {
            activeOnly: true,
            storeTypeCode: undefined,
        });
    });
    it('passes the selected store type code into catalog building when the branch exposes it', async () => {
        const catalogRecord = makeCatalog();
        const menusService = {
            findBranchCatalogByBranchId: jest.fn().mockResolvedValue(catalogRecord),
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
        const service = new customer_catalog_read_service_1.CustomerCatalogReadService(menusService);
        await service.getVisibleBranchCatalog('branch_1', {
            storeTypeCode: 'Pharmacy',
        });
        expect(menusService.buildBranchCatalog).toHaveBeenCalledWith(catalogRecord, {
            activeOnly: true,
            storeTypeCode: 'pharmacy',
        });
    });
    it('returns null when the selected store type code is not approved for the branch', async () => {
        const menusService = {
            findBranchCatalogByBranchId: jest.fn().mockResolvedValue(makeCatalog()),
            buildBranchCatalog: jest.fn(),
        };
        const service = new customer_catalog_read_service_1.CustomerCatalogReadService(menusService);
        const result = await service.getVisibleBranchCatalog('branch_1', {
            storeTypeCode: 'beauty',
        });
        expect(result).toBeNull();
        expect(menusService.buildBranchCatalog).not.toHaveBeenCalled();
    });
    it('returns null when the branch is not active', async () => {
        const menusService = {
            findBranchCatalogByBranchId: jest.fn().mockResolvedValue(makeCatalog({
                status: client_1.BranchStatus.INACTIVE,
            })),
            buildBranchCatalog: jest.fn(),
        };
        const service = new customer_catalog_read_service_1.CustomerCatalogReadService(menusService);
        const result = await service.getVisibleBranchCatalog('branch_1');
        expect(result).toBeNull();
        expect(menusService.buildBranchCatalog).not.toHaveBeenCalled();
    });
    it('returns null when the merchant is not active', async () => {
        const menusService = {
            findBranchCatalogByBranchId: jest.fn().mockResolvedValue(makeCatalog({
                merchant: {
                    id: 'merchant_1',
                    name: 'Tea House',
                    status: client_1.MerchantStatus.SUSPENDED,
                    user: {
                        id: 'usr_merchant_1',
                        phone: '0999999999',
                        role: client_1.UserRole.MERCHANT,
                        status: client_1.UserStatus.ACTIVE,
                    },
                },
            })),
            buildBranchCatalog: jest.fn(),
        };
        const service = new customer_catalog_read_service_1.CustomerCatalogReadService(menusService);
        const result = await service.getVisibleBranchCatalog('branch_1');
        expect(result).toBeNull();
        expect(menusService.buildBranchCatalog).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=customer-catalog-read.service.spec.js.map
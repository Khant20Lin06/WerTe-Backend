"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const branch_catalog_entity_1 = require("../../../../src/modules/menus/entities/branch-catalog.entity");
describe('buildBranchCatalog', () => {
    const makeBranchCatalogRecord = (overrides) => ({
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
        menuCategories: [
            {
                id: 'cat_active',
                branchId: 'branch_1',
                name: 'Popular',
                description: 'Most ordered',
                sortOrder: 0,
                isActive: true,
                createdAt: new Date('2026-04-19T00:00:00.000Z'),
                updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                storeTypes: [],
                menuItems: [
                    {
                        id: 'item_active',
                        branchId: 'branch_1',
                        categoryId: 'cat_active',
                        name: 'Mohinga',
                        description: 'Breakfast favorite',
                        imageUrl: null,
                        imageUrlsJson: [
                            'https://cdn.example.com/products/mohinga-front.png',
                        ],
                        sku: 'SKU-MOHINGA-1',
                        barcode: '8851234567890',
                        brand: 'Tea House',
                        attributesJson: {
                            cuisine: 'Myanmar',
                            portion: 'regular',
                        },
                        basePrice: new client_1.Prisma.Decimal('2500'),
                        isStockTracked: true,
                        stockQuantity: 2,
                        lowStockThreshold: 3,
                        sortOrder: 0,
                        isAvailable: true,
                        createdAt: new Date('2026-04-19T00:00:00.000Z'),
                        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                        storeTypes: [],
                        optionGroups: [
                            {
                                id: 'group_active',
                                menuItemId: 'item_active',
                                name: 'Choose noodle type',
                                description: null,
                                kind: client_1.ItemOptionGroupKind.VARIANT_SELECTOR,
                                minSelect: 1,
                                maxSelect: 1,
                                sortOrder: 0,
                                isActive: true,
                                createdAt: new Date('2026-04-19T00:00:00.000Z'),
                                updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                                options: [
                                    {
                                        id: 'option_active',
                                        groupId: 'group_active',
                                        name: 'Thin rice noodle',
                                        priceDelta: new client_1.Prisma.Decimal('0'),
                                        isStockTracked: true,
                                        stockQuantity: 2,
                                        lowStockThreshold: 2,
                                        sortOrder: 0,
                                        isActive: true,
                                        createdAt: new Date('2026-04-19T00:00:00.000Z'),
                                        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                                    },
                                    {
                                        id: 'option_inactive',
                                        groupId: 'group_active',
                                        name: 'Thick rice noodle',
                                        priceDelta: new client_1.Prisma.Decimal('500'),
                                        isStockTracked: true,
                                        stockQuantity: 0,
                                        lowStockThreshold: 1,
                                        sortOrder: 1,
                                        isActive: false,
                                        createdAt: new Date('2026-04-19T00:00:00.000Z'),
                                        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                                    },
                                ],
                            },
                            {
                                id: 'group_inactive',
                                menuItemId: 'item_active',
                                name: 'Hidden group',
                                description: null,
                                kind: client_1.ItemOptionGroupKind.ADD_ON,
                                minSelect: 0,
                                maxSelect: 1,
                                sortOrder: 1,
                                isActive: false,
                                createdAt: new Date('2026-04-19T00:00:00.000Z'),
                                updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                                options: [],
                            },
                        ],
                        variantCombinations: [
                            {
                                id: 'combo_active',
                                menuItemId: 'item_active',
                                name: 'Thin rice noodle',
                                sku: 'SKU-MOHINGA-THIN',
                                signature: 'option_active',
                                isStockTracked: true,
                                stockQuantity: 2,
                                lowStockThreshold: 2,
                                sortOrder: 0,
                                isActive: true,
                                createdAt: new Date('2026-04-19T00:00:00.000Z'),
                                updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                                optionLinks: [
                                    {
                                        combinationId: 'combo_active',
                                        itemOptionId: 'option_active',
                                        itemOption: {
                                            id: 'option_active',
                                            name: 'Thin rice noodle',
                                            sortOrder: 0,
                                            isActive: true,
                                            group: {
                                                id: 'group_active',
                                                name: 'Choose noodle type',
                                                sortOrder: 0,
                                                isActive: true,
                                            },
                                        },
                                    },
                                ],
                            },
                            {
                                id: 'combo_inactive',
                                menuItemId: 'item_active',
                                name: 'Thick rice noodle',
                                sku: 'SKU-MOHINGA-THICK',
                                signature: 'option_inactive',
                                isStockTracked: true,
                                stockQuantity: 0,
                                lowStockThreshold: 1,
                                sortOrder: 1,
                                isActive: false,
                                createdAt: new Date('2026-04-19T00:00:00.000Z'),
                                updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                                optionLinks: [
                                    {
                                        combinationId: 'combo_inactive',
                                        itemOptionId: 'option_inactive',
                                        itemOption: {
                                            id: 'option_inactive',
                                            name: 'Thick rice noodle',
                                            sortOrder: 1,
                                            isActive: false,
                                            group: {
                                                id: 'group_active',
                                                name: 'Choose noodle type',
                                                sortOrder: 0,
                                                isActive: true,
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 'item_unavailable',
                        branchId: 'branch_1',
                        categoryId: 'cat_active',
                        name: 'Unavailable dish',
                        description: null,
                        imageUrl: null,
                        imageUrlsJson: null,
                        sku: null,
                        barcode: null,
                        brand: null,
                        attributesJson: null,
                        basePrice: new client_1.Prisma.Decimal('3000'),
                        isStockTracked: false,
                        stockQuantity: null,
                        lowStockThreshold: null,
                        sortOrder: 1,
                        isAvailable: false,
                        createdAt: new Date('2026-04-19T00:00:00.000Z'),
                        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                        storeTypes: [],
                        optionGroups: [],
                        variantCombinations: [],
                    },
                ],
            },
            {
                id: 'cat_inactive',
                branchId: 'branch_1',
                name: 'Archived',
                description: null,
                sortOrder: 1,
                isActive: false,
                createdAt: new Date('2026-04-19T00:00:00.000Z'),
                updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                storeTypes: [],
                menuItems: [],
            },
            {
                id: 'cat_pharmacy',
                branchId: 'branch_1',
                name: 'Health',
                description: null,
                sortOrder: 2,
                isActive: true,
                createdAt: new Date('2026-04-19T00:00:00.000Z'),
                updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                storeTypes: [
                    {
                        categoryId: 'cat_pharmacy',
                        storeTypeId: 'store_type_pharmacy',
                        storeType: {
                            id: 'store_type_pharmacy',
                            code: 'pharmacy',
                            name: 'Pharmacy',
                            sortOrder: 20,
                        },
                    },
                ],
                menuItems: [
                    {
                        id: 'item_pharmacy',
                        branchId: 'branch_1',
                        categoryId: 'cat_pharmacy',
                        name: 'Vitamin C',
                        description: null,
                        imageUrl: null,
                        imageUrlsJson: null,
                        sku: null,
                        barcode: null,
                        brand: null,
                        attributesJson: null,
                        basePrice: new client_1.Prisma.Decimal('5000'),
                        isStockTracked: false,
                        stockQuantity: null,
                        lowStockThreshold: null,
                        sortOrder: 0,
                        isAvailable: true,
                        createdAt: new Date('2026-04-19T00:00:00.000Z'),
                        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                        storeTypes: [],
                        optionGroups: [],
                        variantCombinations: [],
                    },
                ],
            },
        ],
        menuItems: [
            {
                id: 'uncat_active',
                branchId: 'branch_1',
                categoryId: null,
                name: 'Tea',
                description: null,
                imageUrl: null,
                imageUrlsJson: null,
                sku: null,
                barcode: null,
                brand: null,
                attributesJson: null,
                basePrice: new client_1.Prisma.Decimal('800'),
                isStockTracked: false,
                stockQuantity: null,
                lowStockThreshold: null,
                sortOrder: 0,
                isAvailable: true,
                createdAt: new Date('2026-04-19T00:00:00.000Z'),
                updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                storeTypes: [],
                optionGroups: [],
                variantCombinations: [],
            },
            {
                id: 'uncat_unavailable',
                branchId: 'branch_1',
                categoryId: null,
                name: 'Hidden tea',
                description: null,
                imageUrl: null,
                imageUrlsJson: null,
                sku: null,
                barcode: null,
                brand: null,
                attributesJson: null,
                basePrice: new client_1.Prisma.Decimal('1000'),
                isStockTracked: true,
                stockQuantity: 0,
                lowStockThreshold: 2,
                sortOrder: 1,
                isAvailable: false,
                createdAt: new Date('2026-04-19T00:00:00.000Z'),
                updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                storeTypes: [],
                optionGroups: [],
                variantCombinations: [],
            },
            {
                id: 'uncat_pharmacy',
                branchId: 'branch_1',
                categoryId: null,
                name: 'Pain Relief',
                description: null,
                imageUrl: null,
                imageUrlsJson: null,
                sku: null,
                barcode: null,
                brand: null,
                attributesJson: null,
                basePrice: new client_1.Prisma.Decimal('3500'),
                isStockTracked: false,
                stockQuantity: null,
                lowStockThreshold: null,
                sortOrder: 2,
                isAvailable: true,
                createdAt: new Date('2026-04-19T00:00:00.000Z'),
                updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                storeTypes: [
                    {
                        itemId: 'uncat_pharmacy',
                        storeTypeId: 'store_type_pharmacy',
                        storeType: {
                            id: 'store_type_pharmacy',
                            code: 'pharmacy',
                            name: 'Pharmacy',
                            sortOrder: 20,
                        },
                    },
                ],
                optionGroups: [],
                variantCombinations: [],
            },
        ],
        operatingHours: null,
        staffAssignments: [],
        ...overrides,
    });
    it('keeps inactive catalog nodes when activeOnly is disabled', () => {
        const catalog = (0, branch_catalog_entity_1.buildBranchCatalog)(makeBranchCatalogRecord());
        expect(catalog.categories).toHaveLength(3);
        expect(catalog.categories[0].items).toHaveLength(2);
        expect(catalog.categories[0].items[0].optionGroups).toHaveLength(2);
        expect(catalog.categories[0].items[0].optionGroups[0].options).toHaveLength(2);
        expect(catalog.uncategorizedItems).toHaveLength(3);
        expect(catalog.approvedStoreTypes).toHaveLength(2);
    });
    it('filters inactive and unavailable nodes when activeOnly is enabled', () => {
        const catalog = (0, branch_catalog_entity_1.buildBranchCatalog)(makeBranchCatalogRecord(), {
            activeOnly: true,
        });
        expect(catalog.categories).toHaveLength(2);
        expect(catalog.categories[0].categoryId).toBe('cat_active');
        expect(catalog.categories[0].items).toHaveLength(1);
        expect(catalog.categories[0].items[0].itemId).toBe('item_active');
        expect(catalog.categories[0].items[0].basePrice).toBe('2500');
        expect(catalog.categories[0].items[0]).toMatchObject({
            imageUrls: ['https://cdn.example.com/products/mohinga-front.png'],
            sku: 'SKU-MOHINGA-1',
            barcode: '8851234567890',
            brand: 'Tea House',
            attributes: {
                cuisine: 'Myanmar',
                portion: 'regular',
            },
            isStockTracked: true,
            stockQuantity: 2,
            lowStockThreshold: 3,
            isInStock: true,
            isLowStock: true,
        });
        expect(catalog.categories[0].items[0].optionGroups).toHaveLength(1);
        expect(catalog.categories[0].items[0].optionGroups[0].optionGroupId).toBe('group_active');
        expect(catalog.categories[0].items[0].optionGroups[0].kind).toBe(client_1.ItemOptionGroupKind.VARIANT_SELECTOR);
        expect(catalog.categories[0].items[0].optionGroups[0].options).toEqual([
            expect.objectContaining({
                optionId: 'option_active',
                priceDelta: '0',
                isStockTracked: true,
                stockQuantity: 2,
                lowStockThreshold: 2,
                isInStock: true,
                isLowStock: true,
            }),
        ]);
        expect(catalog.categories[0].items[0].variantCombinations).toEqual([
            expect.objectContaining({
                combinationId: 'combo_active',
                sku: 'SKU-MOHINGA-THIN',
                isStockTracked: true,
                stockQuantity: 2,
                lowStockThreshold: 2,
                isInStock: true,
                isLowStock: true,
            }),
        ]);
        expect(catalog.categories[1]).toMatchObject({
            categoryId: 'cat_pharmacy',
            scopedStoreTypes: [
                expect.objectContaining({
                    code: 'pharmacy',
                }),
            ],
        });
        expect(catalog.categories[1].items).toHaveLength(1);
        expect(catalog.categories[1].items[0].itemId).toBe('item_pharmacy');
        expect(catalog.uncategorizedItems).toEqual([
            expect.objectContaining({
                itemId: 'uncat_active',
                basePrice: '800',
            }),
            expect.objectContaining({
                itemId: 'uncat_pharmacy',
                basePrice: '3500',
                scopedStoreTypes: [
                    expect.objectContaining({
                        code: 'pharmacy',
                    }),
                ],
            }),
        ]);
    });
    it('filters scoped categories and items for a selected store type', () => {
        const catalog = (0, branch_catalog_entity_1.buildBranchCatalog)(makeBranchCatalogRecord(), {
            activeOnly: true,
            storeTypeCode: 'pharmacy',
        });
        expect(catalog.categories.map((category) => category.categoryId)).toEqual([
            'cat_active',
            'cat_pharmacy',
        ]);
        expect(catalog.uncategorizedItems.map((item) => item.itemId)).toEqual([
            'uncat_active',
            'uncat_pharmacy',
        ]);
        expect(catalog.categories.find((category) => category.categoryId === 'cat_pharmacy')
            ?.scopedStoreTypes).toEqual([
            expect.objectContaining({
                code: 'pharmacy',
            }),
        ]);
    });
});
//# sourceMappingURL=branch-catalog.entity.spec.js.map
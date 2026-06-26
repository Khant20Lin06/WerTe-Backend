"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBranchOwnershipRecord = makeBranchOwnershipRecord;
exports.makeMenuCategoryOwnershipRecord = makeMenuCategoryOwnershipRecord;
exports.makeMenuItemOwnershipRecord = makeMenuItemOwnershipRecord;
exports.makeItemOptionGroupOwnershipRecord = makeItemOptionGroupOwnershipRecord;
exports.makeItemOptionOwnershipRecord = makeItemOptionOwnershipRecord;
const client_1 = require("@prisma/client");
function makeBranchOwnershipRecord(overrides) {
    return {
        id: 'branch_1',
        merchantId: 'merchant_1',
        name: 'Downtown Branch',
        contactPhone: '0942000000',
        line1: 'No. 10, Merchant Street',
        township: 'Botahtaung',
        latitude: new client_1.Prisma.Decimal('16.7792'),
        longitude: new client_1.Prisma.Decimal('96.1735'),
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
    };
}
function makeMenuCategoryOwnershipRecord(overrides) {
    return {
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
    };
}
function makeMenuItemOwnershipRecord(overrides) {
    return {
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
    };
}
function makeItemOptionGroupOwnershipRecord(overrides) {
    return {
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
        menuItem: makeMenuItemOwnershipRecord(),
        ...overrides,
    };
}
function makeItemOptionOwnershipRecord(overrides) {
    return {
        id: 'option_1',
        groupId: 'group_1',
        name: 'Thin rice noodle',
        priceDelta: new client_1.Prisma.Decimal('500'),
        isStockTracked: false,
        stockQuantity: null,
        lowStockThreshold: null,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        group: makeItemOptionGroupOwnershipRecord(),
        ...overrides,
    };
}
//# sourceMappingURL=menu-catalog-policy.fixture.js.map
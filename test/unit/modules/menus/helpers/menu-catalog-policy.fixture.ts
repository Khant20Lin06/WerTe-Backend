import {
  BranchStatus,
  ItemOptionGroupKind,
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { BranchOwnershipRecord } from '../../../../../src/modules/branches/entities/branch-ownership.entity';
import { ItemOptionGroupOwnershipRecord } from '../../../../../src/modules/menus/entities/item-option-group-ownership.entity';
import { ItemOptionOwnershipRecord } from '../../../../../src/modules/menus/entities/item-option-ownership.entity';
import { MenuCategoryOwnershipRecord } from '../../../../../src/modules/menus/entities/menu-category-ownership.entity';
import { MenuItemOwnershipRecord } from '../../../../../src/modules/menus/entities/menu-item-ownership.entity';

export function makeBranchOwnershipRecord(
  overrides?: Partial<BranchOwnershipRecord>,
): BranchOwnershipRecord {
  return {
    id: 'branch_1',
    merchantId: 'merchant_1',
    name: 'Downtown Branch',
    contactPhone: '0942000000',
    line1: 'No. 10, Merchant Street',
    township: 'Botahtaung',
    latitude: new Prisma.Decimal('16.7792'),
    longitude: new Prisma.Decimal('96.1735'),
    storeType: 'restaurant',
    primaryStoreTypeId: 'store_type_restaurant',
    status: BranchStatus.ACTIVE,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    merchant: {
      id: 'merchant_1',
      userId: 'usr_merchant_1',
      name: 'Tea House',
      storeType: 'restaurant',
      status: MerchantStatus.ACTIVE,
      user: {
        id: 'usr_merchant_1',
        phone: '0999999999',
        role: UserRole.MERCHANT,
        status: UserStatus.ACTIVE,
      },
    },
    branchZones: [],
    ...overrides,
  };
}

export function makeMenuCategoryOwnershipRecord(
  overrides?: Partial<MenuCategoryOwnershipRecord>,
): MenuCategoryOwnershipRecord {
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
          role: UserRole.MERCHANT,
          status: UserStatus.ACTIVE,
        },
      },
    },
    storeTypes: [],
    ...overrides,
  };
}

export function makeMenuItemOwnershipRecord(
  overrides?: Partial<MenuItemOwnershipRecord>,
): MenuItemOwnershipRecord {
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
    basePrice: new Prisma.Decimal('2500'),
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
          role: UserRole.MERCHANT,
          status: UserStatus.ACTIVE,
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

export function makeItemOptionGroupOwnershipRecord(
  overrides?: Partial<ItemOptionGroupOwnershipRecord>,
): ItemOptionGroupOwnershipRecord {
  return {
    id: 'group_1',
    menuItemId: 'item_1',
    name: 'Choose noodle type',
    description: 'Required selection',
    kind: ItemOptionGroupKind.ADD_ON,
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

export function makeItemOptionOwnershipRecord(
  overrides?: Partial<ItemOptionOwnershipRecord>,
): ItemOptionOwnershipRecord {
  return {
    id: 'option_1',
    groupId: 'group_1',
    name: 'Thin rice noodle',
    priceDelta: new Prisma.Decimal('500'),
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

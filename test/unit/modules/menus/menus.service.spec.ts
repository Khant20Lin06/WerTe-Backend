import {
  BranchStatus,
  ItemOptionGroupKind,
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { BranchCatalogRecord } from '../../../../src/modules/menus/entities/branch-catalog.entity';
import { MenuCategoryOwnershipRecord } from '../../../../src/modules/menus/entities/menu-category-ownership.entity';
import { MenuItemOwnershipRecord } from '../../../../src/modules/menus/entities/menu-item-ownership.entity';
import { MenusRepository } from '../../../../src/modules/menus/repositories/menus.repository';
import { MenusService } from '../../../../src/modules/menus/services/menus.service';

describe('MenusService', () => {
  const makeCategory = (
    overrides?: Partial<MenuCategoryOwnershipRecord>,
  ): MenuCategoryOwnershipRecord => ({
    id: 'cat_1',
    branchId: 'branch_1',
    name: 'Popular',
    description: 'Most ordered menu items',
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
  });

  const makeItem = (overrides?: Partial<MenuItemOwnershipRecord>): MenuItemOwnershipRecord => ({
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
  });

  it('builds menu category ownership with merchant branch context', () => {
    const repository = {} as MenusRepository;
    const service = new MenusService(repository);

    const ownership = service.buildCategoryOwnership(makeCategory());

    expect(ownership).toEqual({
      categoryId: 'cat_1',
      branchId: 'branch_1',
      merchantId: 'merchant_1',
      merchantUserId: 'usr_merchant_1',
      phone: '0999999999',
      role: UserRole.MERCHANT,
      userStatus: UserStatus.ACTIVE,
      name: 'Popular',
      description: 'Most ordered menu items',
      sortOrder: 1,
      isActive: true,
      storeTypes: [],
    });
  });

  it('returns null when the menu item is not owned by the merchant user', async () => {
    const repository = {
      findItemById: jest.fn().mockResolvedValue(makeItem()),
    } as unknown as MenusRepository;
    const service = new MenusService(repository);

    const item = await service.findItemOwnedByUserId('usr_merchant_2', 'item_1');

    expect(item).toBeNull();
  });

  it('builds active-only branch catalog by filtering inactive catalog nodes', () => {
    const repository = {} as MenusRepository;
    const service = new MenusService(repository);
    const branchCatalog: BranchCatalogRecord = {
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
        name: 'Tea House',
        status: MerchantStatus.ACTIVE,
        user: {
          id: 'usr_merchant_1',
          phone: '0999999999',
          role: UserRole.MERCHANT,
          status: UserStatus.ACTIVE,
        },
      },
      storeTypes: [],
      menuCategories: [
        {
          id: 'cat_1',
          branchId: 'branch_1',
          name: 'Popular',
          description: null,
          sortOrder: 1,
          isActive: true,
          createdAt: new Date('2026-04-19T00:00:00.000Z'),
          updatedAt: new Date('2026-04-19T00:00:00.000Z'),
          storeTypes: [],
          menuItems: [
            {
              id: 'item_1',
              branchId: 'branch_1',
              categoryId: 'cat_1',
              name: 'Mohinga',
              description: null,
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
              storeTypes: [],
              optionGroups: [
                {
                  id: 'grp_1',
                  menuItemId: 'item_1',
                  name: 'Size',
                  description: null,
                  kind: ItemOptionGroupKind.VARIANT_SELECTOR,
                  minSelect: 1,
                  maxSelect: 1,
                  sortOrder: 1,
                  isActive: true,
                  createdAt: new Date('2026-04-19T00:00:00.000Z'),
                  updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                  options: [
                    {
                      id: 'opt_1',
                      groupId: 'grp_1',
                      name: 'Regular',
                      priceDelta: new Prisma.Decimal('0'),
                      isStockTracked: false,
                      stockQuantity: null,
                      lowStockThreshold: null,
                      sortOrder: 1,
                      isActive: true,
                      createdAt: new Date('2026-04-19T00:00:00.000Z'),
                      updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                    },
                    {
                      id: 'opt_2',
                      groupId: 'grp_1',
                      name: 'Large',
                      priceDelta: new Prisma.Decimal('500'),
                      isStockTracked: true,
                      stockQuantity: 0,
                      lowStockThreshold: 1,
                      sortOrder: 2,
                      isActive: false,
                      createdAt: new Date('2026-04-19T00:00:00.000Z'),
                      updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                    },
                  ],
                },
                {
                  id: 'grp_2',
                  menuItemId: 'item_1',
                  name: 'Hidden',
                  description: null,
                  kind: ItemOptionGroupKind.ADD_ON,
                  minSelect: 0,
                  maxSelect: 1,
                  sortOrder: 2,
                  isActive: false,
                  createdAt: new Date('2026-04-19T00:00:00.000Z'),
                  updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                  options: [],
                },
              ],
              variantCombinations: [
                {
                  id: 'combo_1',
                  menuItemId: 'item_1',
                  name: 'Regular',
                  sku: 'SKU-MOHINGA-REGULAR',
                  signature: 'opt_1',
                  isStockTracked: false,
                  stockQuantity: null,
                  lowStockThreshold: null,
                  sortOrder: 1,
                  isActive: true,
                  createdAt: new Date('2026-04-19T00:00:00.000Z'),
                  updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                  optionLinks: [
                    {
                      combinationId: 'combo_1',
                      itemOptionId: 'opt_1',
                      itemOption: {
                        id: 'opt_1',
                        name: 'Regular',
                        sortOrder: 1,
                        isActive: true,
                        group: {
                          id: 'grp_1',
                          name: 'Size',
                          sortOrder: 1,
                          isActive: true,
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: 'item_2',
              branchId: 'branch_1',
              categoryId: 'cat_1',
              name: 'Unavailable Item',
              description: null,
              imageUrl: null,
              imageUrlsJson: null,
              sku: null,
              barcode: null,
              brand: null,
              attributesJson: null,
              basePrice: new Prisma.Decimal('3000'),
              isStockTracked: false,
              stockQuantity: null,
              lowStockThreshold: null,
              sortOrder: 2,
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
          id: 'cat_2',
          branchId: 'branch_1',
          name: 'Hidden Category',
          description: null,
          sortOrder: 2,
          isActive: false,
          createdAt: new Date('2026-04-19T00:00:00.000Z'),
          updatedAt: new Date('2026-04-19T00:00:00.000Z'),
          storeTypes: [],
          menuItems: [],
        },
      ],
      menuItems: [
        {
          id: 'item_3',
          branchId: 'branch_1',
          categoryId: null,
          name: 'Uncategorized Active Item',
          description: null,
          imageUrl: null,
          imageUrlsJson: null,
          sku: null,
          barcode: null,
          brand: null,
          attributesJson: null,
          basePrice: new Prisma.Decimal('1800'),
          isStockTracked: false,
          stockQuantity: null,
          lowStockThreshold: null,
          sortOrder: 1,
          isAvailable: true,
          createdAt: new Date('2026-04-19T00:00:00.000Z'),
          updatedAt: new Date('2026-04-19T00:00:00.000Z'),
          storeTypes: [],
          optionGroups: [],
          variantCombinations: [],
        },
        {
          id: 'item_4',
          branchId: 'branch_1',
          categoryId: null,
          name: 'Uncategorized Hidden Item',
          description: null,
          imageUrl: null,
          imageUrlsJson: null,
          sku: null,
          barcode: null,
          brand: null,
          attributesJson: null,
          basePrice: new Prisma.Decimal('1900'),
          isStockTracked: false,
          stockQuantity: null,
          lowStockThreshold: null,
          sortOrder: 2,
          isAvailable: false,
          createdAt: new Date('2026-04-19T00:00:00.000Z'),
          updatedAt: new Date('2026-04-19T00:00:00.000Z'),
          storeTypes: [],
          optionGroups: [],
          variantCombinations: [],
        },
      ],
      operatingHours: null,
      staffAssignments: [],
    };

    const catalog = service.buildBranchCatalog(branchCatalog, {
      activeOnly: true,
    });

    expect(catalog.categories).toHaveLength(1);
    expect(catalog.categories[0].items).toHaveLength(1);
    expect(catalog.categories[0].items[0].optionGroups).toHaveLength(1);
    expect(catalog.categories[0].items[0].optionGroups[0].options).toHaveLength(1);
    expect(catalog.uncategorizedItems).toHaveLength(1);
  });
});

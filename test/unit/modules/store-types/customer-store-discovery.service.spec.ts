import { HttpStatus } from '@nestjs/common';
import {
  BranchStatus,
  BranchStoreTypeStatus,
  MerchantStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { BranchCatalogEntity } from '../../../../src/modules/menus/entities/branch-catalog.entity';
import { CustomerCatalogReadService } from '../../../../src/modules/menus/services/customer-catalog-read.service';
import { CustomerStoreDiscoveryRecord } from '../../../../src/modules/store-types/entities/customer-store-discovery.entity';
import { StoreTypesRepository } from '../../../../src/modules/store-types/repositories/store-types.repository';
import { CustomerStoreDiscoveryService } from '../../../../src/modules/store-types/services/customer-store-discovery.service';
import { CustomerStoreSortBy } from '../../../../src/modules/store-types/dto/list-customer-stores-query.dto';

describe('CustomerStoreDiscoveryService', () => {
  const customerUser: AuthenticatedUserEntity = {
    userId: 'usr_customer_1',
    sessionId: 'session_1',
    role: UserRole.CUSTOMER,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_customer_1',
      phone: '09111111111',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfileId: 'customer_profile_1',
    },
  };

  const merchantUser: AuthenticatedUserEntity = {
    userId: 'usr_merchant_1',
    sessionId: 'session_2',
    role: UserRole.MERCHANT,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_merchant_1',
      phone: '0999999999',
      role: UserRole.MERCHANT,
      status: UserStatus.ACTIVE,
      merchantId: 'merchant_1',
    },
  };

  const makeDiscoveryBranch = (
    overrides?: Partial<CustomerStoreDiscoveryRecord>,
  ): CustomerStoreDiscoveryRecord => ({
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
    status: BranchStatus.ACTIVE,
    createdAt: new Date('2026-04-30T00:00:00.000Z'),
    updatedAt: new Date('2026-04-30T00:00:00.000Z'),
    merchant: {
      id: 'merchant_1',
      name: 'City Mart',
      status: MerchantStatus.ACTIVE,
    },
    operatingHours: null,
    storeTypes: [
      {
        branchId: 'branch_1',
        storeTypeId: 'store_type_grocery',
        status: BranchStoreTypeStatus.APPROVED,
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
        status: BranchStoreTypeStatus.APPROVED,
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

  const makeVisibleBranchCatalog = (
    overrides?: Partial<BranchCatalogEntity>,
  ): BranchCatalogEntity => ({
    branchId: 'branch_1',
    merchantId: 'merchant_1',
    merchantUserId: 'usr_merchant_1',
    branchName: 'Downtown Branch',
    township: 'Kamaryut',
    branchStatus: BranchStatus.ACTIVE,
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
    } as unknown as jest.Mocked<StoreTypesRepository>;
    const service = new CustomerStoreDiscoveryService(
      storeTypesRepository,
      {} as CustomerCatalogReadService,
    );

    const result = await service.listDiscoverableStores(customerUser, {
      storeTypeCode: 'Grocery',
      storeTypeCodes: ['pharmacy'],
      township: 'Kamaryut',
      keyword: 'city',
      sortBy: CustomerStoreSortBy.NAME_ASC,
    });

    expect(storeTypesRepository.listCustomerDiscoverableBranches).toHaveBeenCalledWith(
      {
        branchId: undefined,
        merchantId: undefined,
        storeTypeCodes: ['grocery', 'pharmacy'],
        township: 'Kamaryut',
        keyword: 'city',
      },
    );
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
    } as unknown as jest.Mocked<StoreTypesRepository>;
    const service = new CustomerStoreDiscoveryService(
      storeTypesRepository,
      {} as CustomerCatalogReadService,
    );

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
            status: MerchantStatus.ACTIVE,
          },
        }),
        makeDiscoveryBranch({
          id: 'branch_1',
          name: 'Beta Branch',
          township: 'Kamaryut',
          merchant: {
            id: 'merchant_1',
            name: 'Beta Market',
            status: MerchantStatus.ACTIVE,
          },
        }),
      ]),
    } as unknown as jest.Mocked<StoreTypesRepository>;
    const service = new CustomerStoreDiscoveryService(
      storeTypesRepository,
      {} as CustomerCatalogReadService,
    );

    const result = await service.listDiscoverableStores(customerUser, {
      sortBy: CustomerStoreSortBy.TOWNSHIP_DESC,
    });

    expect(result.map((store) => store.branchName)).toEqual([
      'Beta Branch',
      'Alpha Branch',
    ]);
  });

  it('filters out branches that somehow have no approved active store types', async () => {
    const service = new CustomerStoreDiscoveryService({
      listCustomerDiscoverableBranches: jest.fn().mockResolvedValue([
        makeDiscoveryBranch({
          id: 'branch_2',
          storeTypes: [],
        }),
      ]),
    } as unknown as StoreTypesRepository, {} as CustomerCatalogReadService);

    await expect(service.listDiscoverableStores(customerUser, {})).resolves.toEqual(
      [],
    );
  });

  it('returns store detail with catalog entry options and visible catalog counts', async () => {
    const storeTypesRepository = {
      listCustomerDiscoverableBranches: jest
        .fn()
        .mockResolvedValue([makeDiscoveryBranch()]),
    } as unknown as jest.Mocked<StoreTypesRepository>;
    const customerCatalogReadService = {
      getVisibleBranchCatalogOrThrow: jest
        .fn()
        .mockResolvedValue(makeVisibleBranchCatalog()),
    } as unknown as jest.Mocked<CustomerCatalogReadService>;
    const service = new CustomerStoreDiscoveryService(
      storeTypesRepository,
      customerCatalogReadService,
    );

    const result = await service.getDiscoverableStoreDetail(
      customerUser,
      'branch_1',
    );

    expect(storeTypesRepository.listCustomerDiscoverableBranches).toHaveBeenCalledWith(
      {
        branchId: 'branch_1',
        merchantId: undefined,
        storeTypeCodes: undefined,
        township: undefined,
        keyword: undefined,
      },
    );
    expect(
      customerCatalogReadService.getVisibleBranchCatalogOrThrow,
    ).toHaveBeenCalledWith('branch_1');
    expect(result).toMatchObject({
      branchId: 'branch_1',
      branchName: 'Downtown Branch',
      merchantId: 'merchant_1',
      merchantName: 'City Mart',
      branchStatus: BranchStatus.ACTIVE,
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
    } as unknown as jest.Mocked<StoreTypesRepository>;
    const customerCatalogReadService = {
      getVisibleBranchCatalogOrThrow: jest
        .fn()
        .mockResolvedValue(makeVisibleBranchCatalog()),
    } as unknown as jest.Mocked<CustomerCatalogReadService>;
    const service = new CustomerStoreDiscoveryService(
      storeTypesRepository,
      customerCatalogReadService,
    );

    const result = await service.getDiscoverableStoreCatalogEntry(
      customerUser,
      'branch_1',
      {
        storeTypeCode: 'Pharmacy',
      },
    );

    expect(result.selectedCatalogEntry).toEqual({
      storeType: {
        id: 'store_type_pharmacy',
        code: 'pharmacy',
        name: 'Pharmacy',
        sortOrder: 20,
      },
      isPrimary: false,
    });
    expect(
      customerCatalogReadService.getVisibleBranchCatalogOrThrow,
    ).toHaveBeenCalledWith('branch_1', {
      storeTypeCode: 'pharmacy',
    });
    expect(result.catalog.branchId).toBe('branch_1');
    expect(result.store.visibleItemCount).toBe(2);
  });

  it('rejects catalog entry requests for store types the branch does not expose', async () => {
    const service = new CustomerStoreDiscoveryService(
      {
        listCustomerDiscoverableBranches: jest
          .fn()
          .mockResolvedValue([makeDiscoveryBranch()]),
      } as unknown as StoreTypesRepository,
      {
        getVisibleBranchCatalogOrThrow: jest
          .fn()
          .mockResolvedValue(makeVisibleBranchCatalog()),
      } as unknown as CustomerCatalogReadService,
    );

    await expect(
      service.getDiscoverableStoreCatalogEntry(customerUser, 'branch_1', {
        storeTypeCode: 'beauty',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
      response: expect.objectContaining({
        code: ErrorCodes.notFound,
      }),
    });
  });

  it('rejects non-customer actors from customer discovery surface', async () => {
    const service = new CustomerStoreDiscoveryService(
      {} as StoreTypesRepository,
      {} as CustomerCatalogReadService,
    );

    await expect(service.listDiscoverableStores(merchantUser, {})).rejects.toMatchObject(
      {
        status: HttpStatus.FORBIDDEN,
        response: expect.objectContaining({
          code: ErrorCodes.forbidden,
        }),
      },
    );
  });
});

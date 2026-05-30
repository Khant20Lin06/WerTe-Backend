import { HttpStatus } from '@nestjs/common';
import {
  BranchStatus,
  BranchStoreTypeStatus,
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { AuditService } from '../../../../src/modules/audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { BranchOwnershipRecord } from '../../../../src/modules/branches/entities/branch-ownership.entity';
import { BranchesService } from '../../../../src/modules/branches/services/branches.service';
import { NotificationEventService } from '../../../../src/modules/notifications/services/notification-event.service';
import { MenuCategoryOwnershipRecord } from '../../../../src/modules/menus/entities/menu-category-ownership.entity';
import { MenuItemOwnershipRecord } from '../../../../src/modules/menus/entities/menu-item-ownership.entity';
import { MenuItemPolicyService } from '../../../../src/modules/menus/policies/menu-item-policy.service';
import { MenusRepository } from '../../../../src/modules/menus/repositories/menus.repository';
import { MerchantMenuItemsService } from '../../../../src/modules/menus/services/merchant-menu-items.service';
import { MenusService } from '../../../../src/modules/menus/services/menus.service';

describe('MerchantMenuItemsService', () => {
  const currentUser: AuthenticatedUserEntity = {
    userId: 'usr_merchant_1',
    sessionId: 'session_1',
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

  const makeBranch = (
    overrides?: Partial<BranchOwnershipRecord>,
  ): BranchOwnershipRecord => ({
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
  });

  const makeCategory = (
    overrides?: Partial<MenuCategoryOwnershipRecord>,
  ): MenuCategoryOwnershipRecord => ({
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
  });

  const makeItem = (
    overrides?: Partial<MenuItemOwnershipRecord>,
  ): MenuItemOwnershipRecord => ({
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

  const makeApprovedStoreTypeAssignment = (overrides?: {
    storeTypeId?: string;
    code?: string;
    name?: string;
    sortOrder?: number;
    isPrimary?: boolean;
  }) => ({
    branchId: 'branch_1',
    storeTypeId: overrides?.storeTypeId ?? 'store_type_restaurant',
    status: BranchStoreTypeStatus.APPROVED,
    isPrimary: overrides?.isPrimary ?? true,
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
      id: overrides?.storeTypeId ?? 'store_type_restaurant',
      code: overrides?.code ?? 'restaurant',
      name: overrides?.name ?? 'Restaurant',
      sortOrder: overrides?.sortOrder ?? 10,
    },
  });

  const prismaService = {
    runInTransaction: jest.fn(async (callback: (tx: object) => Promise<unknown>) =>
      callback({}),
    ),
  } as unknown as PrismaService;

  const makeAuditService = () =>
    ({
      logAction: jest.fn().mockResolvedValue({}),
    }) as unknown as jest.Mocked<AuditService>;

  const makeNotificationEventService = () =>
    ({
      publishMerchantInventoryAlert: jest.fn().mockResolvedValue(undefined),
    }) as unknown as jest.Mocked<NotificationEventService>;

  it('lists items for a merchant-owned branch', async () => {
    const service = new MerchantMenuItemsService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {
        listItemsByBranchId: jest.fn().mockResolvedValue([makeItem()]),
      } as unknown as MenusService,
      {} as MenusRepository,
      new MenuItemPolicyService(),
      makeAuditService(),
      makeNotificationEventService(),
    );

    await expect(service.listBranchItems(currentUser, 'branch_1')).resolves.toEqual([
      {
        id: 'item_1',
        branchId: 'branch_1',
        categoryId: 'cat_1',
        name: 'Mohinga',
        description: 'Signature breakfast item',
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
        sortOrder: 1,
        isAvailable: true,
        storeTypes: [],
        createdAt: '2026-04-19T00:00:00.000Z',
        updatedAt: '2026-04-19T00:00:00.000Z',
      },
    ]);
  });

  it('assigns the next sort order when creating an item without an explicit sort order', async () => {
    const menusRepository = {
      findHighestItemSortOrderByBranchId: jest
        .fn()
        .mockResolvedValue({ sortOrder: 7 }),
      listApprovedStoreTypesByBranchId: jest
        .fn()
        .mockResolvedValue([
          makeApprovedStoreTypeAssignment({
            storeTypeId: 'store_type_beauty',
            code: 'beauty',
            name: 'Beauty',
          }),
        ]),
      createItem: jest.fn().mockResolvedValue(
        makeItem({
          id: 'item_2',
          categoryId: null,
          name: 'New Item',
          imageUrlsJson: ['https://cdn.example.com/products/new-item.png'],
          sku: 'SKU-NEW-1',
          barcode: '8851234567890',
          brand: 'Glow Lab',
          attributesJson: {
            size: '100ml',
          },
          isStockTracked: true,
          stockQuantity: 12,
          lowStockThreshold: 3,
          sortOrder: 8,
          category: null,
          storeTypes: [
            {
              itemId: 'item_2',
              storeTypeId: 'store_type_beauty',
              storeType: {
                id: 'store_type_beauty',
                code: 'beauty',
                name: 'Beauty',
                sortOrder: 10,
              },
            },
          ],
        }),
      ),
      replaceItemStoreTypes: jest.fn().mockResolvedValue(undefined),
      findItemById: jest.fn().mockResolvedValue(
        makeItem({
          id: 'item_2',
          categoryId: null,
          name: 'New Item',
          imageUrlsJson: ['https://cdn.example.com/products/new-item.png'],
          sku: 'SKU-NEW-1',
          barcode: '8851234567890',
          brand: 'Glow Lab',
          attributesJson: {
            size: '100ml',
          },
          isStockTracked: true,
          stockQuantity: 12,
          lowStockThreshold: 3,
          sortOrder: 8,
          category: null,
          storeTypes: [
            {
              itemId: 'item_2',
              storeTypeId: 'store_type_beauty',
              storeType: {
                id: 'store_type_beauty',
                code: 'beauty',
                name: 'Beauty',
                sortOrder: 10,
              },
            },
          ],
        }),
      ),
    } as unknown as MenusRepository;
    const auditService = makeAuditService();
    const notificationEventService = makeNotificationEventService();
    const service = new MerchantMenuItemsService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {} as MenusService,
      menusRepository,
      new MenuItemPolicyService(),
      auditService,
      makeNotificationEventService(),
    );

    const result = await service.createBranchItem(currentUser, 'branch_1', {
      name: 'New Item',
      basePrice: 3000,
      imageUrls: ['https://cdn.example.com/products/new-item.png'],
      sku: 'SKU-NEW-1',
      barcode: '8851234567890',
      brand: 'Glow Lab',
      attributes: {
        size: '100ml',
      },
      stockQuantity: 12,
      lowStockThreshold: 3,
      storeTypeIds: ['store_type_beauty'],
    });

    expect(menusRepository.createItem).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: 'branch_1',
        categoryId: null,
        name: 'New Item',
        basePrice: 3000,
        imageUrlsJson: ['https://cdn.example.com/products/new-item.png'],
        sku: 'SKU-NEW-1',
        barcode: '8851234567890',
        brand: 'Glow Lab',
        attributesJson: {
          size: '100ml',
        },
        isStockTracked: true,
        stockQuantity: 12,
        lowStockThreshold: 3,
        sortOrder: 8,
        isAvailable: true,
      }),
      expect.anything(),
    );
    expect(menusRepository.replaceItemStoreTypes).toHaveBeenCalledWith(
      'item_2',
      ['store_type_beauty'],
      expect.anything(),
    );
    expect(result.sortOrder).toBe(8);
    expect(result.sku).toBe('SKU-NEW-1');
    expect(result.attributes).toEqual({
      size: '100ml',
    });
    expect(result.isStockTracked).toBe(true);
    expect(result.stockQuantity).toBe(12);
    expect(result.isLowStock).toBe(false);
    expect(result.storeTypes).toEqual([
      {
        id: 'store_type_beauty',
        code: 'beauty',
        name: 'Beauty',
        sortOrder: 10,
      },
    ]);
    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'menu_items.scope_created',
        resourceType: 'MENU_ITEM',
        resourceId: 'item_2',
        branchId: 'branch_1',
      }),
    );
  });

  it('lists effective vertical catalog rule profiles for a merchant-owned branch', async () => {
    const service = new MerchantMenuItemsService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(
          makeBranch({
            storeType: 'grocery',
            primaryStoreTypeId: 'store_type_grocery',
          }),
        ),
      } as unknown as BranchesService,
      {} as MenusService,
      {
        listApprovedStoreTypesByBranchId: jest.fn().mockResolvedValue([
          makeApprovedStoreTypeAssignment({
            storeTypeId: 'store_type_grocery',
            code: 'grocery',
            name: 'Grocery',
            sortOrder: 10,
          }),
          makeApprovedStoreTypeAssignment({
            storeTypeId: 'store_type_beauty',
            code: 'beauty',
            name: 'Beauty',
            sortOrder: 20,
            isPrimary: false,
          }),
        ]),
      } as unknown as MenusRepository,
      new MenuItemPolicyService(),
      makeAuditService(),
      makeNotificationEventService(),
    );

    await expect(
      service.listBranchItemRuleProfiles(currentUser, 'branch_1'),
    ).resolves.toEqual([
      expect.objectContaining({
        storeTypeCode: 'grocery',
        requiredFields: ['sku'],
        requiresStockTracking: true,
        requiredAttributeKeysAnyOf: [
          'unitOfMeasure',
          'weight',
          'weightGrams',
          'volumeMl',
          'packSize',
          'unitCount',
        ],
      }),
      expect.objectContaining({
        storeTypeCode: 'beauty',
        requiredFields: ['sku', 'brand'],
        requiresStockTracking: false,
        requiredAttributeKeysAnyOf: [
          'size',
          'volumeMl',
          'shade',
          'skinType',
          'scent',
        ],
      }),
    ]);
  });

  it('rejects negative inventory quantities before persisting item changes', async () => {
    const menusRepository = {
      findHighestItemSortOrderByBranchId: jest.fn(),
      createItem: jest.fn(),
    } as unknown as MenusRepository;
    const service = new MerchantMenuItemsService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {} as MenusService,
      menusRepository,
      new MenuItemPolicyService(),
      makeAuditService(),
      makeNotificationEventService(),
    );

    await expect(
      service.createBranchItem(currentUser, 'branch_1', {
        name: 'Invalid Stock Item',
        basePrice: 3000,
        stockQuantity: -1,
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
      response: expect.objectContaining({
        code: ErrorCodes.validationFailed,
      }),
    });
    expect(menusRepository.createItem).not.toHaveBeenCalled();
  });

  it('rejects item store type scopes that are not approved for the branch', async () => {
    const menusRepository = {
      findHighestItemSortOrderByBranchId: jest.fn().mockResolvedValue(null),
      listApprovedStoreTypesByBranchId: jest.fn().mockResolvedValue([]),
      createItem: jest.fn(),
      replaceItemStoreTypes: jest.fn(),
      findItemById: jest.fn(),
    } as unknown as MenusRepository;
    const service = new MerchantMenuItemsService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {} as MenusService,
      menusRepository,
      new MenuItemPolicyService(),
      makeAuditService(),
      makeNotificationEventService(),
    );

    await expect(
      service.createBranchItem(currentUser, 'branch_1', {
        name: 'Scoped Item',
        basePrice: 3000,
        storeTypeIds: ['store_type_unknown'],
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
      response: expect.objectContaining({
        code: ErrorCodes.validationFailed,
      }),
    });
    expect(menusRepository.createItem).not.toHaveBeenCalled();
  });

  it('rejects pharmacy-scoped item creation when required vertical metadata is missing', async () => {
    const menusRepository = {
      findHighestItemSortOrderByBranchId: jest.fn().mockResolvedValue(null),
      listApprovedStoreTypesByBranchId: jest.fn().mockResolvedValue([
        makeApprovedStoreTypeAssignment({
          storeTypeId: 'store_type_pharmacy',
          code: 'pharmacy',
          name: 'Pharmacy',
        }),
      ]),
      createItem: jest.fn(),
    } as unknown as MenusRepository;
    const service = new MerchantMenuItemsService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(
          makeBranch({
            storeType: 'pharmacy',
            primaryStoreTypeId: 'store_type_pharmacy',
          }),
        ),
      } as unknown as BranchesService,
      {} as MenusService,
      menusRepository,
      new MenuItemPolicyService(),
      makeAuditService(),
      makeNotificationEventService(),
    );

    await expect(
      service.createBranchItem(currentUser, 'branch_1', {
        name: 'Vitamin C',
        basePrice: 5000,
        storeTypeIds: ['store_type_pharmacy'],
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
      response: expect.objectContaining({
        code: ErrorCodes.validationFailed,
        details: expect.objectContaining({
          effectiveStoreTypeCodes: ['pharmacy'],
        }),
      }),
    });
    expect(menusRepository.createItem).not.toHaveBeenCalled();
  });

  it('rejects item creation when the category does not belong to the requested branch', async () => {
    const service = new MerchantMenuItemsService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {
        findCategoryOwnedByUserId: jest.fn().mockResolvedValue(
          makeCategory({
            branch: {
              id: 'branch_2',
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
          }),
        ),
      } as unknown as MenusService,
      {} as MenusRepository,
      new MenuItemPolicyService(),
      makeAuditService(),
      makeNotificationEventService(),
    );

    await expect(
      service.createBranchItem(currentUser, 'branch_1', {
        categoryId: 'cat_1',
        name: 'Mohinga',
        basePrice: 2500,
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
      response: expect.objectContaining({
        code: ErrorCodes.notFound,
      }),
    });
  });

  it('updates item availability and category linkage within the owning branch', async () => {
    const menusRepository = {
      listApprovedStoreTypesByBranchId: jest.fn().mockResolvedValue([]),
      updateItem: jest.fn().mockResolvedValue(
        makeItem({
          isAvailable: false,
          categoryId: null,
          isStockTracked: false,
          stockQuantity: null,
          lowStockThreshold: null,
          category: null,
        }),
      ),
    } as unknown as MenusRepository;
    const service = new MerchantMenuItemsService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(makeItem()),
      } as unknown as MenusService,
      menusRepository,
      new MenuItemPolicyService(),
      makeAuditService(),
      makeNotificationEventService(),
    );

    const result = await service.updateBranchItem(currentUser, 'branch_1', 'item_1', {
      categoryId: '',
      isAvailable: false,
    });

    expect(menusRepository.updateItem).toHaveBeenCalledWith(
      'item_1',
      expect.objectContaining({
        categoryId: null,
        isAvailable: false,
      }),
      expect.anything(),
    );
    expect(result.categoryId).toBeNull();
    expect(result.isAvailable).toBe(false);
  });

  it('updates tracked stock and exposes low-stock state', async () => {
    const menusRepository = {
      listApprovedStoreTypesByBranchId: jest.fn().mockResolvedValue([]),
      updateItem: jest.fn().mockResolvedValue(
        makeItem({
          isStockTracked: true,
          stockQuantity: 2,
          lowStockThreshold: 3,
        }),
      ),
    } as unknown as MenusRepository;
    const service = new MerchantMenuItemsService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(
          makeItem({
            isStockTracked: false,
            stockQuantity: null,
            lowStockThreshold: null,
          }),
        ),
      } as unknown as MenusService,
      menusRepository,
      new MenuItemPolicyService(),
      makeAuditService(),
      makeNotificationEventService(),
    );

    const result = await service.updateBranchItem(currentUser, 'branch_1', 'item_1', {
      stockQuantity: 2,
      lowStockThreshold: 3,
    });

    expect(menusRepository.updateItem).toHaveBeenCalledWith(
      'item_1',
      expect.objectContaining({
        isStockTracked: true,
        stockQuantity: 2,
        lowStockThreshold: 3,
      }),
      expect.anything(),
    );
    expect(result.isStockTracked).toBe(true);
    expect(result.isInStock).toBe(true);
    expect(result.isLowStock).toBe(true);
  });

  it('rejects updates that break the effective fashion catalog rule set', async () => {
    const menusRepository = {
      listApprovedStoreTypesByBranchId: jest.fn().mockResolvedValue([]),
      updateItem: jest.fn(),
    } as unknown as MenusRepository;
    const service = new MerchantMenuItemsService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(
          makeBranch({
            storeType: 'fashion',
            primaryStoreTypeId: 'store_type_fashion',
          }),
        ),
      } as unknown as BranchesService,
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(
          makeItem({
            sku: 'SKU-TSHIRT-1',
            attributesJson: {
              size: 'M',
            },
            storeTypes: [
              {
                itemId: 'item_1',
                storeTypeId: 'store_type_fashion',
                storeType: {
                  id: 'store_type_fashion',
                  code: 'fashion',
                  name: 'Fashion',
                  sortOrder: 10,
                },
              },
            ],
          }),
        ),
      } as unknown as MenusService,
      menusRepository,
      new MenuItemPolicyService(),
      makeAuditService(),
      makeNotificationEventService(),
    );

    await expect(
      service.updateBranchItem(currentUser, 'branch_1', 'item_1', {
        attributes: {
          origin: 'Myanmar',
        },
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
      response: expect.objectContaining({
        code: ErrorCodes.validationFailed,
        details: expect.objectContaining({
          effectiveStoreTypeCodes: ['fashion'],
        }),
      }),
    });
    expect(menusRepository.updateItem).not.toHaveBeenCalled();
  });

  it('writes a scope audit record when item scope changes', async () => {
    const updatedItem = makeItem({
      sku: 'SKU-CLEANSER-1',
      brand: 'Glow Lab',
      attributesJson: {
        size: '100ml',
      },
      storeTypes: [
        {
          itemId: 'item_1',
          storeTypeId: 'store_type_beauty',
          storeType: {
            id: 'store_type_beauty',
            code: 'beauty',
            name: 'Beauty',
            sortOrder: 10,
          },
        },
      ],
    });
    const menusRepository = {
      updateItem: jest.fn().mockResolvedValue(updatedItem),
      listApprovedStoreTypesByBranchId: jest.fn().mockResolvedValue([
        makeApprovedStoreTypeAssignment({
          storeTypeId: 'store_type_beauty',
          code: 'beauty',
          name: 'Beauty',
        }),
      ]),
      replaceItemStoreTypes: jest.fn().mockResolvedValue(undefined),
      findItemById: jest.fn().mockResolvedValue(updatedItem),
    } as unknown as MenusRepository;
    const auditService = makeAuditService();
    const notificationEventService = makeNotificationEventService();
    const service = new MerchantMenuItemsService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(
          makeItem({
            sku: 'SKU-CLEANSER-1',
            brand: 'Glow Lab',
            attributesJson: {
              size: '100ml',
            },
          }),
        ),
      } as unknown as MenusService,
      menusRepository,
      new MenuItemPolicyService(),
      auditService,
      makeNotificationEventService(),
    );

    await service.updateBranchItem(currentUser, 'branch_1', 'item_1', {
      storeTypeIds: ['store_type_beauty'],
    });

    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'menu_items.scope_updated',
        resourceType: 'MENU_ITEM',
        resourceId: 'item_1',
        branchId: 'branch_1',
      }),
    );
  });

  it('adjusts tracked item inventory and writes an audit record', async () => {
    const menusRepository = {
      countItemInventoryLotsByMenuItemId: jest.fn().mockResolvedValue(0),
      adjustTrackedItemStock: jest.fn().mockResolvedValue(true),
      findItemById: jest.fn().mockResolvedValue(
        makeItem({
          isStockTracked: true,
          stockQuantity: 8,
          lowStockThreshold: 3,
        }),
      ),
    } as unknown as MenusRepository;
    const auditService = makeAuditService();
    const notificationEventService = makeNotificationEventService();
    const service = new MerchantMenuItemsService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(
          makeItem({
            isStockTracked: true,
            stockQuantity: 5,
            lowStockThreshold: 3,
          }),
        ),
      } as unknown as MenusService,
      menusRepository,
      new MenuItemPolicyService(),
      auditService,
      notificationEventService,
    );

    const result = await service.adjustBranchItemInventory(
      currentUser,
      'branch_1',
      'item_1',
      {
        delta: 3,
        reasonCode: 'manual_restock_after_return',
        note: 'Returned stock added back.',
      },
    );

    expect(menusRepository.adjustTrackedItemStock).toHaveBeenCalledWith(
      'item_1',
      3,
      expect.anything(),
    );
    expect(result.stockQuantity).toBe(8);
    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'menu_items.inventory_adjusted',
        resourceType: 'MENU_ITEM',
        resourceId: 'item_1',
        branchId: 'branch_1',
      }),
    );
    expect(
      notificationEventService.publishMerchantInventoryAlert,
    ).not.toHaveBeenCalled();
  });

  it('publishes a merchant inventory alert when an item crosses into low stock', async () => {
    const menusRepository = {
      countItemInventoryLotsByMenuItemId: jest.fn().mockResolvedValue(0),
      adjustTrackedItemStock: jest.fn().mockResolvedValue(true),
      findItemById: jest.fn().mockResolvedValue(
        makeItem({
          isStockTracked: true,
          stockQuantity: 3,
          lowStockThreshold: 3,
        }),
      ),
    } as unknown as MenusRepository;
    const notificationEventService = makeNotificationEventService();
    const service = new MerchantMenuItemsService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(
          makeItem({
            isStockTracked: true,
            stockQuantity: 5,
            lowStockThreshold: 3,
          }),
        ),
      } as unknown as MenusService,
      menusRepository,
      new MenuItemPolicyService(),
      makeAuditService(),
      notificationEventService,
    );

    await service.adjustBranchItemInventory(currentUser, 'branch_1', 'item_1', {
      delta: -2,
      reasonCode: 'manual_count_correction',
    });

    expect(
      notificationEventService.publishMerchantInventoryAlert,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceType: 'MENU_ITEM',
        resourceId: 'item_1',
        attentionLevel: 'LOW_STOCK',
        stockQuantity: 3,
        lowStockThreshold: 3,
      }),
    );
  });
});

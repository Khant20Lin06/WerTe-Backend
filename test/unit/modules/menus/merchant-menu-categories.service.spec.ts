import { HttpStatus } from '@nestjs/common';
import {
  BranchStatus,
  BranchStoreTypeStatus,
  MerchantStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { AuditService } from '../../../../src/modules/audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { BranchOwnershipRecord } from '../../../../src/modules/branches/entities/branch-ownership.entity';
import { BranchesService } from '../../../../src/modules/branches/services/branches.service';
import { MenuCategoryOwnershipRecord } from '../../../../src/modules/menus/entities/menu-category-ownership.entity';
import { MenuCategoryPolicyService } from '../../../../src/modules/menus/policies/menu-category-policy.service';
import { MenusRepository } from '../../../../src/modules/menus/repositories/menus.repository';
import { MenuCacheService } from '../../../../src/modules/menus/services/menu-cache.service';
import { MerchantMenuCategoriesService } from '../../../../src/modules/menus/services/merchant-menu-categories.service';
import { MenusService } from '../../../../src/modules/menus/services/menus.service';

describe('MerchantMenuCategoriesService', () => {
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
    operatingHours: null,
    branchZones: [],
    staffAssignments: [],
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

  const prismaService = {
    runInTransaction: jest.fn(async (callback: (tx: object) => Promise<unknown>) =>
      callback({}),
    ),
  } as unknown as PrismaService;

  const makeAuditService = () =>
    ({
      logAction: jest.fn().mockResolvedValue({}),
    }) as unknown as jest.Mocked<AuditService>;

  const makeMenuCache = () =>
    ({
      getCatalog: jest.fn().mockResolvedValue(null),
      setCatalog: jest.fn().mockResolvedValue(undefined),
      invalidate: jest.fn().mockResolvedValue(undefined),
    }) as unknown as MenuCacheService;

  it('lists categories for a merchant-owned branch', async () => {
    const service = new MerchantMenuCategoriesService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {
        listCategoriesByBranchId: jest.fn().mockResolvedValue([makeCategory()]),
      } as unknown as MenusService,
      {} as MenusRepository,
      new MenuCategoryPolicyService(),
      makeAuditService(),
      makeMenuCache(),
    );

    await expect(
      service.listBranchCategories(currentUser, 'branch_1'),
    ).resolves.toEqual([
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
          status: BranchStoreTypeStatus.APPROVED,
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
      createCategory: jest.fn().mockResolvedValue(
        makeCategory({
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
        }),
      ),
      replaceCategoryStoreTypes: jest.fn().mockResolvedValue(undefined),
      findCategoryById: jest.fn().mockResolvedValue(
        makeCategory({
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
        }),
      ),
    } as unknown as MenusRepository;
    const auditService = makeAuditService();
    const service = new MerchantMenuCategoriesService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {} as MenusService,
      menusRepository,
      new MenuCategoryPolicyService(),
      auditService,
      makeMenuCache(),
    );

    const result = await service.createBranchCategory(currentUser, 'branch_1', {
      name: 'New Category',
      storeTypeIds: ['store_type_grocery'],
    });

    expect(menusRepository.createCategory).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: 'branch_1',
        name: 'New Category',
        sortOrder: 5,
        isActive: true,
      }),
      expect.anything(),
    );
    expect(menusRepository.replaceCategoryStoreTypes).toHaveBeenCalledWith(
      'cat_2',
      ['store_type_grocery'],
      expect.anything(),
    );
    expect(result.sortOrder).toBe(5);
    expect(result.storeTypes).toEqual([
      {
        id: 'store_type_grocery',
        code: 'grocery',
        name: 'Grocery',
        sortOrder: 10,
      },
    ]);
    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'menu_categories.scope_created',
        resourceType: 'MENU_CATEGORY',
        resourceId: 'cat_2',
        branchId: 'branch_1',
      }),
    );
  });

  it('rejects category store type scopes that are not approved for the branch', async () => {
    const menusRepository = {
      findHighestCategorySortOrderByBranchId: jest.fn().mockResolvedValue(null),
      listApprovedStoreTypesByBranchId: jest.fn().mockResolvedValue([]),
      createCategory: jest.fn(),
      replaceCategoryStoreTypes: jest.fn(),
      findCategoryById: jest.fn(),
    } as unknown as MenusRepository;
    const service = new MerchantMenuCategoriesService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {} as MenusService,
      menusRepository,
      new MenuCategoryPolicyService(),
      makeAuditService(),
      makeMenuCache(),
    );

    await expect(
      service.createBranchCategory(currentUser, 'branch_1', {
        name: 'Scoped Category',
        storeTypeIds: ['store_type_unknown'],
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
      response: expect.objectContaining({
        code: ErrorCodes.validationFailed,
      }),
    });
    expect(menusRepository.createCategory).not.toHaveBeenCalled();
  });

  it('rejects category updates when the category does not belong to the requested branch', async () => {
    const service = new MerchantMenuCategoriesService(
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
      new MenuCategoryPolicyService(),
      makeAuditService(),
      makeMenuCache(),
    );

    await expect(
      service.updateBranchCategory(currentUser, 'branch_1', 'cat_1', {
        name: 'Renamed',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
      response: expect.objectContaining({
        code: ErrorCodes.notFound,
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
          status: BranchStoreTypeStatus.APPROVED,
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
    } as unknown as MenusRepository;
    const auditService = makeAuditService();
    const service = new MerchantMenuCategoriesService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {
        findCategoryOwnedByUserId: jest.fn().mockResolvedValue(makeCategory()),
      } as unknown as MenusService,
      menusRepository,
      new MenuCategoryPolicyService(),
      auditService,
      makeMenuCache(),
    );

    await service.updateBranchCategory(currentUser, 'branch_1', 'cat_1', {
      storeTypeIds: ['store_type_grocery'],
    });

    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'menu_categories.scope_updated',
        resourceType: 'MENU_CATEGORY',
        resourceId: 'cat_1',
        branchId: 'branch_1',
      }),
    );
  });
});

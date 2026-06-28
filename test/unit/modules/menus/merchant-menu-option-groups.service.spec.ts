import { HttpStatus } from '@nestjs/common';
import {
  BranchStatus,
  ItemOptionGroupKind,
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { ItemOptionGroupOwnershipRecord } from '../../../../src/modules/menus/entities/item-option-group-ownership.entity';
import { MenuItemOwnershipRecord } from '../../../../src/modules/menus/entities/menu-item-ownership.entity';
import { MenuOptionGroupPolicyService } from '../../../../src/modules/menus/policies/menu-option-group-policy.service';
import { MenusRepository } from '../../../../src/modules/menus/repositories/menus.repository';
import { MenuCacheService } from '../../../../src/modules/menus/services/menu-cache.service';
import { MerchantMenuOptionGroupsService } from '../../../../src/modules/menus/services/merchant-menu-option-groups.service';
import { MenusService } from '../../../../src/modules/menus/services/menus.service';

describe('MerchantMenuOptionGroupsService', () => {
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

  const makeOptionGroup = (
    overrides?: Partial<ItemOptionGroupOwnershipRecord>,
  ): ItemOptionGroupOwnershipRecord => ({
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
    menuItem: makeItem(),
    ...overrides,
  });

  const prismaService = {
    runInTransaction: jest.fn(async (callback: (tx: object) => Promise<unknown>) =>
      callback({}),
    ),
  } as unknown as PrismaService;

  const makeMenuCache = () =>
    ({
      getCatalog: jest.fn().mockResolvedValue(null),
      setCatalog: jest.fn().mockResolvedValue(undefined),
      invalidate: jest.fn().mockResolvedValue(undefined),
    }) as unknown as MenuCacheService;

  it('lists option groups for a merchant-owned menu item', async () => {
    const service = new MerchantMenuOptionGroupsService(
      prismaService,
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(makeItem()),
        listOptionGroupsByMenuItemId: jest
          .fn()
          .mockResolvedValue([makeOptionGroup()]),
      } as unknown as MenusService,
      {} as MenusRepository,
      new MenuOptionGroupPolicyService(),
      makeMenuCache(),
    );

    await expect(
      service.listItemOptionGroups(currentUser, 'branch_1', 'item_1'),
    ).resolves.toEqual([
      {
        id: 'group_1',
        branchId: 'branch_1',
        menuItemId: 'item_1',
        name: 'Choose noodle type',
        description: 'Required selection',
        kind: ItemOptionGroupKind.ADD_ON,
        minSelect: 1,
        maxSelect: 1,
        sortOrder: 0,
        isActive: true,
        createdAt: '2026-04-19T00:00:00.000Z',
        updatedAt: '2026-04-19T00:00:00.000Z',
      },
    ]);
  });

  it('assigns the next sort order when creating an option group without an explicit sort order', async () => {
    const menusRepository = {
      findHighestOptionGroupSortOrderByMenuItemId: jest
        .fn()
        .mockResolvedValue({ sortOrder: 2 }),
      createOptionGroup: jest.fn().mockResolvedValue(
        makeOptionGroup({
          id: 'group_2',
          name: 'Choose size',
          minSelect: 0,
          maxSelect: 2,
          sortOrder: 3,
        }),
      ),
    } as unknown as MenusRepository;
    const service = new MerchantMenuOptionGroupsService(
      prismaService,
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(makeItem()),
      } as unknown as MenusService,
      menusRepository,
      new MenuOptionGroupPolicyService(),
      makeMenuCache(),
    );

    const result = await service.createItemOptionGroup(
      currentUser,
      'branch_1',
      'item_1',
      {
        name: 'Choose size',
        minSelect: 0,
        maxSelect: 2,
        kind: ItemOptionGroupKind.ADD_ON,
      },
    );

    expect(menusRepository.createOptionGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        menuItemId: 'item_1',
        name: 'Choose size',
        minSelect: 0,
        maxSelect: 2,
        kind: ItemOptionGroupKind.ADD_ON,
        sortOrder: 3,
        isActive: true,
      }),
      expect.anything(),
    );
    expect(result.sortOrder).toBe(3);
  });

  it('rejects invalid selection bounds when maxSelect is smaller than minSelect', async () => {
    const service = new MerchantMenuOptionGroupsService(
      prismaService,
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(makeItem()),
      } as unknown as MenusService,
      {} as MenusRepository,
      new MenuOptionGroupPolicyService(),
      makeMenuCache(),
    );

    await expect(
      service.createItemOptionGroup(currentUser, 'branch_1', 'item_1', {
        name: 'Invalid',
        minSelect: 2,
        maxSelect: 1,
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
      }),
    });
  });

  it('rejects option group updates when the group does not belong to the requested menu item', async () => {
    const service = new MerchantMenuOptionGroupsService(
      prismaService,
      {
        findOptionGroupOwnedByUserId: jest.fn().mockResolvedValue(
          makeOptionGroup({
            menuItem: makeItem({
              id: 'item_2',
            }),
          }),
        ),
      } as unknown as MenusService,
      {} as MenusRepository,
      new MenuOptionGroupPolicyService(),
      makeMenuCache(),
    );

    await expect(
      service.updateItemOptionGroup(currentUser, 'branch_1', 'item_1', 'group_1', {
        name: 'Renamed',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
      response: expect.objectContaining({
        code: ErrorCodes.notFound,
      }),
    });
  });

  it('rejects variant selector groups that allow more than one selection', async () => {
    const service = new MerchantMenuOptionGroupsService(
      prismaService,
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(makeItem()),
      } as unknown as MenusService,
      {} as MenusRepository,
      new MenuOptionGroupPolicyService(),
      makeMenuCache(),
    );

    await expect(
      service.createItemOptionGroup(currentUser, 'branch_1', 'item_1', {
        name: 'Choose size',
        kind: ItemOptionGroupKind.VARIANT_SELECTOR,
        minSelect: 1,
        maxSelect: 2,
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
      }),
    });
  });
});

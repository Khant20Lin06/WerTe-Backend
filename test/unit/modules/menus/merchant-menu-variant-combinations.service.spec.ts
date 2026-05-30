import { HttpStatus } from '@nestjs/common';
import { ItemOptionGroupKind, Prisma, UserRole, UserStatus } from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { ItemOptionGroupOwnershipRecord } from '../../../../src/modules/menus/entities/item-option-group-ownership.entity';
import { ItemOptionOwnershipRecord } from '../../../../src/modules/menus/entities/item-option-ownership.entity';
import { ItemVariantCombinationOwnershipRecord } from '../../../../src/modules/menus/entities/item-variant-combination-ownership.entity';
import { MenuItemOwnershipRecord } from '../../../../src/modules/menus/entities/menu-item-ownership.entity';
import { MenuItemPolicyService } from '../../../../src/modules/menus/policies/menu-item-policy.service';
import { MenusRepository } from '../../../../src/modules/menus/repositories/menus.repository';
import { MerchantMenuVariantCombinationsService } from '../../../../src/modules/menus/services/merchant-menu-variant-combinations.service';
import { MenusService } from '../../../../src/modules/menus/services/menus.service';

describe('MerchantMenuVariantCombinationsService', () => {
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
    name: 'T-Shirt',
    description: 'Soft cotton tee',
    imageUrl: null,
    imageUrlsJson: null,
    sku: null,
    barcode: null,
    brand: null,
    attributesJson: null,
    basePrice: new Prisma.Decimal('12000'),
    isStockTracked: false,
    stockQuantity: null,
    lowStockThreshold: null,
    sortOrder: 0,
    isAvailable: true,
    createdAt: new Date('2026-05-02T00:00:00.000Z'),
    updatedAt: new Date('2026-05-02T00:00:00.000Z'),
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
      name: 'Apparel',
      isActive: true,
    },
    storeTypes: [],
    ...overrides,
  });

  const makeVariantGroup = (
    overrides?: Partial<ItemOptionGroupOwnershipRecord>,
  ): ItemOptionGroupOwnershipRecord => ({
    id: 'group_size',
    menuItemId: 'item_1',
    name: 'Size',
    description: null,
    kind: ItemOptionGroupKind.VARIANT_SELECTOR,
    minSelect: 1,
    maxSelect: 1,
    sortOrder: 0,
    isActive: true,
    createdAt: new Date('2026-05-02T00:00:00.000Z'),
    updatedAt: new Date('2026-05-02T00:00:00.000Z'),
    menuItem: makeItem(),
    ...overrides,
  });

  const makeOption = (
    overrides?: Partial<ItemOptionOwnershipRecord>,
  ): ItemOptionOwnershipRecord => ({
    id: 'option_size_s',
    groupId: 'group_size',
    name: 'Small',
    priceDelta: new Prisma.Decimal('0'),
    isStockTracked: false,
    stockQuantity: null,
    lowStockThreshold: null,
    sortOrder: 0,
    isActive: true,
    createdAt: new Date('2026-05-02T00:00:00.000Z'),
    updatedAt: new Date('2026-05-02T00:00:00.000Z'),
    group: makeVariantGroup(),
    ...overrides,
  });

  const makeCombination = (
    overrides?: Partial<ItemVariantCombinationOwnershipRecord>,
  ): ItemVariantCombinationOwnershipRecord => ({
    id: 'combo_1',
    menuItemId: 'item_1',
    name: 'Small / Red',
    sku: 'SKU-TSHIRT-S-RED',
    signature: 'option_color_red|option_size_s',
    isStockTracked: true,
    stockQuantity: 5,
    lowStockThreshold: 1,
    sortOrder: 0,
    isActive: true,
    createdAt: new Date('2026-05-02T00:00:00.000Z'),
    updatedAt: new Date('2026-05-02T00:00:00.000Z'),
    menuItem: makeItem(),
    optionLinks: [
      {
        combinationId: 'combo_1',
        itemOptionId: 'option_size_s',
        itemOption: {
          id: 'option_size_s',
          name: 'Small',
          sortOrder: 0,
          isActive: true,
          group: {
            id: 'group_size',
            name: 'Size',
            sortOrder: 0,
            isActive: true,
          },
        },
      },
      {
        combinationId: 'combo_1',
        itemOptionId: 'option_color_red',
        itemOption: {
          id: 'option_color_red',
          name: 'Red',
          sortOrder: 0,
          isActive: true,
          group: {
            id: 'group_color',
            name: 'Color',
            sortOrder: 1,
            isActive: true,
          },
        },
      },
    ],
    ...overrides,
  }) as ItemVariantCombinationOwnershipRecord;

  const prismaService = {
    runInTransaction: jest.fn(async (callback: (tx: object) => Promise<unknown>) =>
      callback({}),
    ),
  } as unknown as PrismaService;

  it('creates a variant combination and auto-generates a label when omitted', async () => {
    const menusRepository = {
      findVariantCombinationByMenuItemIdAndSignature: jest
        .fn()
        .mockResolvedValue(null),
      findHighestVariantCombinationSortOrderByMenuItemId: jest
        .fn()
        .mockResolvedValue({ sortOrder: 2 }),
      createVariantCombination: jest.fn().mockResolvedValue(
        makeCombination({
          sortOrder: 3,
          name: 'Small / Red',
          sku: null,
        }),
      ),
      replaceVariantCombinationOptions: jest.fn().mockResolvedValue(undefined),
      findVariantCombinationById: jest.fn().mockResolvedValue(
        makeCombination({
          sortOrder: 3,
          name: 'Small / Red',
          sku: null,
        }),
      ),
    } as unknown as MenusRepository;
    const service = new MerchantMenuVariantCombinationsService(
      prismaService,
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(makeItem()),
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([
          makeVariantGroup(),
          makeVariantGroup({
            id: 'group_color',
            name: 'Color',
            sortOrder: 1,
          }),
        ]),
        listOptionsByOptionGroupId: jest
          .fn()
          .mockResolvedValueOnce([makeOption()])
          .mockResolvedValueOnce([
            makeOption({
              id: 'option_color_red',
              groupId: 'group_color',
              name: 'Red',
              group: makeVariantGroup({
                id: 'group_color',
                name: 'Color',
                sortOrder: 1,
              }),
            }),
          ]),
      } as unknown as MenusService,
      menusRepository,
      new MenuItemPolicyService(),
    );

    const result = await service.createItemVariantCombination(
      currentUser,
      'branch_1',
      'item_1',
      {
        selectedOptionIds: ['option_size_s', 'option_color_red'],
        isStockTracked: true,
        stockQuantity: 5,
        lowStockThreshold: 1,
      },
    );

    expect(menusRepository.createVariantCombination).toHaveBeenCalledWith(
      expect.objectContaining({
        menuItemId: 'item_1',
        name: 'Small / Red',
        signature: 'option_color_red|option_size_s',
        isStockTracked: true,
        stockQuantity: 5,
        lowStockThreshold: 1,
        sortOrder: 3,
      }),
      expect.anything(),
    );
    expect(menusRepository.replaceVariantCombinationOptions).toHaveBeenCalledWith(
      'combo_1',
      ['option_size_s', 'option_color_red'],
      expect.anything(),
    );
    expect(result.name).toBe('Small / Red');
  });

  it('rejects duplicate combination signatures for the same menu item', async () => {
    const service = new MerchantMenuVariantCombinationsService(
      prismaService,
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(makeItem()),
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([
          makeVariantGroup(),
        ]),
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([makeOption()]),
      } as unknown as MenusService,
      {
        findVariantCombinationByMenuItemIdAndSignature: jest
          .fn()
          .mockResolvedValue(makeCombination()),
      } as unknown as MenusRepository,
      new MenuItemPolicyService(),
    );

    await expect(
      service.createItemVariantCombination(currentUser, 'branch_1', 'item_1', {
        selectedOptionIds: ['option_size_s'],
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
      response: expect.objectContaining({
        code: ErrorCodes.conflict,
      }),
    });
  });
});

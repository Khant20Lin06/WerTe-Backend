import { HttpStatus } from '@nestjs/common';
import { ItemOptionGroupKind, Prisma, UserRole, UserStatus } from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { CustomerProfileOwnershipRecord } from '../../../../src/modules/customer-profiles/entities/customer-profile-ownership.entity';
import { CustomerProfilesService } from '../../../../src/modules/customer-profiles/services/customer-profiles.service';
import { CartQueryService } from '../../../../src/modules/carts/services/cart-query.service';
import { CartPricingService } from '../../../../src/modules/carts/services/cart-pricing.service';
import { CartsRepository } from '../../../../src/modules/carts/repositories/carts.repository';
import { CartMutationService } from '../../../../src/modules/carts/services/cart-mutation.service';
import { ItemOptionOwnershipRecord } from '../../../../src/modules/menus/entities/item-option-ownership.entity';
import { MenuItemOwnershipRecord } from '../../../../src/modules/menus/entities/menu-item-ownership.entity';
import { MenusService } from '../../../../src/modules/menus/services/menus.service';

describe('CartMutationService', () => {
  const currentUser: AuthenticatedUserEntity = {
    userId: 'usr_1',
    sessionId: 'session_1',
    role: UserRole.CUSTOMER,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfileId: 'cust_prof_1',
    },
  };

  const makeProfile = (
    overrides?: Partial<CustomerProfileOwnershipRecord>,
  ): CustomerProfileOwnershipRecord => ({
    id: 'cust_prof_1',
    userId: 'usr_1',
    fullName: 'Mg Mg',
    avatarUrl: null,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    user: {
      id: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
    ...overrides,
  });

  const makeMenuItem = (
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
    sortOrder: 0,
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
    storeTypes: [],
    category: {
      id: 'cat_1',
      name: 'Popular',
      isActive: true,
    },
    ...overrides,
  });

  const makeOptionGroup = (overrides?: {
    id?: string;
    menuItemId?: string;
    minSelect?: number;
    maxSelect?: number;
    isActive?: boolean;
    kind?: ItemOptionGroupKind;
  }) => ({
    id: overrides?.id ?? 'group_1',
    menuItemId: overrides?.menuItemId ?? 'item_1',
    name: 'Choose noodle type',
    description: 'Required selection',
    kind: overrides?.kind ?? ItemOptionGroupKind.ADD_ON,
    minSelect: overrides?.minSelect ?? 1,
    maxSelect: overrides?.maxSelect ?? 1,
    sortOrder: 0,
    isActive: overrides?.isActive ?? true,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    menuItem: makeMenuItem({
      id: overrides?.menuItemId ?? 'item_1',
    }),
  });

  const makeOption = (
    overrides?: Partial<ItemOptionOwnershipRecord>,
  ): ItemOptionOwnershipRecord => ({
    id: 'option_1',
    groupId: 'group_1',
    name: 'Thin rice noodle',
    priceDelta: new Prisma.Decimal('250'),
    isStockTracked: false,
    stockQuantity: null,
    lowStockThreshold: null,
    sortOrder: 0,
    isActive: true,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    group: {
      ...makeOptionGroup(),
      id: 'group_1',
      menuItemId: 'item_1',
    },
    ...overrides,
  });

  const makePrismaService = () =>
    ({
      runInTransaction: jest.fn(
        async (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          callback({} as Prisma.TransactionClient),
      ),
    } as unknown as PrismaService);

  it('creates an active cart item with validated option snapshots', async () => {
    const prismaService = makePrismaService();
    const cartsRepository = {
      findActiveCartByCustomerProfileIdAndBranchId: jest.fn().mockResolvedValue(null),
      createCart: jest.fn().mockResolvedValue({ id: 'cart_1' }),
      createCartItem: jest.fn().mockResolvedValue({ id: 'cart_item_1' }),
      createCartItemOptions: jest.fn().mockResolvedValue({ count: 1 }),
      listCartItemsByCartIdWithClient: jest.fn().mockResolvedValue([
        {
          lineTotal: new Prisma.Decimal('5500'),
          quantity: 2,
        },
      ]),
      updateCart: jest.fn().mockResolvedValue({ id: 'cart_1' }),
    } as unknown as CartsRepository;
    const cartQueryService = {
      findCartAggregateById: jest.fn().mockResolvedValue({ id: 'cart_1' }),
      buildCartAggregate: jest.fn().mockReturnValue({
        cartId: 'cart_1',
        branchId: 'branch_1',
        items: [],
      }),
    } as unknown as CartQueryService;
    const cartPricingService = new CartPricingService(cartsRepository);
    const service = new CartMutationService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
      } as unknown as CustomerProfilesService,
      {
        findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([makeOption()]),
      } as unknown as MenusService,
      cartsRepository,
      cartPricingService,
      cartQueryService,
    );

    const result = await service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
      menuItemId: 'item_1',
      quantity: 2,
      selectedOptionIds: ['option_1'],
    });

    expect(cartsRepository.createCartItem).toHaveBeenCalledWith(
      expect.objectContaining({
        cartId: 'cart_1',
        menuItemId: 'item_1',
        quantity: 2,
        unitPriceSnapshot: expect.any(Prisma.Decimal),
        lineTotal: expect.any(Prisma.Decimal),
      }),
      expect.anything(),
    );
    expect(cartsRepository.createCartItemOptions).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          cartItemId: 'cart_item_1',
          itemOptionId: 'option_1',
          nameSnapshot: 'Thin rice noodle',
          priceDeltaSnapshot: expect.any(Prisma.Decimal),
        }),
      ],
      expect.anything(),
    );
    expect(result).toEqual({
      cartId: 'cart_1',
      branchId: 'branch_1',
      items: [],
    });
  });

  it('rejects cart mutation when the menu item is not available', async () => {
    const service = new CartMutationService(
      makePrismaService(),
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
      } as unknown as CustomerProfilesService,
      {
        findItemById: jest.fn().mockResolvedValue(
          makeMenuItem({
            isAvailable: false,
          }),
        ),
      } as unknown as MenusService,
      {} as CartsRepository,
      new CartPricingService({} as CartsRepository),
      {} as CartQueryService,
    );

    await expect(
      service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
        menuItemId: 'item_1',
        quantity: 1,
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
      }),
    });
  });

  it('rejects cart mutation when the menu item does not belong to the requested branch', async () => {
    const service = new CartMutationService(
      makePrismaService(),
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
      } as unknown as CustomerProfilesService,
      {
        findItemById: jest.fn().mockResolvedValue(
          makeMenuItem({
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
      {} as CartsRepository,
      new CartPricingService({} as CartsRepository),
      {} as CartQueryService,
    );

    await expect(
      service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
        menuItemId: 'item_1',
        quantity: 1,
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
      response: expect.objectContaining({
        code: ErrorCodes.notFound,
      }),
    });
  });

  it('rejects cart mutation when required option selections are missing', async () => {
    const service = new CartMutationService(
      makePrismaService(),
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
      } as unknown as CustomerProfilesService,
      {
        findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([makeOption()]),
      } as unknown as MenusService,
      {} as CartsRepository,
      new CartPricingService({} as CartsRepository),
      {} as CartQueryService,
    );

    await expect(
      service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
        menuItemId: 'item_1',
        quantity: 1,
        selectedOptionIds: [],
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
      }),
    });
  });

  it('rejects cart mutation when duplicate option ids are submitted', async () => {
    const service = new CartMutationService(
      makePrismaService(),
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
      } as unknown as CustomerProfilesService,
      {
        findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([makeOption()]),
      } as unknown as MenusService,
      {} as CartsRepository,
      new CartPricingService({} as CartsRepository),
      {} as CartQueryService,
    );

    await expect(
      service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
        menuItemId: 'item_1',
        quantity: 1,
        selectedOptionIds: ['option_1', 'option_1'],
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
      }),
    });
  });

  it('rejects cart mutation when selected options are inactive', async () => {
    const service = new CartMutationService(
      makePrismaService(),
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
      } as unknown as CustomerProfilesService,
      {
        findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
          makeOption({
            isActive: false,
          }),
        ]),
      } as unknown as MenusService,
      {} as CartsRepository,
      new CartPricingService({} as CartsRepository),
      {} as CartQueryService,
    );

    await expect(
      service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
        menuItemId: 'item_1',
        quantity: 1,
        selectedOptionIds: ['option_1'],
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
      }),
    });
  });

  it('rejects cart mutation when a tracked selected option does not have enough stock', async () => {
    const service = new CartMutationService(
      makePrismaService(),
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
      } as unknown as CustomerProfilesService,
      {
        findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
          makeOption({
            isStockTracked: true,
            stockQuantity: 1,
            lowStockThreshold: 1,
          }),
        ]),
      } as unknown as MenusService,
      {} as CartsRepository,
      new CartPricingService({} as CartsRepository),
      {} as CartQueryService,
    );

    await expect(
      service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
        menuItemId: 'item_1',
        quantity: 2,
        selectedOptionIds: ['option_1'],
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
        details: expect.objectContaining({
          optionId: 'option_1',
          stockQuantity: 1,
          requestedQuantity: 2,
        }),
      }),
    });
  });

  it('rejects cart mutation when selected variant options do not match an active combination', async () => {
    const variantGroup = makeOptionGroup({
      kind: ItemOptionGroupKind.VARIANT_SELECTOR,
    });
    const variantOption = makeOption({
      group: variantGroup,
    });
    const service = new CartMutationService(
      makePrismaService(),
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
      } as unknown as CustomerProfilesService,
      {
        findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([variantGroup]),
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([variantOption]),
        findActiveVariantCombinationByMenuItemIdAndOptionIds: jest
          .fn()
          .mockResolvedValue(null),
      } as unknown as MenusService,
      {} as CartsRepository,
      new CartPricingService({} as CartsRepository),
      {} as CartQueryService,
    );

    await expect(
      service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
        menuItemId: 'item_1',
        quantity: 1,
        selectedOptionIds: ['option_1'],
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
        details: expect.objectContaining({
          selectedVariantOptionIds: ['option_1'],
        }),
      }),
    });
  });

  it('rejects cart mutation when a tracked variant combination does not have enough stock', async () => {
    const variantGroup = makeOptionGroup({
      kind: ItemOptionGroupKind.VARIANT_SELECTOR,
    });
    const variantOption = makeOption({
      group: variantGroup,
    });
    const service = new CartMutationService(
      makePrismaService(),
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
      } as unknown as CustomerProfilesService,
      {
        findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([variantGroup]),
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([variantOption]),
        findActiveVariantCombinationByMenuItemIdAndOptionIds: jest
          .fn()
          .mockResolvedValue({
            id: 'combo_1',
            isStockTracked: true,
            stockQuantity: 1,
          }),
      } as unknown as MenusService,
      {} as CartsRepository,
      new CartPricingService({} as CartsRepository),
      {} as CartQueryService,
    );

    await expect(
      service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
        menuItemId: 'item_1',
        quantity: 2,
        selectedOptionIds: ['option_1'],
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
        details: expect.objectContaining({
          combinationId: 'combo_1',
          requestedQuantity: 2,
        }),
      }),
    });
  });

  it('updates a cart item and replaces selected option snapshots when option ids are provided', async () => {
    const prismaService = makePrismaService();
    const cartsRepository = {
      findCartItemById: jest.fn().mockResolvedValue({
        id: 'cart_item_1',
        cart: {
          id: 'cart_1',
          customerProfile: {
            id: 'cust_prof_1',
            user: {
              id: 'usr_1',
            },
          },
          branch: {
            id: 'branch_1',
          },
        },
        menuItem: {
          id: 'item_1',
        },
        unitPriceSnapshot: new Prisma.Decimal('2750'),
      }),
      deleteCartItemOptionsByCartItemId: jest.fn().mockResolvedValue({ count: 1 }),
      createCartItemOptions: jest.fn().mockResolvedValue({ count: 1 }),
      updateCartItem: jest.fn().mockResolvedValue({ id: 'cart_item_1' }),
      listCartItemsByCartIdWithClient: jest.fn().mockResolvedValue([
        {
          lineTotal: new Prisma.Decimal('6000'),
          quantity: 2,
        },
      ]),
      updateCart: jest.fn().mockResolvedValue({ id: 'cart_1' }),
    } as unknown as CartsRepository;
    const cartQueryService = {
      findCartAggregateById: jest.fn().mockResolvedValue({ id: 'cart_1' }),
      buildCartAggregate: jest.fn().mockReturnValue({
        cartId: 'cart_1',
        totalAmount: '6000',
      }),
    } as unknown as CartQueryService;
    const cartPricingService = new CartPricingService(cartsRepository);
    const service = new CartMutationService(
      prismaService,
      {} as CustomerProfilesService,
      {
        findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
          makeOption(),
          makeOption({
            id: 'option_2',
            name: 'Thick rice noodle',
            priceDelta: new Prisma.Decimal('500'),
          }),
        ]),
      } as unknown as MenusService,
      cartsRepository,
      cartPricingService,
      cartQueryService,
    );

    const result = await service.updateCurrentCustomerCartItem(
      currentUser,
      'cart_item_1',
      {
        quantity: 2,
        selectedOptionIds: ['option_2'],
      },
    );

    expect(cartsRepository.deleteCartItemOptionsByCartItemId).toHaveBeenCalledWith(
      'cart_item_1',
      expect.anything(),
    );
    expect(cartsRepository.createCartItemOptions).toHaveBeenCalled();
    expect(cartsRepository.updateCartItem).toHaveBeenCalledWith(
      'cart_item_1',
      expect.objectContaining({
        quantity: 2,
        unitPriceSnapshot: expect.any(Prisma.Decimal),
        lineTotal: expect.any(Prisma.Decimal),
      }),
      expect.anything(),
    );
    expect(result).toEqual({
      cartId: 'cart_1',
      totalAmount: '6000',
    });
  });

  it('revalidates existing selected option stock when only quantity changes', async () => {
    const prismaService = makePrismaService();
    const cartsRepository = {
      findCartItemById: jest.fn().mockResolvedValue({
        id: 'cart_item_1',
        cart: {
          id: 'cart_1',
          customerProfile: {
            id: 'cust_prof_1',
            user: {
              id: 'usr_1',
            },
          },
          branch: {
            id: 'branch_1',
          },
        },
        menuItem: {
          id: 'item_1',
        },
        unitPriceSnapshot: new Prisma.Decimal('2750'),
      }),
      listCartItemOptionsByCartItemIdWithClient: jest.fn().mockResolvedValue([
        {
          itemOption: {
            id: 'option_1',
          },
        },
      ]),
    } as unknown as CartsRepository;
    const service = new CartMutationService(
      prismaService,
      {} as CustomerProfilesService,
      {
        findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
          makeOption({
            isStockTracked: true,
            stockQuantity: 1,
            lowStockThreshold: 1,
          }),
        ]),
      } as unknown as MenusService,
      cartsRepository,
      new CartPricingService(cartsRepository),
      {} as CartQueryService,
    );

    await expect(
      service.updateCurrentCustomerCartItem(currentUser, 'cart_item_1', {
        quantity: 2,
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
        details: expect.objectContaining({
          optionId: 'option_1',
          requestedQuantity: 2,
        }),
      }),
    });
  });

  it('returns an empty aggregate when clearing a branch without an active cart', async () => {
    const cartQueryService = {
      buildEmptyCartAggregate: jest.fn().mockReturnValue({
        cartId: null,
        branchId: 'branch_1',
        items: [],
      }),
    } as unknown as CartQueryService;
    const cartsRepository = {
      findActiveCartByCustomerProfileIdAndBranchId: jest.fn().mockResolvedValue(null),
    } as unknown as CartsRepository;
    const service = new CartMutationService(
      makePrismaService(),
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
      } as unknown as CustomerProfilesService,
      {} as MenusService,
      cartsRepository,
      new CartPricingService(cartsRepository),
      cartQueryService,
    );

    const result = await service.clearCurrentCustomerBranchCart(
      currentUser,
      'branch_1',
    );

    expect(result).toEqual({
      cartId: null,
      branchId: 'branch_1',
      items: [],
    });
  });

  it('removes a cart item and recomputes the cart totals before returning the aggregate', async () => {
    const prismaService = makePrismaService();
    const cartsRepository = {
      findCartItemById: jest.fn().mockResolvedValue({
        id: 'cart_item_1',
        cart: {
          id: 'cart_1',
          customerProfile: {
            id: 'cust_prof_1',
            user: {
              id: 'usr_1',
            },
          },
        },
      }),
      deleteCartItemOptionsByCartItemId: jest.fn().mockResolvedValue({ count: 1 }),
      deleteCartItem: jest.fn().mockResolvedValue({ id: 'cart_item_1' }),
      listCartItemsByCartIdWithClient: jest.fn().mockResolvedValue([]),
      updateCart: jest.fn().mockResolvedValue({ id: 'cart_1' }),
    } as unknown as CartsRepository;
    const cartQueryService = {
      findCartAggregateById: jest.fn().mockResolvedValue({ id: 'cart_1' }),
      buildCartAggregate: jest.fn().mockReturnValue({
        cartId: 'cart_1',
        totalQuantity: 0,
        totalAmount: '0',
        isEmpty: true,
      }),
    } as unknown as CartQueryService;
    const cartPricingService = new CartPricingService(cartsRepository);
    const service = new CartMutationService(
      prismaService,
      {} as CustomerProfilesService,
      {} as MenusService,
      cartsRepository,
      cartPricingService,
      cartQueryService,
    );

    const result = await service.removeCurrentCustomerCartItem(
      currentUser,
      'cart_item_1',
    );

    expect(cartsRepository.deleteCartItemOptionsByCartItemId).toHaveBeenCalledWith(
      'cart_item_1',
      expect.anything(),
    );
    expect(cartsRepository.deleteCartItem).toHaveBeenCalledWith(
      'cart_item_1',
      expect.anything(),
    );
    expect(cartsRepository.updateCart).toHaveBeenCalledWith(
      'cart_1',
      expect.objectContaining({
        totalQuantity: 0,
        subtotalAmount: expect.any(Prisma.Decimal),
        totalAmount: expect.any(Prisma.Decimal),
      }),
      expect.anything(),
    );
    expect(result).toEqual({
      cartId: 'cart_1',
      totalQuantity: 0,
      totalAmount: '0',
      isEmpty: true,
    });
  });
});

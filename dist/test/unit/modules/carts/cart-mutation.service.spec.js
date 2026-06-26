"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const cart_pricing_service_1 = require("../../../../src/modules/carts/services/cart-pricing.service");
const cart_mutation_service_1 = require("../../../../src/modules/carts/services/cart-mutation.service");
describe('CartMutationService', () => {
    const currentUser = {
        userId: 'usr_1',
        sessionId: 'session_1',
        role: client_1.UserRole.CUSTOMER,
        tokenType: 'access',
        actorContext: {
            userId: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
            customerProfileId: 'cust_prof_1',
        },
    };
    const makeProfile = (overrides) => ({
        id: 'cust_prof_1',
        userId: 'usr_1',
        fullName: 'Mg Mg',
        avatarUrl: null,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        user: {
            id: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
        },
        ...overrides,
    });
    const makeMenuItem = (overrides) => ({
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
                    role: client_1.UserRole.MERCHANT,
                    status: client_1.UserStatus.ACTIVE,
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
    const makeOptionGroup = (overrides) => ({
        id: overrides?.id ?? 'group_1',
        menuItemId: overrides?.menuItemId ?? 'item_1',
        name: 'Choose noodle type',
        description: 'Required selection',
        kind: overrides?.kind ?? client_1.ItemOptionGroupKind.ADD_ON,
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
    const makeOption = (overrides) => ({
        id: 'option_1',
        groupId: 'group_1',
        name: 'Thin rice noodle',
        priceDelta: new client_1.Prisma.Decimal('250'),
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
    const makePrismaService = () => ({
        runInTransaction: jest.fn(async (callback) => callback({})),
    });
    it('creates an active cart item with validated option snapshots', async () => {
        const prismaService = makePrismaService();
        const cartsRepository = {
            findActiveCartByCustomerProfileIdAndBranchId: jest.fn().mockResolvedValue(null),
            createCart: jest.fn().mockResolvedValue({ id: 'cart_1' }),
            createCartItem: jest.fn().mockResolvedValue({ id: 'cart_item_1' }),
            createCartItemOptions: jest.fn().mockResolvedValue({ count: 1 }),
            listCartItemsByCartIdWithClient: jest.fn().mockResolvedValue([
                {
                    lineTotal: new client_1.Prisma.Decimal('5500'),
                    quantity: 2,
                },
            ]),
            updateCart: jest.fn().mockResolvedValue({ id: 'cart_1' }),
        };
        const cartQueryService = {
            findCartAggregateById: jest.fn().mockResolvedValue({ id: 'cart_1' }),
            buildCartAggregate: jest.fn().mockReturnValue({
                cartId: 'cart_1',
                branchId: 'branch_1',
                items: [],
            }),
        };
        const cartPricingService = new cart_pricing_service_1.CartPricingService(cartsRepository);
        const service = new cart_mutation_service_1.CartMutationService(prismaService, {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
        }, {
            findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
            listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([makeOption()]),
        }, cartsRepository, cartPricingService, cartQueryService);
        const result = await service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
            menuItemId: 'item_1',
            quantity: 2,
            selectedOptionIds: ['option_1'],
        });
        expect(cartsRepository.createCartItem).toHaveBeenCalledWith(expect.objectContaining({
            cartId: 'cart_1',
            menuItemId: 'item_1',
            quantity: 2,
            unitPriceSnapshot: expect.any(client_1.Prisma.Decimal),
            lineTotal: expect.any(client_1.Prisma.Decimal),
        }), expect.anything());
        expect(cartsRepository.createCartItemOptions).toHaveBeenCalledWith([
            expect.objectContaining({
                cartItemId: 'cart_item_1',
                itemOptionId: 'option_1',
                nameSnapshot: 'Thin rice noodle',
                priceDeltaSnapshot: expect.any(client_1.Prisma.Decimal),
            }),
        ], expect.anything());
        expect(result).toEqual({
            cartId: 'cart_1',
            branchId: 'branch_1',
            items: [],
        });
    });
    it('rejects cart mutation when the menu item is not available', async () => {
        const service = new cart_mutation_service_1.CartMutationService(makePrismaService(), {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
        }, {
            findItemById: jest.fn().mockResolvedValue(makeMenuItem({
                isAvailable: false,
            })),
        }, {}, new cart_pricing_service_1.CartPricingService({}), {});
        await expect(service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
            menuItemId: 'item_1',
            quantity: 1,
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
    it('rejects cart mutation when the menu item does not belong to the requested branch', async () => {
        const service = new cart_mutation_service_1.CartMutationService(makePrismaService(), {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
        }, {
            findItemById: jest.fn().mockResolvedValue(makeMenuItem({
                branch: {
                    id: 'branch_2',
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
            })),
        }, {}, new cart_pricing_service_1.CartPricingService({}), {});
        await expect(service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
            menuItemId: 'item_1',
            quantity: 1,
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.notFound,
            }),
        });
    });
    it('rejects cart mutation when required option selections are missing', async () => {
        const service = new cart_mutation_service_1.CartMutationService(makePrismaService(), {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
        }, {
            findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
            listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([makeOption()]),
        }, {}, new cart_pricing_service_1.CartPricingService({}), {});
        await expect(service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
            menuItemId: 'item_1',
            quantity: 1,
            selectedOptionIds: [],
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
    it('rejects cart mutation when duplicate option ids are submitted', async () => {
        const service = new cart_mutation_service_1.CartMutationService(makePrismaService(), {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
        }, {
            findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
            listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([makeOption()]),
        }, {}, new cart_pricing_service_1.CartPricingService({}), {});
        await expect(service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
            menuItemId: 'item_1',
            quantity: 1,
            selectedOptionIds: ['option_1', 'option_1'],
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
    it('rejects cart mutation when selected options are inactive', async () => {
        const service = new cart_mutation_service_1.CartMutationService(makePrismaService(), {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
        }, {
            findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
            listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
                makeOption({
                    isActive: false,
                }),
            ]),
        }, {}, new cart_pricing_service_1.CartPricingService({}), {});
        await expect(service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
            menuItemId: 'item_1',
            quantity: 1,
            selectedOptionIds: ['option_1'],
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
    it('rejects cart mutation when a tracked selected option does not have enough stock', async () => {
        const service = new cart_mutation_service_1.CartMutationService(makePrismaService(), {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
        }, {
            findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
            listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
                makeOption({
                    isStockTracked: true,
                    stockQuantity: 1,
                    lowStockThreshold: 1,
                }),
            ]),
        }, {}, new cart_pricing_service_1.CartPricingService({}), {});
        await expect(service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
            menuItemId: 'item_1',
            quantity: 2,
            selectedOptionIds: ['option_1'],
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
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
            kind: client_1.ItemOptionGroupKind.VARIANT_SELECTOR,
        });
        const variantOption = makeOption({
            group: variantGroup,
        });
        const service = new cart_mutation_service_1.CartMutationService(makePrismaService(), {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
        }, {
            findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
            listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([variantGroup]),
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([variantOption]),
            findActiveVariantCombinationByMenuItemIdAndOptionIds: jest
                .fn()
                .mockResolvedValue(null),
        }, {}, new cart_pricing_service_1.CartPricingService({}), {});
        await expect(service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
            menuItemId: 'item_1',
            quantity: 1,
            selectedOptionIds: ['option_1'],
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: expect.objectContaining({
                    selectedVariantOptionIds: ['option_1'],
                }),
            }),
        });
    });
    it('rejects cart mutation when a tracked variant combination does not have enough stock', async () => {
        const variantGroup = makeOptionGroup({
            kind: client_1.ItemOptionGroupKind.VARIANT_SELECTOR,
        });
        const variantOption = makeOption({
            group: variantGroup,
        });
        const service = new cart_mutation_service_1.CartMutationService(makePrismaService(), {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
        }, {
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
        }, {}, new cart_pricing_service_1.CartPricingService({}), {});
        await expect(service.addCurrentCustomerCartItem(currentUser, 'branch_1', {
            menuItemId: 'item_1',
            quantity: 2,
            selectedOptionIds: ['option_1'],
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
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
                unitPriceSnapshot: new client_1.Prisma.Decimal('2750'),
            }),
            deleteCartItemOptionsByCartItemId: jest.fn().mockResolvedValue({ count: 1 }),
            createCartItemOptions: jest.fn().mockResolvedValue({ count: 1 }),
            updateCartItem: jest.fn().mockResolvedValue({ id: 'cart_item_1' }),
            listCartItemsByCartIdWithClient: jest.fn().mockResolvedValue([
                {
                    lineTotal: new client_1.Prisma.Decimal('6000'),
                    quantity: 2,
                },
            ]),
            updateCart: jest.fn().mockResolvedValue({ id: 'cart_1' }),
        };
        const cartQueryService = {
            findCartAggregateById: jest.fn().mockResolvedValue({ id: 'cart_1' }),
            buildCartAggregate: jest.fn().mockReturnValue({
                cartId: 'cart_1',
                totalAmount: '6000',
            }),
        };
        const cartPricingService = new cart_pricing_service_1.CartPricingService(cartsRepository);
        const service = new cart_mutation_service_1.CartMutationService(prismaService, {}, {
            findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
            listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
                makeOption(),
                makeOption({
                    id: 'option_2',
                    name: 'Thick rice noodle',
                    priceDelta: new client_1.Prisma.Decimal('500'),
                }),
            ]),
        }, cartsRepository, cartPricingService, cartQueryService);
        const result = await service.updateCurrentCustomerCartItem(currentUser, 'cart_item_1', {
            quantity: 2,
            selectedOptionIds: ['option_2'],
        });
        expect(cartsRepository.deleteCartItemOptionsByCartItemId).toHaveBeenCalledWith('cart_item_1', expect.anything());
        expect(cartsRepository.createCartItemOptions).toHaveBeenCalled();
        expect(cartsRepository.updateCartItem).toHaveBeenCalledWith('cart_item_1', expect.objectContaining({
            quantity: 2,
            unitPriceSnapshot: expect.any(client_1.Prisma.Decimal),
            lineTotal: expect.any(client_1.Prisma.Decimal),
        }), expect.anything());
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
                unitPriceSnapshot: new client_1.Prisma.Decimal('2750'),
            }),
            listCartItemOptionsByCartItemIdWithClient: jest.fn().mockResolvedValue([
                {
                    itemOption: {
                        id: 'option_1',
                    },
                },
            ]),
        };
        const service = new cart_mutation_service_1.CartMutationService(prismaService, {}, {
            findItemById: jest.fn().mockResolvedValue(makeMenuItem()),
            listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([makeOptionGroup()]),
            listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
                makeOption({
                    isStockTracked: true,
                    stockQuantity: 1,
                    lowStockThreshold: 1,
                }),
            ]),
        }, cartsRepository, new cart_pricing_service_1.CartPricingService(cartsRepository), {});
        await expect(service.updateCurrentCustomerCartItem(currentUser, 'cart_item_1', {
            quantity: 2,
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
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
        };
        const cartsRepository = {
            findActiveCartByCustomerProfileIdAndBranchId: jest.fn().mockResolvedValue(null),
        };
        const service = new cart_mutation_service_1.CartMutationService(makePrismaService(), {
            findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
        }, {}, cartsRepository, new cart_pricing_service_1.CartPricingService(cartsRepository), cartQueryService);
        const result = await service.clearCurrentCustomerBranchCart(currentUser, 'branch_1');
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
        };
        const cartQueryService = {
            findCartAggregateById: jest.fn().mockResolvedValue({ id: 'cart_1' }),
            buildCartAggregate: jest.fn().mockReturnValue({
                cartId: 'cart_1',
                totalQuantity: 0,
                totalAmount: '0',
                isEmpty: true,
            }),
        };
        const cartPricingService = new cart_pricing_service_1.CartPricingService(cartsRepository);
        const service = new cart_mutation_service_1.CartMutationService(prismaService, {}, {}, cartsRepository, cartPricingService, cartQueryService);
        const result = await service.removeCurrentCustomerCartItem(currentUser, 'cart_item_1');
        expect(cartsRepository.deleteCartItemOptionsByCartItemId).toHaveBeenCalledWith('cart_item_1', expect.anything());
        expect(cartsRepository.deleteCartItem).toHaveBeenCalledWith('cart_item_1', expect.anything());
        expect(cartsRepository.updateCart).toHaveBeenCalledWith('cart_1', expect.objectContaining({
            totalQuantity: 0,
            subtotalAmount: expect.any(client_1.Prisma.Decimal),
            totalAmount: expect.any(client_1.Prisma.Decimal),
        }), expect.anything());
        expect(result).toEqual({
            cartId: 'cart_1',
            totalQuantity: 0,
            totalAmount: '0',
            isEmpty: true,
        });
    });
});
//# sourceMappingURL=cart-mutation.service.spec.js.map
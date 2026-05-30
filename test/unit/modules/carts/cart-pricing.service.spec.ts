import { ItemOptionGroupKind, Prisma } from '@prisma/client';

import { CartsRepository } from '../../../../src/modules/carts/repositories/carts.repository';
import { CartPricingService } from '../../../../src/modules/carts/services/cart-pricing.service';
import { ItemOptionOwnershipRecord } from '../../../../src/modules/menus/entities/item-option-ownership.entity';
import { MenuItemOwnershipRecord } from '../../../../src/modules/menus/entities/menu-item-ownership.entity';

describe('CartPricingService', () => {
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
          role: 'MERCHANT',
          status: 'ACTIVE',
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
      menuItem: makeMenuItem(),
    },
    ...overrides,
  });

  it('computes unit price snapshots from base price plus selected option deltas', () => {
    const service = new CartPricingService({} as CartsRepository);

    const result = service.computeUnitPriceSnapshot(makeMenuItem(), [
      makeOption(),
      makeOption({
        id: 'option_2',
        name: 'Thick rice noodle',
        priceDelta: new Prisma.Decimal('500'),
      }),
    ]);

    expect(result.toString()).toBe('3250');
  });

  it('computes line totals from quantity and unit price snapshots', () => {
    const service = new CartPricingService({} as CartsRepository);

    const result = service.computeLineTotal(3, new Prisma.Decimal('2750'));

    expect(result.toString()).toBe('8250');
  });

  it('computes cart totals from cart item snapshots', () => {
    const service = new CartPricingService({} as CartsRepository);

    const result = service.computeCartTotals([
      {
        quantity: 2,
        lineTotal: new Prisma.Decimal('5500'),
      },
      {
        quantity: 1,
        lineTotal: new Prisma.Decimal('3000'),
      },
    ]);

    expect(result).toEqual({
      totalQuantity: 3,
      subtotalAmount: expect.any(Prisma.Decimal),
      totalAmount: expect.any(Prisma.Decimal),
    });
    expect(result.subtotalAmount.toString()).toBe('8500');
    expect(result.totalAmount.toString()).toBe('8500');
  });

  it('recomputes and persists zero totals for an empty cart', async () => {
    const cartsRepository = {
      listCartItemsByCartIdWithClient: jest.fn().mockResolvedValue([]),
      updateCart: jest.fn().mockResolvedValue({ id: 'cart_1' }),
    } as unknown as CartsRepository;
    const service = new CartPricingService(cartsRepository);

    const result = await service.recomputeCartTotals(
      'cart_1',
      {} as Prisma.TransactionClient,
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
    expect(result.subtotalAmount.toString()).toBe('0');
    expect(result.totalAmount.toString()).toBe('0');
  });
});

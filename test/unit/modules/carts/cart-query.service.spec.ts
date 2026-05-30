import {
  BranchStatus,
  CartStatus,
  MerchantStatus,
  Prisma,
} from '@prisma/client';

import { CartAggregateRecord } from '../../../../src/modules/carts/entities/cart-aggregate.entity';
import { CartsRepository } from '../../../../src/modules/carts/repositories/carts.repository';
import { CartQueryService } from '../../../../src/modules/carts/services/cart-query.service';

describe('CartQueryService', () => {
  const makeCartAggregate = (
    overrides?: Partial<CartAggregateRecord>,
  ): CartAggregateRecord => ({
    id: 'cart_1',
    customerProfileId: 'cust_prof_1',
    branchId: 'branch_1',
    status: CartStatus.ACTIVE,
    totalQuantity: 2,
    subtotalAmount: new Prisma.Decimal('5500'),
    totalAmount: new Prisma.Decimal('5500'),
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    customerProfile: {
      id: 'cust_prof_1',
      userId: 'usr_1',
    },
    branch: {
      id: 'branch_1',
      merchantId: 'merchant_1',
      name: 'Downtown Branch',
      status: BranchStatus.ACTIVE,
      merchant: {
        id: 'merchant_1',
        status: MerchantStatus.ACTIVE,
      },
    },
    items: [
      {
        id: 'cart_item_1',
        cartId: 'cart_1',
        menuItemId: 'item_1',
        quantity: 2,
        unitPriceSnapshot: new Prisma.Decimal('2750'),
        lineTotal: new Prisma.Decimal('5500'),
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        menuItem: {
          id: 'item_1',
          branchId: 'branch_1',
          categoryId: 'cat_1',
          name: 'Mohinga',
          description: 'Signature breakfast item',
          imageUrl: 'https://cdn.example.com/menu/mohinga.png',
          basePrice: new Prisma.Decimal('2500'),
          isAvailable: true,
        },
        selectedOptions: [
          {
            id: 'cart_item_option_1',
            cartItemId: 'cart_item_1',
            itemOptionId: 'option_1',
            nameSnapshot: 'Thin rice noodle',
            priceDeltaSnapshot: new Prisma.Decimal('250'),
            createdAt: new Date('2026-04-19T00:00:00.000Z'),
            updatedAt: new Date('2026-04-19T00:00:00.000Z'),
            itemOption: {
              id: 'option_1',
              name: 'Thin rice noodle',
              isActive: true,
              group: {
                id: 'group_1',
                name: 'Choose noodle type',
                isActive: true,
              },
            },
          },
        ],
      },
    ],
    ...overrides,
  });

  it('returns an empty cart contract when no active cart exists for the branch', async () => {
    const cartsRepository = {
      findActiveCartAggregateByUserIdAndBranchId: jest.fn().mockResolvedValue(null),
    } as unknown as CartsRepository;
    const service = new CartQueryService(cartsRepository);

    const result = await service.getOwnedActiveCartAggregateOrEmpty(
      'usr_1',
      'branch_1',
    );

    expect(result).toEqual({
      cartId: null,
      customerProfileId: null,
      branchId: 'branch_1',
      merchantId: null,
      branchName: null,
      branchStatus: null,
      merchantStatus: null,
      status: CartStatus.ACTIVE,
      totalQuantity: 0,
      subtotalAmount: '0',
      totalAmount: '0',
      isEmpty: true,
      items: [],
    });
  });

  it('builds a nested aggregate for an active cart with selected option snapshots', async () => {
    const cartsRepository = {
      findActiveCartAggregateByUserIdAndBranchId: jest
        .fn()
        .mockResolvedValue(makeCartAggregate()),
    } as unknown as CartsRepository;
    const service = new CartQueryService(cartsRepository);

    const result = await service.getOwnedActiveCartAggregateOrEmpty(
      'usr_1',
      'branch_1',
    );

    expect(result).toEqual({
      cartId: 'cart_1',
      customerProfileId: 'cust_prof_1',
      branchId: 'branch_1',
      merchantId: 'merchant_1',
      branchName: 'Downtown Branch',
      branchStatus: BranchStatus.ACTIVE,
      merchantStatus: MerchantStatus.ACTIVE,
      status: CartStatus.ACTIVE,
      totalQuantity: 2,
      subtotalAmount: '5500',
      totalAmount: '5500',
      isEmpty: false,
      items: [
        {
          cartItemId: 'cart_item_1',
          menuItemId: 'item_1',
          branchId: 'branch_1',
          categoryId: 'cat_1',
          menuItemName: 'Mohinga',
          menuItemDescription: 'Signature breakfast item',
          menuItemImageUrl: 'https://cdn.example.com/menu/mohinga.png',
          menuItemBasePrice: '2500',
          menuItemIsAvailable: true,
          quantity: 2,
          unitPriceSnapshot: '2750',
          lineTotal: '5500',
          selectedOptions: [
            {
              cartItemOptionId: 'cart_item_option_1',
              itemOptionId: 'option_1',
              itemOptionName: 'Thin rice noodle',
              itemOptionIsActive: true,
              optionGroupId: 'group_1',
              optionGroupName: 'Choose noodle type',
              optionGroupIsActive: true,
              nameSnapshot: 'Thin rice noodle',
              priceDeltaSnapshot: '250',
            },
          ],
        },
      ],
    });
  });

  it('returns null for owned-cart aggregate lookup when the user does not own the cart', async () => {
    const cartsRepository = {
      findCartAggregateById: jest.fn().mockResolvedValue(
        makeCartAggregate({
          customerProfile: {
            id: 'cust_prof_2',
            userId: 'usr_2',
          },
        }),
      ),
    } as unknown as CartsRepository;
    const service = new CartQueryService(cartsRepository);

    const result = await service.findOwnedCartAggregateByUserId('usr_1', 'cart_1');

    expect(result).toBeNull();
  });
});

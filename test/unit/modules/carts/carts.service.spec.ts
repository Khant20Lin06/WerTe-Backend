import {
  BranchStatus,
  CartStatus,
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { CartsRepository } from '../../../../src/modules/carts/repositories/carts.repository';
import { CartsService } from '../../../../src/modules/carts/services/carts.service';
import { CartItemOptionOwnershipRecord } from '../../../../src/modules/carts/entities/cart-item-option-ownership.entity';
import { CartItemOwnershipRecord } from '../../../../src/modules/carts/entities/cart-item-ownership.entity';
import { CartOwnershipRecord } from '../../../../src/modules/carts/entities/cart-ownership.entity';

describe('CartsService', () => {
  const makeCart = (
    overrides?: Partial<CartOwnershipRecord>,
  ): CartOwnershipRecord => ({
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
      user: {
        id: 'usr_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
    },
    branch: {
      id: 'branch_1',
      merchantId: 'merchant_1',
      status: BranchStatus.ACTIVE,
      merchant: {
        id: 'merchant_1',
        status: MerchantStatus.ACTIVE,
        user: {
          id: 'usr_merchant_1',
          phone: '0999999999',
          role: UserRole.MERCHANT,
          status: UserStatus.ACTIVE,
        },
      },
    },
    ...overrides,
  });

  const makeCartItem = (
    overrides?: Partial<CartItemOwnershipRecord>,
  ): CartItemOwnershipRecord => ({
    id: 'cart_item_1',
    cartId: 'cart_1',
    menuItemId: 'item_1',
    quantity: 2,
    unitPriceSnapshot: new Prisma.Decimal('2750'),
    lineTotal: new Prisma.Decimal('5500'),
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    cart: {
      id: 'cart_1',
      customerProfileId: 'cust_prof_1',
      branchId: 'branch_1',
      status: CartStatus.ACTIVE,
      customerProfile: {
        id: 'cust_prof_1',
        userId: 'usr_1',
        user: {
          id: 'usr_1',
          phone: '09123456789',
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE,
        },
      },
      branch: {
        id: 'branch_1',
        merchantId: 'merchant_1',
        status: BranchStatus.ACTIVE,
        merchant: {
          id: 'merchant_1',
          status: MerchantStatus.ACTIVE,
          user: {
            id: 'usr_merchant_1',
            phone: '0999999999',
            role: UserRole.MERCHANT,
            status: UserStatus.ACTIVE,
          },
        },
      },
    },
    menuItem: {
      id: 'item_1',
      branchId: 'branch_1',
      categoryId: 'cat_1',
      name: 'Mohinga',
      basePrice: new Prisma.Decimal('2500'),
      isAvailable: true,
      branch: {
        id: 'branch_1',
        merchantId: 'merchant_1',
        status: BranchStatus.ACTIVE,
        merchant: {
          id: 'merchant_1',
          status: MerchantStatus.ACTIVE,
          user: {
            id: 'usr_merchant_1',
            phone: '0999999999',
            role: UserRole.MERCHANT,
            status: UserStatus.ACTIVE,
          },
        },
      },
    },
    ...overrides,
  });

  const makeCartItemOption = (
    overrides?: Partial<CartItemOptionOwnershipRecord>,
  ): CartItemOptionOwnershipRecord => ({
    id: 'cart_item_option_1',
    cartItemId: 'cart_item_1',
    itemOptionId: 'option_1',
    nameSnapshot: 'Thin rice noodle',
    priceDeltaSnapshot: new Prisma.Decimal('250'),
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    cartItem: {
      id: 'cart_item_1',
      cartId: 'cart_1',
      cart: {
        id: 'cart_1',
        customerProfileId: 'cust_prof_1',
        branchId: 'branch_1',
        status: CartStatus.ACTIVE,
        customerProfile: {
          id: 'cust_prof_1',
          userId: 'usr_1',
          user: {
            id: 'usr_1',
            phone: '09123456789',
            role: UserRole.CUSTOMER,
            status: UserStatus.ACTIVE,
          },
        },
        branch: {
          id: 'branch_1',
          merchantId: 'merchant_1',
          status: BranchStatus.ACTIVE,
          merchant: {
            id: 'merchant_1',
            status: MerchantStatus.ACTIVE,
            user: {
              id: 'usr_merchant_1',
              phone: '0999999999',
              role: UserRole.MERCHANT,
              status: UserStatus.ACTIVE,
            },
          },
        },
      },
    },
    itemOption: {
      id: 'option_1',
      name: 'Thin rice noodle',
      isActive: true,
      group: {
        id: 'group_1',
        name: 'Choose noodle type',
        isActive: true,
        menuItem: {
          id: 'item_1',
          branchId: 'branch_1',
          name: 'Mohinga',
          isAvailable: true,
          branch: {
            id: 'branch_1',
            merchantId: 'merchant_1',
            status: BranchStatus.ACTIVE,
            merchant: {
              id: 'merchant_1',
              status: MerchantStatus.ACTIVE,
              user: {
                id: 'usr_merchant_1',
                phone: '0999999999',
                role: UserRole.MERCHANT,
                status: UserStatus.ACTIVE,
              },
            },
          },
        },
      },
    },
    ...overrides,
  });

  it('finds an active cart owned by a user for a branch', async () => {
    const cartsRepository = {
      findActiveCartByUserIdAndBranchId: jest.fn().mockResolvedValue(makeCart()),
    } as unknown as CartsRepository;
    const service = new CartsService(cartsRepository);

    const result = await service.findActiveOwnedByUserIdAndBranchId(
      'usr_1',
      'branch_1',
    );

    expect(cartsRepository.findActiveCartByUserIdAndBranchId).toHaveBeenCalledWith(
      'usr_1',
      'branch_1',
    );
    expect(result?.id).toBe('cart_1');
  });

  it('returns null when a cart item is not owned by the user', async () => {
    const cartsRepository = {
      findCartItemById: jest.fn().mockResolvedValue(
        makeCartItem({
          cart: {
            id: 'cart_2',
            customerProfileId: 'cust_prof_2',
            branchId: 'branch_1',
            status: CartStatus.ACTIVE,
            customerProfile: {
              id: 'cust_prof_2',
              userId: 'usr_2',
              user: {
                id: 'usr_2',
                phone: '0991111111',
                role: UserRole.CUSTOMER,
                status: UserStatus.ACTIVE,
              },
            },
            branch: {
              id: 'branch_1',
              merchantId: 'merchant_1',
              status: BranchStatus.ACTIVE,
              merchant: {
                id: 'merchant_1',
                status: MerchantStatus.ACTIVE,
                user: {
                  id: 'usr_merchant_1',
                  phone: '0999999999',
                  role: UserRole.MERCHANT,
                  status: UserStatus.ACTIVE,
                },
              },
            },
          },
        }),
      ),
    } as unknown as CartsRepository;
    const service = new CartsService(cartsRepository);

    const result = await service.findOwnedCartItemByUserId('usr_1', 'cart_item_1');

    expect(result).toBeNull();
  });

  it('builds cart ownership entities with serialized money values', () => {
    const service = new CartsService({} as CartsRepository);

    expect(service.buildCartOwnership(makeCart())).toEqual({
      cartId: 'cart_1',
      customerProfileId: 'cust_prof_1',
      userId: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      userStatus: UserStatus.ACTIVE,
      branchId: 'branch_1',
      merchantId: 'merchant_1',
      merchantStatus: MerchantStatus.ACTIVE,
      branchStatus: BranchStatus.ACTIVE,
      status: CartStatus.ACTIVE,
      totalQuantity: 2,
      subtotalAmount: '5500',
      totalAmount: '5500',
    });
  });

  it('builds cart item option ownership entities with serialized price delta snapshots', () => {
    const service = new CartsService({} as CartsRepository);

    expect(service.buildCartItemOptionOwnership(makeCartItemOption())).toEqual({
      cartItemOptionId: 'cart_item_option_1',
      cartItemId: 'cart_item_1',
      cartId: 'cart_1',
      customerProfileId: 'cust_prof_1',
      userId: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      userStatus: UserStatus.ACTIVE,
      branchId: 'branch_1',
      merchantId: 'merchant_1',
      merchantStatus: MerchantStatus.ACTIVE,
      branchStatus: BranchStatus.ACTIVE,
      cartStatus: CartStatus.ACTIVE,
      itemOptionId: 'option_1',
      itemOptionName: 'Thin rice noodle',
      itemOptionIsActive: true,
      optionGroupId: 'group_1',
      optionGroupName: 'Choose noodle type',
      optionGroupIsActive: true,
      menuItemId: 'item_1',
      menuItemName: 'Mohinga',
      menuItemIsAvailable: true,
      nameSnapshot: 'Thin rice noodle',
      priceDeltaSnapshot: '250',
    });
  });
});

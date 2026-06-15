import { HttpStatus } from '@nestjs/common';
import {
  BranchStatus,
  CartStatus,
  ItemOptionGroupKind,
  MerchantStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { CartAggregateEntity } from '../../../../src/modules/carts/entities/cart-aggregate.entity';
import { BranchOwnershipRecord } from '../../../../src/modules/branches/entities/branch-ownership.entity';
import { CheckoutValidationService } from '../../../../src/modules/checkout/services/checkout-validation.service';
import { MenusService } from '../../../../src/modules/menus/services/menus.service';

function makeBranch(
  overrides?: Partial<BranchOwnershipRecord>,
): BranchOwnershipRecord {
  return {
    id: 'branch_1',
    merchantId: 'merchant_1',
    name: 'Downtown Branch',
    contactPhone: null,
    line1: 'No. 1',
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
      name: 'Merchant One',
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
    operatingHours: null,
    staffAssignments: [],
    ...overrides,
  };
}

function makeCart(
  overrides?: Partial<CartAggregateEntity>,
): CartAggregateEntity {
  return {
    cartId: 'cart_1',
    customerProfileId: 'cust_prof_1',
    branchId: 'branch_1',
    merchantId: 'merchant_1',
    branchName: 'Downtown Branch',
    branchStatus: BranchStatus.ACTIVE,
    merchantStatus: MerchantStatus.ACTIVE,
    status: CartStatus.ACTIVE,
    totalQuantity: 1,
    subtotalAmount: '3000',
    totalAmount: '3000',
    isEmpty: false,
    items: [
      {
        cartItemId: 'cart_item_1',
        menuItemId: 'item_1',
        branchId: 'branch_1',
        categoryId: 'cat_1',
        menuItemName: 'Mohinga',
        menuItemDescription: 'Breakfast item',
        menuItemImageUrl: null,
        menuItemBasePrice: '2500',
        menuItemIsAvailable: true,
        quantity: 1,
        unitPriceSnapshot: '3000',
        lineTotal: '3000',
        selectedOptions: [
          {
            cartItemOptionId: 'cart_item_option_1',
            itemOptionId: 'option_1',
            itemOptionName: 'Extra fish cake',
            itemOptionIsActive: true,
            optionGroupId: 'group_1',
            optionGroupName: 'Choose extras',
            optionGroupIsActive: true,
            nameSnapshot: 'Extra fish cake',
            priceDeltaSnapshot: '500',
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe('CheckoutValidationService', () => {
  const makeMenusService = (overrides?: Record<string, unknown>) =>
    ({
      findItemById: jest.fn().mockResolvedValue({
        id: 'item_1',
        isAvailable: true,
        isStockTracked: false,
        stockQuantity: null,
        branch: {
          id: 'branch_1',
        },
      }),
      listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([
        {
          id: 'group_1',
          kind: ItemOptionGroupKind.ADD_ON,
          minSelect: 1,
          maxSelect: 1,
          isActive: true,
        },
      ]),
      listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
        {
          id: 'option_1',
          isActive: true,
          isStockTracked: false,
          stockQuantity: null,
          group: {
            id: 'group_1',
            kind: ItemOptionGroupKind.ADD_ON,
          },
        },
      ]),
      findActiveVariantCombinationByMenuItemIdAndOptionIds: jest
        .fn()
        .mockResolvedValue(null),
      ...overrides,
    }) as unknown as MenusService;

  it('accepts an orderable cart whose selection state still matches active menu rules', async () => {
    const menusService = makeMenusService();
    const service = new CheckoutValidationService(menusService);

    await expect(
      service.assertCartReadyForCheckout(makeBranch(), makeCart()),
    ).resolves.toBeUndefined();
  });

  it('rejects checkout when the branch is inactive', async () => {
    const service = new CheckoutValidationService({} as MenusService);

    await expect(
      service.assertCartReadyForCheckout(
        makeBranch({ status: BranchStatus.INACTIVE }),
        makeCart({ items: [] }),
      ),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
      }),
    });
  });

  it('rejects checkout when the merchant is inactive', async () => {
    const service = new CheckoutValidationService({} as MenusService);

    await expect(
      service.assertCartReadyForCheckout(
        makeBranch({
          merchant: {
            ...makeBranch().merchant,
            status: MerchantStatus.SUSPENDED,
          },
        }),
        makeCart({ items: [] }),
      ),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
      }),
    });
  });

  it('rejects checkout when the active cart is empty', async () => {
    const service = new CheckoutValidationService({} as MenusService);

    await expect(
      service.assertCartReadyForCheckout(
        makeBranch(),
        makeCart({
          cartId: null,
          isEmpty: true,
          totalQuantity: 0,
          subtotalAmount: '0',
          totalAmount: '0',
          items: [],
        }),
      ),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
      }),
    });
  });

  it('rejects checkout when a cart item is no longer available', async () => {
    const service = new CheckoutValidationService({} as MenusService);

    await expect(
      service.assertCartReadyForCheckout(
        makeBranch(),
        makeCart({
          items: [
            {
              ...makeCart().items[0],
              menuItemIsAvailable: false,
            },
          ],
        }),
      ),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
      }),
    });
  });

  it('rejects checkout when selected options no longer satisfy the active option group rules', async () => {
    const menusService = makeMenusService({
      listOptionsByOptionGroupId: jest.fn().mockResolvedValue([]),
    });
    const service = new CheckoutValidationService(menusService);

    await expect(
      service.assertCartReadyForCheckout(makeBranch(), makeCart()),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
      }),
    });
  });

  it('rejects checkout when a tracked menu item no longer has enough stock', async () => {
    const service = new CheckoutValidationService(
      makeMenusService({
        findItemById: jest.fn().mockResolvedValue({
          id: 'item_1',
          isAvailable: true,
          isStockTracked: true,
          stockQuantity: 1,
          branch: {
            id: 'branch_1',
          },
        }),
      }),
    );

    await expect(
      service.assertCartReadyForCheckout(
        makeBranch(),
        makeCart({
          items: [
            {
              ...makeCart().items[0],
              quantity: 2,
            },
          ],
        }),
      ),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
        details: expect.objectContaining({
          menuItemId: 'item_1',
          stockQuantity: 1,
          requestedQuantity: 2,
        }),
      }),
    });
  });

  it('rejects checkout when a tracked selected option no longer has enough stock', async () => {
    const service = new CheckoutValidationService(
      makeMenusService({
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
          {
            id: 'option_1',
            isActive: true,
            isStockTracked: true,
            stockQuantity: 0,
            group: {
              id: 'group_1',
            },
          },
        ]),
      }),
    );

    await expect(
      service.assertCartReadyForCheckout(makeBranch(), makeCart()),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
        details: expect.objectContaining({
          itemOptionId: 'option_1',
          stockQuantity: 0,
          requestedQuantity: 1,
        }),
      }),
    });
  });

  it('rejects checkout when selected variant options no longer match an active combination', async () => {
    const service = new CheckoutValidationService(
      makeMenusService({
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([
          {
            id: 'group_1',
            kind: ItemOptionGroupKind.VARIANT_SELECTOR,
            minSelect: 1,
            maxSelect: 1,
            isActive: true,
          },
        ]),
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
          {
            id: 'option_1',
            isActive: true,
            isStockTracked: false,
            stockQuantity: null,
            group: {
              id: 'group_1',
              kind: ItemOptionGroupKind.VARIANT_SELECTOR,
            },
          },
        ]),
        findActiveVariantCombinationByMenuItemIdAndOptionIds: jest
          .fn()
          .mockResolvedValue(null),
      }),
    );

    await expect(
      service.assertCartReadyForCheckout(makeBranch(), makeCart()),
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

  it('rejects checkout when the selected variant combination no longer has enough stock', async () => {
    const service = new CheckoutValidationService(
      makeMenusService({
        listOptionGroupsByMenuItemId: jest.fn().mockResolvedValue([
          {
            id: 'group_1',
            kind: ItemOptionGroupKind.VARIANT_SELECTOR,
            minSelect: 1,
            maxSelect: 1,
            isActive: true,
          },
        ]),
        listOptionsByOptionGroupId: jest.fn().mockResolvedValue([
          {
            id: 'option_1',
            isActive: true,
            isStockTracked: false,
            stockQuantity: null,
            group: {
              id: 'group_1',
              kind: ItemOptionGroupKind.VARIANT_SELECTOR,
            },
          },
        ]),
        findActiveVariantCombinationByMenuItemIdAndOptionIds: jest
          .fn()
          .mockResolvedValue({
            id: 'combo_1',
            isStockTracked: true,
            stockQuantity: 0,
          }),
      }),
    );

    await expect(
      service.assertCartReadyForCheckout(makeBranch(), makeCart()),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
        details: expect.objectContaining({
          combinationId: 'combo_1',
          requestedQuantity: 1,
        }),
      }),
    });
  });
});

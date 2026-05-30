import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { CartAggregateEntity } from '../../../../src/modules/carts/entities/cart-aggregate.entity';
import { CustomerCartService } from '../../../../src/modules/carts/services/customer-cart.service';
import { CartMutationService } from '../../../../src/modules/carts/services/cart-mutation.service';
import { CartQueryService } from '../../../../src/modules/carts/services/cart-query.service';

function makeCartAggregate(
  overrides?: Partial<CartAggregateEntity>,
): CartAggregateEntity {
  return {
    cartId: 'cart_1',
    customerProfileId: 'customer_1',
    branchId: 'branch_1',
    merchantId: 'merchant_1',
    branchName: 'Downtown Branch',
    branchStatus: 'ACTIVE' as CartAggregateEntity['branchStatus'],
    merchantStatus: 'ACTIVE' as CartAggregateEntity['merchantStatus'],
    status: 'ACTIVE' as CartAggregateEntity['status'],
    totalQuantity: 2,
    subtotalAmount: '6000',
    totalAmount: '6000',
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
        quantity: 2,
        unitPriceSnapshot: '3000',
        lineTotal: '6000',
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

describe('CustomerCartService', () => {
  it('returns the active customer cart for the requested branch', async () => {
    const currentUser = makeAuthenticatedUser();
    const cartQueryService = {
      getOwnedActiveCartAggregateOrEmpty: jest.fn().mockResolvedValue(makeCartAggregate()),
    } as unknown as jest.Mocked<CartQueryService>;
    const cartMutationService = {} as jest.Mocked<CartMutationService>;
    const service = new CustomerCartService(cartQueryService, cartMutationService);

    await expect(
      service.getCurrentCustomerCart(currentUser, 'branch_1'),
    ).resolves.toMatchObject({
      cartId: 'cart_1',
      branchId: 'branch_1',
      totalQuantity: 2,
      items: [
        expect.objectContaining({
          cartItemId: 'cart_item_1',
          selectedOptions: [
            expect.objectContaining({
              cartItemOptionId: 'cart_item_option_1',
            }),
          ],
        }),
      ],
    });

    expect(cartQueryService.getOwnedActiveCartAggregateOrEmpty).toHaveBeenCalledWith(
      currentUser.userId,
      'branch_1',
    );
  });

  it('adds a cart item and returns the updated cart aggregate', async () => {
    const currentUser = makeAuthenticatedUser();
    const cartMutationService = {
      addCurrentCustomerCartItem: jest.fn().mockResolvedValue(makeCartAggregate()),
    } as unknown as jest.Mocked<CartMutationService>;
    const cartQueryService = {} as jest.Mocked<CartQueryService>;
    const service = new CustomerCartService(cartQueryService, cartMutationService);

    await expect(
      service.addCurrentCustomerCartItem(currentUser, {
        branchId: 'branch_1',
        menuItemId: 'item_1',
        quantity: 2,
        selectedOptionIds: ['option_1'],
      }),
    ).resolves.toMatchObject({
      cartId: 'cart_1',
      totalQuantity: 2,
    });

    expect(cartMutationService.addCurrentCustomerCartItem).toHaveBeenCalledWith(
      currentUser,
      'branch_1',
      {
        menuItemId: 'item_1',
        quantity: 2,
        selectedOptionIds: ['option_1'],
      },
    );
  });

  it('updates a cart item and returns the updated cart aggregate', async () => {
    const currentUser = makeAuthenticatedUser();
    const cartMutationService = {
      updateCurrentCustomerCartItem: jest.fn().mockResolvedValue(makeCartAggregate()),
    } as unknown as jest.Mocked<CartMutationService>;
    const cartQueryService = {} as jest.Mocked<CartQueryService>;
    const service = new CustomerCartService(cartQueryService, cartMutationService);

    await service.updateCurrentCustomerCartItem(currentUser, 'cart_item_1', {
      quantity: 3,
      selectedOptionIds: ['option_2'],
    });

    expect(cartMutationService.updateCurrentCustomerCartItem).toHaveBeenCalledWith(
      currentUser,
      'cart_item_1',
      {
        quantity: 3,
        selectedOptionIds: ['option_2'],
      },
    );
  });

  it('removes a cart item and returns the updated cart aggregate', async () => {
    const currentUser = makeAuthenticatedUser();
    const cartMutationService = {
      removeCurrentCustomerCartItem: jest.fn().mockResolvedValue(
        makeCartAggregate({
          isEmpty: true,
          totalQuantity: 0,
          subtotalAmount: '0',
          totalAmount: '0',
          items: [],
        }),
      ),
    } as unknown as jest.Mocked<CartMutationService>;
    const cartQueryService = {} as jest.Mocked<CartQueryService>;
    const service = new CustomerCartService(cartQueryService, cartMutationService);

    await expect(
      service.removeCurrentCustomerCartItem(currentUser, 'cart_item_1'),
    ).resolves.toMatchObject({
      isEmpty: true,
      totalQuantity: 0,
    });

    expect(cartMutationService.removeCurrentCustomerCartItem).toHaveBeenCalledWith(
      currentUser,
      'cart_item_1',
    );
  });

  it('clears a branch cart and returns the empty cart aggregate', async () => {
    const currentUser = makeAuthenticatedUser();
    const cartMutationService = {
      clearCurrentCustomerBranchCart: jest.fn().mockResolvedValue(
        makeCartAggregate({
          cartId: null,
          customerProfileId: null,
          merchantId: null,
          branchName: null,
          branchStatus: null,
          merchantStatus: null,
          isEmpty: true,
          totalQuantity: 0,
          subtotalAmount: '0',
          totalAmount: '0',
          items: [],
        }),
      ),
    } as unknown as jest.Mocked<CartMutationService>;
    const cartQueryService = {} as jest.Mocked<CartQueryService>;
    const service = new CustomerCartService(cartQueryService, cartMutationService);

    await expect(
      service.clearCurrentCustomerCart(currentUser, 'branch_1'),
    ).resolves.toMatchObject({
      cartId: null,
      branchId: 'branch_1',
      isEmpty: true,
    });

    expect(cartMutationService.clearCurrentCustomerBranchCart).toHaveBeenCalledWith(
      currentUser,
      'branch_1',
    );
  });
});

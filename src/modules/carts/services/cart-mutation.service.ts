import { HttpStatus, Injectable } from '@nestjs/common';
import { ItemOptionGroupKind, Prisma } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CustomerProfileOwnershipRecord } from '../../customer-profiles/entities/customer-profile-ownership.entity';
import { CustomerProfilesService } from '../../customer-profiles/services/customer-profiles.service';
import { ItemOptionOwnershipRecord } from '../../menus/entities/item-option-ownership.entity';
import { MenuItemOwnershipRecord } from '../../menus/entities/menu-item-ownership.entity';
import { MenusService } from '../../menus/services/menus.service';
import {
  CartAggregateEntity,
  CartAggregateRecord,
} from '../entities/cart-aggregate.entity';
import { CartItemOwnershipRecord } from '../entities/cart-item-ownership.entity';
import { hasCustomerCartAccess } from '../policies/customer-cart-access-policy.helper';
import { CartsRepository } from '../repositories/carts.repository';
import { CartPricingService } from './cart-pricing.service';
import { CartQueryService } from './cart-query.service';

export type AddCartItemInput = {
  menuItemId: string;
  quantity: number;
  selectedOptionIds?: string[];
};

export type UpdateCartItemInput = {
  quantity: number;
  selectedOptionIds?: string[];
};

@Injectable()
export class CartMutationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerProfilesService: CustomerProfilesService,
    private readonly menusService: MenusService,
    private readonly cartsRepository: CartsRepository,
    private readonly cartPricingService: CartPricingService,
    private readonly cartQueryService: CartQueryService,
  ) {}

  async addCurrentCustomerCartItem(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    payload: AddCartItemInput,
  ): Promise<CartAggregateEntity> {
    this.assertPositiveQuantity(payload.quantity);

    const profile = await this.resolveCurrentCustomerProfile(currentUser);
    const menuItem = await this.resolveMenuItemForBranch(branchId, payload.menuItemId);
    const selectedOptions = await this.resolveSelectedOptionsForMenuItem(
      menuItem.id,
      payload.selectedOptionIds ?? [],
      payload.quantity,
    );
    const unitPriceSnapshot = this.cartPricingService.computeUnitPriceSnapshot(
      menuItem,
      selectedOptions,
    );
    const lineTotal = this.cartPricingService.computeLineTotal(
      payload.quantity,
      unitPriceSnapshot,
    );

    const cartId = await this.prisma.runInTransaction(async (tx) => {
      const cart =
        (await this.cartsRepository.findActiveCartByCustomerProfileIdAndBranchId(
          profile.id,
          branchId,
          tx,
        )) ??
        (await this.cartsRepository.createCart(
          {
            customerProfileId: profile.id,
            branchId,
            totalQuantity: 0,
            subtotalAmount: 0,
            totalAmount: 0,
          },
          tx,
        ));

      const cartItem = await this.cartsRepository.createCartItem(
        {
          cartId: cart.id,
          menuItemId: menuItem.id,
          quantity: payload.quantity,
          unitPriceSnapshot,
          lineTotal,
        },
        tx,
      );

      await this.cartsRepository.createCartItemOptions(
        selectedOptions.map((option) => ({
          cartItemId: cartItem.id,
          itemOptionId: option.id,
          nameSnapshot: option.name,
          priceDeltaSnapshot: option.priceDelta,
        })),
        tx,
      );

      await this.cartPricingService.recomputeCartTotals(cart.id, tx);

      return cart.id;
    });

    return this.resolveCartAggregateOrThrow(cartId);
  }

  async updateCurrentCustomerCartItem(
    currentUser: AuthenticatedUserEntity,
    cartItemId: string,
    payload: UpdateCartItemInput,
  ): Promise<CartAggregateEntity> {
    this.assertPositiveQuantity(payload.quantity);

    const cartItem = await this.resolveOwnedCartItem(currentUser, cartItemId);
    const menuItem = await this.resolveMenuItemForBranch(
      cartItem.cart.branch.id,
      cartItem.menuItem.id,
    );

    const cartId = await this.prisma.runInTransaction(async (tx) => {
      let unitPriceSnapshot = new Prisma.Decimal(cartItem.unitPriceSnapshot);

      if (payload.selectedOptionIds !== undefined) {
        const selectedOptions = await this.resolveSelectedOptionsForMenuItem(
          menuItem.id,
          payload.selectedOptionIds,
          payload.quantity,
        );

        unitPriceSnapshot = this.cartPricingService.computeUnitPriceSnapshot(
          menuItem,
          selectedOptions,
        );

        await this.cartsRepository.deleteCartItemOptionsByCartItemId(cartItem.id, tx);
        await this.cartsRepository.createCartItemOptions(
          selectedOptions.map((option) => ({
            cartItemId: cartItem.id,
            itemOptionId: option.id,
            nameSnapshot: option.name,
            priceDeltaSnapshot: option.priceDelta,
          })),
          tx,
        );
      } else {
        const existingCartItemOptions =
          await this.cartsRepository.listCartItemOptionsByCartItemIdWithClient(
            cartItem.id,
            tx,
          );

        await this.resolveSelectedOptionsForMenuItem(
          menuItem.id,
          existingCartItemOptions.map((option) => option.itemOption.id),
          payload.quantity,
        );
      }

      await this.cartsRepository.updateCartItem(
        cartItem.id,
        {
          quantity: payload.quantity,
          unitPriceSnapshot,
          lineTotal: this.cartPricingService.computeLineTotal(
            payload.quantity,
            unitPriceSnapshot,
          ),
        },
        tx,
      );

      await this.cartPricingService.recomputeCartTotals(cartItem.cart.id, tx);

      return cartItem.cart.id;
    });

    return this.resolveCartAggregateOrThrow(cartId);
  }

  async removeCurrentCustomerCartItem(
    currentUser: AuthenticatedUserEntity,
    cartItemId: string,
  ): Promise<CartAggregateEntity> {
    const cartItem = await this.resolveOwnedCartItem(currentUser, cartItemId);

    const cartId = await this.prisma.runInTransaction(async (tx) => {
      await this.cartsRepository.deleteCartItemOptionsByCartItemId(cartItem.id, tx);
      await this.cartsRepository.deleteCartItem(cartItem.id, tx);
      await this.cartPricingService.recomputeCartTotals(cartItem.cart.id, tx);

      return cartItem.cart.id;
    });

    return this.resolveCartAggregateOrThrow(cartId);
  }

  async clearCurrentCustomerBranchCart(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<CartAggregateEntity> {
    const profile = await this.resolveCurrentCustomerProfile(currentUser);
    const cart = await this.cartsRepository.findActiveCartByCustomerProfileIdAndBranchId(
      profile.id,
      branchId,
    );

    if (cart === null) {
      return this.cartQueryService.buildEmptyCartAggregate(branchId);
    }

    await this.prisma.runInTransaction(async (tx) => {
      await this.cartsRepository.deleteCartItemOptionsByCartId(cart.id, tx);
      await this.cartsRepository.deleteCartItemsByCartId(cart.id, tx);
      await this.cartPricingService.recomputeCartTotals(cart.id, tx);
    });

    return this.resolveCartAggregateOrThrow(cart.id);
  }

  private async resolveCurrentCustomerProfile(
    currentUser: AuthenticatedUserEntity,
  ): Promise<CustomerProfileOwnershipRecord> {
    const actorCustomerProfileId = currentUser.actorContext.customerProfileId;
    const profile =
      actorCustomerProfileId !== undefined
        ? await this.customerProfilesService.findOwnedByUserId(
            currentUser.userId,
            actorCustomerProfileId,
          )
        : await this.customerProfilesService.findByUserId(currentUser.userId);

    if (profile === null) {
      throw new AppException(
        'Customer profile was not found for the authenticated user.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    if (
      !hasCustomerCartAccess({
        currentUser,
        ownerUserId: profile.user.id,
        customerProfileId: profile.id,
      })
    ) {
      throw new AppException(
        'You are not allowed to access this customer cart context.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return profile;
  }

  private async resolveOwnedCartItem(
    currentUser: AuthenticatedUserEntity,
    cartItemId: string,
  ): Promise<CartItemOwnershipRecord> {
    const cartItem = await this.cartsRepository.findCartItemById(cartItemId);

    if (
      cartItem === null ||
      !hasCustomerCartAccess({
        currentUser,
        ownerUserId: cartItem.cart.customerProfile.user.id,
        customerProfileId: cartItem.cart.customerProfile.id,
      })
    ) {
      throw new AppException('Cart item was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    return cartItem;
  }

  private async resolveMenuItemForBranch(
    branchId: string,
    menuItemId: string,
  ): Promise<MenuItemOwnershipRecord> {
    const menuItem = await this.menusService.findItemById(menuItemId);

    if (menuItem === null || menuItem.branch.id !== branchId) {
      throw new AppException(
        'Menu item was not found for the requested branch.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    if (!menuItem.isAvailable) {
      throw new AppException(
        'The requested menu item is not currently available.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    return menuItem;
  }

  private async resolveSelectedOptionsForMenuItem(
    menuItemId: string,
    selectedOptionIds: string[],
    quantity: number,
  ): Promise<ItemOptionOwnershipRecord[]> {
    this.assertNoDuplicateOptionSelection(selectedOptionIds);

    const optionGroups = await this.menusService.listOptionGroupsByMenuItemId(menuItemId);
    const activeGroups = optionGroups.filter((group) => group.isActive);
    const optionsByGroup = await Promise.all(
      activeGroups.map(async (group) => ({
        group,
        options: (await this.menusService.listOptionsByOptionGroupId(group.id)).filter(
          (option) => option.isActive,
        ),
      })),
    );

    const optionMap = new Map<string, ItemOptionOwnershipRecord>();
    const selectionCountByGroup = new Map<string, number>();

    for (const entry of optionsByGroup) {
      for (const option of entry.options) {
        optionMap.set(option.id, option);
      }

      selectionCountByGroup.set(entry.group.id, 0);
    }

    const selectedOptions = selectedOptionIds.map((optionId) => {
      const option = optionMap.get(optionId);
      if (option === undefined) {
        throw new AppException(
          'One or more selected item options are not valid for the requested menu item.',
          HttpStatus.UNPROCESSABLE_ENTITY,
          {
            code: ErrorCodes.unprocessableEntity,
          },
        );
      }

      selectionCountByGroup.set(
        option.group.id,
        (selectionCountByGroup.get(option.group.id) ?? 0) + 1,
      );

      return option;
    });

    for (const group of activeGroups) {
      const selectedCount = selectionCountByGroup.get(group.id) ?? 0;

      if (selectedCount < group.minSelect || selectedCount > group.maxSelect) {
        throw new AppException(
          'Selected item options do not satisfy the option group selection rules.',
          HttpStatus.UNPROCESSABLE_ENTITY,
          {
            code: ErrorCodes.unprocessableEntity,
            details: {
              optionGroupId: group.id,
              minSelect: group.minSelect,
              maxSelect: group.maxSelect,
              selectedCount,
            },
          },
        );
      }
    }

    this.assertSelectedOptionsHaveAvailableStock(selectedOptions, quantity);
    await this.assertSelectedVariantCombinationIsValid(
      menuItemId,
      selectedOptions,
      quantity,
    );

    return selectedOptions;
  }

  private async resolveCartAggregateOrThrow(
    cartId: string,
  ): Promise<CartAggregateEntity> {
    const aggregate = await this.cartQueryService.findCartAggregateById(cartId);

    if (aggregate === null) {
      throw new AppException(
        'Cart aggregate was not found after the requested mutation.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          code: ErrorCodes.internalServerError,
        },
      );
    }

    return this.cartQueryService.buildCartAggregate(aggregate);
  }

  private async assertSelectedVariantCombinationIsValid(
    menuItemId: string,
    selectedOptions: ItemOptionOwnershipRecord[],
    quantity: number,
  ): Promise<void> {
    const selectedVariantOptionIds = selectedOptions
      .filter(
        (option) => option.group.kind === ItemOptionGroupKind.VARIANT_SELECTOR,
      )
      .map((option) => option.id);

    if (selectedVariantOptionIds.length === 0) {
      return;
    }

    const combination =
      await this.menusService.findActiveVariantCombinationByMenuItemIdAndOptionIds(
        menuItemId,
        selectedVariantOptionIds,
      );

    if (combination === null) {
      throw new AppException(
        'Selected variant options do not match an active variant combination for the requested menu item.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            menuItemId,
            selectedVariantOptionIds,
          },
        },
      );
    }

    if (
      combination.isStockTracked &&
      (combination.stockQuantity ?? 0) < quantity
    ) {
      throw new AppException(
        'The selected variant combination does not have enough remaining stock.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            combinationId: combination.id,
            stockQuantity: combination.stockQuantity ?? 0,
            requestedQuantity: quantity,
          },
        },
      );
    }
  }

  private assertPositiveQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new AppException(
        'Cart item quantity must be a positive integer.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            quantity,
          },
        },
      );
    }
  }

  private assertNoDuplicateOptionSelection(selectedOptionIds: string[]): void {
    if (new Set(selectedOptionIds).size !== selectedOptionIds.length) {
      throw new AppException(
        'Each selected item option must be unique within a cart item.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }
  }

  private assertSelectedOptionsHaveAvailableStock(
    selectedOptions: ItemOptionOwnershipRecord[],
    quantity: number,
  ): void {
    const unavailableOption = selectedOptions.find((option) => {
      if (!option.isStockTracked) {
        return false;
      }

      return (option.stockQuantity ?? 0) < quantity;
    });

    if (unavailableOption === undefined) {
      return;
    }

    throw new AppException(
      'One or more selected item variants or add-ons do not have enough stock for the requested quantity.',
      HttpStatus.UNPROCESSABLE_ENTITY,
      {
        code: ErrorCodes.unprocessableEntity,
        details: {
          optionId: unavailableOption.id,
          stockQuantity: unavailableOption.stockQuantity ?? 0,
          requestedQuantity: quantity,
        },
      },
    );
  }
}

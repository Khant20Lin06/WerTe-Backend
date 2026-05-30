import { HttpStatus, Injectable } from '@nestjs/common';
import {
  BranchStatus,
  ItemOptionGroupKind,
  MerchantStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { CartAggregateEntity, CartAggregateItemEntity } from '../../carts/entities/cart-aggregate.entity';
import { BranchOwnershipRecord } from '../../branches/entities/branch-ownership.entity';
import { ItemOptionOwnershipRecord } from '../../menus/entities/item-option-ownership.entity';
import { MenusService } from '../../menus/services/menus.service';

@Injectable()
export class CheckoutValidationService {
  constructor(private readonly menusService: MenusService) {}

  async assertCartReadyForCheckout(
    branch: BranchOwnershipRecord,
    cart: CartAggregateEntity,
  ): Promise<void> {
    this.assertBranchIsOrderable(branch);
    this.assertCartIsNotEmpty(cart);
    this.assertCartBranchMatches(branch, cart);

    for (const item of cart.items) {
      this.assertMenuItemIsAvailable(item);
      await this.assertMenuItemInventoryRemainsAvailable(item);
      await this.assertCartItemSelectionsRemainValid(item);
    }
  }

  private assertBranchIsOrderable(branch: BranchOwnershipRecord): void {
    if (branch.status !== BranchStatus.ACTIVE) {
      throw new AppException(
        'The requested branch is not currently accepting checkout requests.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            branchId: branch.id,
            branchStatus: branch.status,
          },
        },
      );
    }

    if (branch.merchant.status !== MerchantStatus.ACTIVE) {
      throw new AppException(
        'The merchant that owns the requested branch is not currently orderable.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            branchId: branch.id,
            merchantId: branch.merchant.id,
            merchantStatus: branch.merchant.status,
          },
        },
      );
    }
  }

  private assertCartIsNotEmpty(cart: CartAggregateEntity): void {
    if (cart.isEmpty || cart.cartId === null || cart.items.length === 0) {
      throw new AppException(
        'A non-empty active cart is required before checkout.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }
  }

  private assertCartBranchMatches(
    branch: BranchOwnershipRecord,
    cart: CartAggregateEntity,
  ): void {
    if (cart.branchId !== branch.id) {
      throw new AppException(
        'The requested cart does not belong to the requested branch.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            cartBranchId: cart.branchId,
            requestedBranchId: branch.id,
          },
        },
      );
    }
  }

  private assertMenuItemIsAvailable(item: CartAggregateItemEntity): void {
    if (!item.menuItemIsAvailable) {
      throw new AppException(
        'One or more cart items are no longer available for checkout.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            cartItemId: item.cartItemId,
            menuItemId: item.menuItemId,
          },
        },
      );
    }
  }

  private async assertCartItemSelectionsRemainValid(
    item: CartAggregateItemEntity,
  ): Promise<void> {
    const optionGroups = await this.menusService.listOptionGroupsByMenuItemId(
      item.menuItemId,
    );
    const activeGroups = optionGroups.filter((group) => group.isActive);
    const selectionCountByGroup = new Map<string, number>();
    const activeOptionsById = new Map<string, ItemOptionOwnershipRecord>();

    for (const group of activeGroups) {
      selectionCountByGroup.set(group.id, 0);

      const options = await this.menusService.listOptionsByOptionGroupId(group.id);
      for (const option of options) {
        if (option.isActive) {
          activeOptionsById.set(option.id, option);
        }
      }
    }

    for (const selectedOption of item.selectedOptions) {
      const currentOption = activeOptionsById.get(selectedOption.itemOptionId);

      if (currentOption === undefined) {
        throw new AppException(
          'One or more selected cart item options are no longer valid for checkout.',
          HttpStatus.UNPROCESSABLE_ENTITY,
          {
            code: ErrorCodes.unprocessableEntity,
            details: {
              cartItemId: item.cartItemId,
              itemOptionId: selectedOption.itemOptionId,
            },
          },
        );
      }

      this.assertSelectedOptionInventoryRemainsAvailable(item, currentOption);

      selectionCountByGroup.set(
        currentOption.group.id,
        (selectionCountByGroup.get(currentOption.group.id) ?? 0) + 1,
      );
    }

    for (const group of activeGroups) {
      const selectedCount = selectionCountByGroup.get(group.id) ?? 0;

      if (selectedCount < group.minSelect || selectedCount > group.maxSelect) {
        throw new AppException(
          'Selected cart item options no longer satisfy the option group selection rules.',
          HttpStatus.UNPROCESSABLE_ENTITY,
          {
            code: ErrorCodes.unprocessableEntity,
            details: {
              cartItemId: item.cartItemId,
              menuItemId: item.menuItemId,
              optionGroupId: group.id,
              minSelect: group.minSelect,
              maxSelect: group.maxSelect,
              selectedCount,
            },
          },
        );
      }
    }

    await this.assertSelectedVariantCombinationRemainsAvailable(
      item,
      activeOptionsById,
    );
  }

  private async assertMenuItemInventoryRemainsAvailable(
    item: CartAggregateItemEntity,
  ): Promise<void> {
    const currentMenuItem = await this.menusService.findItemById(item.menuItemId);

    if (
      currentMenuItem === null ||
      currentMenuItem.branch.id !== item.branchId ||
      !currentMenuItem.isAvailable
    ) {
      throw new AppException(
        'One or more cart items are no longer available for checkout.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            cartItemId: item.cartItemId,
            menuItemId: item.menuItemId,
          },
        },
      );
    }

    if (
      currentMenuItem.isStockTracked &&
      (currentMenuItem.stockQuantity ?? 0) < item.quantity
    ) {
      throw new AppException(
        'One or more cart items do not have enough remaining stock for checkout.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            cartItemId: item.cartItemId,
            menuItemId: item.menuItemId,
            stockQuantity: currentMenuItem.stockQuantity ?? 0,
            requestedQuantity: item.quantity,
          },
        },
      );
    }
  }

  private assertSelectedOptionInventoryRemainsAvailable(
    item: CartAggregateItemEntity,
    option: ItemOptionOwnershipRecord,
  ): void {
    if (!option.isStockTracked) {
      return;
    }

    if ((option.stockQuantity ?? 0) >= item.quantity) {
      return;
    }

    throw new AppException(
      'One or more selected cart item options do not have enough remaining stock for checkout.',
      HttpStatus.UNPROCESSABLE_ENTITY,
      {
        code: ErrorCodes.unprocessableEntity,
        details: {
          cartItemId: item.cartItemId,
          itemOptionId: option.id,
          stockQuantity: option.stockQuantity ?? 0,
          requestedQuantity: item.quantity,
        },
      },
    );
  }

  private async assertSelectedVariantCombinationRemainsAvailable(
    item: CartAggregateItemEntity,
    activeOptionsById: Map<string, ItemOptionOwnershipRecord>,
  ): Promise<void> {
    const selectedVariantOptionIds = item.selectedOptions
      .map((selectedOption) => activeOptionsById.get(selectedOption.itemOptionId))
      .filter(
        (option): option is ItemOptionOwnershipRecord =>
          option !== undefined &&
          option.group.kind === ItemOptionGroupKind.VARIANT_SELECTOR,
      )
      .map((option) => option.id);

    if (selectedVariantOptionIds.length === 0) {
      return;
    }

    const combination =
      await this.menusService.findActiveVariantCombinationByMenuItemIdAndOptionIds(
        item.menuItemId,
        selectedVariantOptionIds,
      );

    if (combination === null) {
      throw new AppException(
        'Selected cart item options no longer match an active variant combination for checkout.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            cartItemId: item.cartItemId,
            menuItemId: item.menuItemId,
            selectedVariantOptionIds,
          },
        },
      );
    }

    if (
      combination.isStockTracked &&
      (combination.stockQuantity ?? 0) < item.quantity
    ) {
      throw new AppException(
        'The selected variant combination does not have enough remaining stock for checkout.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            cartItemId: item.cartItemId,
            combinationId: combination.id,
            stockQuantity: combination.stockQuantity ?? 0,
            requestedQuantity: item.quantity,
          },
        },
      );
    }
  }
}

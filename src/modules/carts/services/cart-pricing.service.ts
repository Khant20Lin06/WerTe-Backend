import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CartItemOwnershipRecord } from '../entities/cart-item-ownership.entity';
import { ItemOptionOwnershipRecord } from '../../menus/entities/item-option-ownership.entity';
import { MenuItemOwnershipRecord } from '../../menus/entities/menu-item-ownership.entity';
import { CartsRepository } from '../repositories/carts.repository';

export type CartPricingSummary = {
  totalQuantity: number;
  subtotalAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
};

@Injectable()
export class CartPricingService {
  constructor(private readonly cartsRepository: CartsRepository) {}

  computeUnitPriceSnapshot(
    menuItem: Pick<MenuItemOwnershipRecord, 'basePrice'>,
    selectedOptions: Array<Pick<ItemOptionOwnershipRecord, 'priceDelta'>>,
  ): Prisma.Decimal {
    return selectedOptions.reduce(
      (total, option) => total.add(option.priceDelta),
      new Prisma.Decimal(menuItem.basePrice),
    );
  }

  computeLineTotal(
    quantity: number,
    unitPriceSnapshot: Prisma.Decimal,
  ): Prisma.Decimal {
    return unitPriceSnapshot.mul(quantity);
  }

  computeCartTotals(
    cartItems: Array<Pick<CartItemOwnershipRecord, 'quantity' | 'lineTotal'>>,
  ): CartPricingSummary {
    const subtotalAmount = cartItems.reduce(
      (total, cartItem) => total.add(cartItem.lineTotal),
      new Prisma.Decimal(0),
    );
    const totalQuantity = cartItems.reduce(
      (total, cartItem) => total + cartItem.quantity,
      0,
    );

    return {
      totalQuantity,
      subtotalAmount,
      totalAmount: subtotalAmount,
    };
  }

  async recomputeCartTotals(
    cartId: string,
    tx: Prisma.TransactionClient,
  ): Promise<CartPricingSummary> {
    const cartItems = await this.cartsRepository.listCartItemsByCartIdWithClient(
      cartId,
      tx,
    );
    const totals = this.computeCartTotals(cartItems);

    await this.cartsRepository.updateCart(
      cartId,
      {
        totalQuantity: totals.totalQuantity,
        subtotalAmount: totals.subtotalAmount,
        totalAmount: totals.totalAmount,
      },
      tx,
    );

    return totals;
  }
}

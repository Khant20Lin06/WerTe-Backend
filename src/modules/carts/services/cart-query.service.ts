import { Injectable } from '@nestjs/common';

import {
  buildCartAggregate,
  buildEmptyCartAggregate,
  CartAggregateEntity,
  CartAggregateRecord,
} from '../entities/cart-aggregate.entity';
import { CartsRepository } from '../repositories/carts.repository';

@Injectable()
export class CartQueryService {
  constructor(private readonly cartsRepository: CartsRepository) {}

  findCartAggregateById(cartId: string): Promise<CartAggregateRecord | null> {
    return this.cartsRepository.findCartAggregateById(cartId);
  }

  async findOwnedCartAggregateByUserId(
    userId: string,
    cartId: string,
  ): Promise<CartAggregateRecord | null> {
    const cart = await this.findCartAggregateById(cartId);
    if (cart === null || !this.belongsToUser(cart, userId)) {
      return null;
    }

    return cart;
  }

  async getOwnedActiveCartAggregateOrEmpty(
    userId: string,
    branchId: string,
  ): Promise<CartAggregateEntity> {
    const cart = await this.cartsRepository.findActiveCartAggregateByUserIdAndBranchId(
      userId,
      branchId,
    );

    if (cart === null) {
      return buildEmptyCartAggregate({ branchId });
    }

    return buildCartAggregate(cart);
  }

  buildCartAggregate(cart: CartAggregateRecord): CartAggregateEntity {
    return buildCartAggregate(cart);
  }

  buildEmptyCartAggregate(branchId: string): CartAggregateEntity {
    return buildEmptyCartAggregate({ branchId });
  }

  belongsToUser(cart: CartAggregateRecord, userId: string): boolean {
    return cart.customerProfile.userId === userId;
  }
}

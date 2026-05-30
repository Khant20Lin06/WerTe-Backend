import { Injectable } from '@nestjs/common';

import {
  buildCartItemOptionOwnership,
  CartItemOptionOwnershipEntity,
  CartItemOptionOwnershipRecord,
} from '../entities/cart-item-option-ownership.entity';
import {
  buildCartItemOwnership,
  CartItemOwnershipEntity,
  CartItemOwnershipRecord,
} from '../entities/cart-item-ownership.entity';
import {
  buildCartOwnership,
  CartOwnershipEntity,
  CartOwnershipRecord,
} from '../entities/cart-ownership.entity';
import { CartsRepository } from '../repositories/carts.repository';

@Injectable()
export class CartsService {
  constructor(private readonly cartsRepository: CartsRepository) {}

  findCartById(id: string): Promise<CartOwnershipRecord | null> {
    return this.cartsRepository.findCartById(id);
  }

  listByCustomerProfileId(
    customerProfileId: string,
  ): Promise<CartOwnershipRecord[]> {
    return this.cartsRepository.listCartsByCustomerProfileId(customerProfileId);
  }

  findActiveByCustomerProfileIdAndBranchId(
    customerProfileId: string,
    branchId: string,
  ): Promise<CartOwnershipRecord | null> {
    return this.cartsRepository.findActiveCartByCustomerProfileIdAndBranchId(
      customerProfileId,
      branchId,
    );
  }

  findActiveOwnedByUserIdAndBranchId(
    userId: string,
    branchId: string,
  ): Promise<CartOwnershipRecord | null> {
    return this.cartsRepository.findActiveCartByUserIdAndBranchId(userId, branchId);
  }

  findCartItemById(id: string): Promise<CartItemOwnershipRecord | null> {
    return this.cartsRepository.findCartItemById(id);
  }

  listCartItemsByCartId(cartId: string): Promise<CartItemOwnershipRecord[]> {
    return this.cartsRepository.listCartItemsByCartId(cartId);
  }

  findCartItemOptionById(
    id: string,
  ): Promise<CartItemOptionOwnershipRecord | null> {
    return this.cartsRepository.findCartItemOptionById(id);
  }

  listCartItemOptionsByCartItemId(
    cartItemId: string,
  ): Promise<CartItemOptionOwnershipRecord[]> {
    return this.cartsRepository.listCartItemOptionsByCartItemId(cartItemId);
  }

  async findOwnedCartByUserId(
    userId: string,
    cartId: string,
  ): Promise<CartOwnershipRecord | null> {
    const cart = await this.findCartById(cartId);
    if (cart === null || !this.belongsToUser(cart, userId)) {
      return null;
    }

    return cart;
  }

  async findOwnedCartItemByUserId(
    userId: string,
    cartItemId: string,
  ): Promise<CartItemOwnershipRecord | null> {
    const cartItem = await this.findCartItemById(cartItemId);
    if (cartItem === null || !this.cartItemBelongsToUser(cartItem, userId)) {
      return null;
    }

    return cartItem;
  }

  async findOwnedCartItemOptionByUserId(
    userId: string,
    cartItemOptionId: string,
  ): Promise<CartItemOptionOwnershipRecord | null> {
    const cartItemOption = await this.findCartItemOptionById(cartItemOptionId);
    if (
      cartItemOption === null ||
      !this.cartItemOptionBelongsToUser(cartItemOption, userId)
    ) {
      return null;
    }

    return cartItemOption;
  }

  buildCartOwnership(cart: CartOwnershipRecord): CartOwnershipEntity {
    return buildCartOwnership(cart);
  }

  buildCartItemOwnership(cartItem: CartItemOwnershipRecord): CartItemOwnershipEntity {
    return buildCartItemOwnership(cartItem);
  }

  buildCartItemOptionOwnership(
    cartItemOption: CartItemOptionOwnershipRecord,
  ): CartItemOptionOwnershipEntity {
    return buildCartItemOptionOwnership(cartItemOption);
  }

  belongsToUser(cart: CartOwnershipRecord, userId: string): boolean {
    return cart.customerProfile.user.id === userId;
  }

  belongsToCustomerProfile(
    cart: CartOwnershipRecord,
    customerProfileId: string,
  ): boolean {
    return cart.customerProfile.id === customerProfileId;
  }

  belongsToBranch(cart: CartOwnershipRecord, branchId: string): boolean {
    return cart.branch.id === branchId;
  }

  cartItemBelongsToUser(
    cartItem: CartItemOwnershipRecord,
    userId: string,
  ): boolean {
    return cartItem.cart.customerProfile.user.id === userId;
  }

  cartItemBelongsToCart(
    cartItem: CartItemOwnershipRecord,
    cartId: string,
  ): boolean {
    return cartItem.cart.id === cartId;
  }

  cartItemOptionBelongsToUser(
    cartItemOption: CartItemOptionOwnershipRecord,
    userId: string,
  ): boolean {
    return cartItemOption.cartItem.cart.customerProfile.user.id === userId;
  }

  cartItemOptionBelongsToCartItem(
    cartItemOption: CartItemOptionOwnershipRecord,
    cartItemId: string,
  ): boolean {
    return cartItemOption.cartItem.id === cartItemId;
  }
}

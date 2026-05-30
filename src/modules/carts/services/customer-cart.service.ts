import { Injectable } from '@nestjs/common';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { CartDto, toCartDto } from '../dto/cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartMutationService } from './cart-mutation.service';
import { CartQueryService } from './cart-query.service';

@Injectable()
export class CustomerCartService {
  constructor(
    private readonly cartQueryService: CartQueryService,
    private readonly cartMutationService: CartMutationService,
  ) {}

  async getCurrentCustomerCart(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<CartDto> {
    const cart = await this.cartQueryService.getOwnedActiveCartAggregateOrEmpty(
      currentUser.userId,
      branchId,
    );

    return toCartDto(cart);
  }

  async addCurrentCustomerCartItem(
    currentUser: AuthenticatedUserEntity,
    payload: AddCartItemDto,
  ): Promise<CartDto> {
    const cart = await this.cartMutationService.addCurrentCustomerCartItem(
      currentUser,
      payload.branchId,
      {
        menuItemId: payload.menuItemId,
        quantity: payload.quantity,
        selectedOptionIds: payload.selectedOptionIds,
      },
    );

    return toCartDto(cart);
  }

  async updateCurrentCustomerCartItem(
    currentUser: AuthenticatedUserEntity,
    cartItemId: string,
    payload: UpdateCartItemDto,
  ): Promise<CartDto> {
    const cart = await this.cartMutationService.updateCurrentCustomerCartItem(
      currentUser,
      cartItemId,
      {
        quantity: payload.quantity,
        selectedOptionIds: payload.selectedOptionIds,
      },
    );

    return toCartDto(cart);
  }

  async removeCurrentCustomerCartItem(
    currentUser: AuthenticatedUserEntity,
    cartItemId: string,
  ): Promise<CartDto> {
    const cart = await this.cartMutationService.removeCurrentCustomerCartItem(
      currentUser,
      cartItemId,
    );

    return toCartDto(cart);
  }

  async clearCurrentCustomerCart(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<CartDto> {
    const cart = await this.cartMutationService.clearCurrentCustomerBranchCart(
      currentUser,
      branchId,
    );

    return toCartDto(cart);
  }
}

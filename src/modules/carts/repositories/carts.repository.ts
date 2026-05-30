import { Injectable } from '@nestjs/common';
import { CartStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  CartAggregateRecord,
  cartAggregateInclude,
} from '../entities/cart-aggregate.entity';
import {
  CartItemOptionOwnershipRecord,
  cartItemOptionOwnershipInclude,
} from '../entities/cart-item-option-ownership.entity';
import {
  CartItemOwnershipRecord,
  cartItemOwnershipInclude,
} from '../entities/cart-item-ownership.entity';
import {
  CartOwnershipRecord,
  cartOwnershipInclude,
} from '../entities/cart-ownership.entity';

type CartDatabaseClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class CartsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCartById(id: string): Promise<CartOwnershipRecord | null> {
    return this.prisma.cart.findUnique({
      where: { id },
      include: cartOwnershipInclude,
    });
  }

  findCartAggregateById(id: string): Promise<CartAggregateRecord | null> {
    return this.prisma.cart.findUnique({
      where: { id },
      include: cartAggregateInclude,
    });
  }

  listCartsByCustomerProfileId(
    customerProfileId: string,
  ): Promise<CartOwnershipRecord[]> {
    return this.prisma.cart.findMany({
      where: { customerProfileId },
      include: cartOwnershipInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findActiveCartByCustomerProfileIdAndBranchId(
    customerProfileId: string,
    branchId: string,
    client: CartDatabaseClient = this.prisma,
  ): Promise<CartOwnershipRecord | null> {
    return client.cart.findFirst({
      where: {
        customerProfileId,
        branchId,
        status: CartStatus.ACTIVE,
      },
      include: cartOwnershipInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findActiveCartByUserIdAndBranchId(
    userId: string,
    branchId: string,
  ): Promise<CartOwnershipRecord | null> {
    return this.prisma.cart.findFirst({
      where: {
        branchId,
        status: CartStatus.ACTIVE,
        customerProfile: {
          is: {
            userId,
          },
        },
      },
      include: cartOwnershipInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findActiveCartAggregateByUserIdAndBranchId(
    userId: string,
    branchId: string,
  ): Promise<CartAggregateRecord | null> {
    return this.prisma.cart.findFirst({
      where: {
        branchId,
        status: CartStatus.ACTIVE,
        customerProfile: {
          is: {
            userId,
          },
        },
      },
      include: cartAggregateInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findCartItemById(id: string): Promise<CartItemOwnershipRecord | null> {
    return this.prisma.cartItem.findUnique({
      where: { id },
      include: cartItemOwnershipInclude,
    });
  }

  listCartItemsByCartId(cartId: string): Promise<CartItemOwnershipRecord[]> {
    return this.listCartItemsByCartIdWithClient(cartId, this.prisma);
  }

  listCartItemsByCartIdWithClient(
    cartId: string,
    client: CartDatabaseClient,
  ): Promise<CartItemOwnershipRecord[]> {
    return client.cartItem.findMany({
      where: { cartId },
      include: cartItemOwnershipInclude,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
  }

  findCartItemOptionById(
    id: string,
  ): Promise<CartItemOptionOwnershipRecord | null> {
    return this.prisma.cartItemOption.findUnique({
      where: { id },
      include: cartItemOptionOwnershipInclude,
    });
  }

  listCartItemOptionsByCartItemId(
    cartItemId: string,
  ): Promise<CartItemOptionOwnershipRecord[]> {
    return this.listCartItemOptionsByCartItemIdWithClient(cartItemId, this.prisma);
  }

  listCartItemOptionsByCartItemIdWithClient(
    cartItemId: string,
    client: CartDatabaseClient,
  ): Promise<CartItemOptionOwnershipRecord[]> {
    return client.cartItemOption.findMany({
      where: { cartItemId },
      include: cartItemOptionOwnershipInclude,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
  }

  createCart(
    data: Prisma.CartUncheckedCreateInput,
    client: CartDatabaseClient = this.prisma,
  ): Promise<CartOwnershipRecord> {
    return client.cart.create({
      data,
      include: cartOwnershipInclude,
    });
  }

  updateCart(
    id: string,
    data: Prisma.CartUpdateInput,
    client: CartDatabaseClient = this.prisma,
  ): Promise<CartOwnershipRecord> {
    return client.cart.update({
      where: { id },
      data,
      include: cartOwnershipInclude,
    });
  }

  createCartItem(
    data: Prisma.CartItemUncheckedCreateInput,
    client: CartDatabaseClient = this.prisma,
  ): Promise<CartItemOwnershipRecord> {
    return client.cartItem.create({
      data,
      include: cartItemOwnershipInclude,
    });
  }

  updateCartItem(
    id: string,
    data: Prisma.CartItemUpdateInput,
    client: CartDatabaseClient = this.prisma,
  ): Promise<CartItemOwnershipRecord> {
    return client.cartItem.update({
      where: { id },
      data,
      include: cartItemOwnershipInclude,
    });
  }

  deleteCartItem(
    id: string,
    client: CartDatabaseClient = this.prisma,
  ): Promise<{ id: string }> {
    return client.cartItem.delete({
      where: { id },
      select: {
        id: true,
      },
    });
  }

  deleteCartItemsByCartId(
    cartId: string,
    client: CartDatabaseClient = this.prisma,
  ): Promise<Prisma.BatchPayload> {
    return client.cartItem.deleteMany({
      where: { cartId },
    });
  }

  createCartItemOptions(
    data: Prisma.CartItemOptionCreateManyInput[],
    client: CartDatabaseClient = this.prisma,
  ): Promise<Prisma.BatchPayload> {
    if (data.length === 0) {
      return Promise.resolve({ count: 0 });
    }

    return client.cartItemOption.createMany({
      data,
    });
  }

  deleteCartItemOptionsByCartItemId(
    cartItemId: string,
    client: CartDatabaseClient = this.prisma,
  ): Promise<Prisma.BatchPayload> {
    return client.cartItemOption.deleteMany({
      where: { cartItemId },
    });
  }

  deleteCartItemOptionsByCartId(
    cartId: string,
    client: CartDatabaseClient = this.prisma,
  ): Promise<Prisma.BatchPayload> {
    return client.cartItemOption.deleteMany({
      where: {
        cartItem: {
          is: {
            cartId,
          },
        },
      },
    });
  }
}

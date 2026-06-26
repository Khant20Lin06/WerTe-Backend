import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CartAggregateRecord } from '../entities/cart-aggregate.entity';
import { CartItemOptionOwnershipRecord } from '../entities/cart-item-option-ownership.entity';
import { CartItemOwnershipRecord } from '../entities/cart-item-ownership.entity';
import { CartOwnershipRecord } from '../entities/cart-ownership.entity';
type CartDatabaseClient = PrismaService | Prisma.TransactionClient;
export declare class CartsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findCartById(id: string): Promise<CartOwnershipRecord | null>;
    findCartAggregateById(id: string): Promise<CartAggregateRecord | null>;
    listCartsByCustomerProfileId(customerProfileId: string): Promise<CartOwnershipRecord[]>;
    findActiveCartByCustomerProfileIdAndBranchId(customerProfileId: string, branchId: string, client?: CartDatabaseClient): Promise<CartOwnershipRecord | null>;
    findActiveCartByUserIdAndBranchId(userId: string, branchId: string): Promise<CartOwnershipRecord | null>;
    findActiveCartAggregateByUserIdAndBranchId(userId: string, branchId: string): Promise<CartAggregateRecord | null>;
    findCartItemById(id: string): Promise<CartItemOwnershipRecord | null>;
    listCartItemsByCartId(cartId: string): Promise<CartItemOwnershipRecord[]>;
    listCartItemsByCartIdWithClient(cartId: string, client: CartDatabaseClient): Promise<CartItemOwnershipRecord[]>;
    findCartItemOptionById(id: string): Promise<CartItemOptionOwnershipRecord | null>;
    listCartItemOptionsByCartItemId(cartItemId: string): Promise<CartItemOptionOwnershipRecord[]>;
    listCartItemOptionsByCartItemIdWithClient(cartItemId: string, client: CartDatabaseClient): Promise<CartItemOptionOwnershipRecord[]>;
    createCart(data: Prisma.CartUncheckedCreateInput, client?: CartDatabaseClient): Promise<CartOwnershipRecord>;
    updateCart(id: string, data: Prisma.CartUpdateInput, client?: CartDatabaseClient): Promise<CartOwnershipRecord>;
    createCartItem(data: Prisma.CartItemUncheckedCreateInput, client?: CartDatabaseClient): Promise<CartItemOwnershipRecord>;
    updateCartItem(id: string, data: Prisma.CartItemUpdateInput, client?: CartDatabaseClient): Promise<CartItemOwnershipRecord>;
    deleteCartItem(id: string, client?: CartDatabaseClient): Promise<{
        id: string;
    }>;
    deleteCartItemsByCartId(cartId: string, client?: CartDatabaseClient): Promise<Prisma.BatchPayload>;
    createCartItemOptions(data: Prisma.CartItemOptionCreateManyInput[], client?: CartDatabaseClient): Promise<Prisma.BatchPayload>;
    deleteCartItemOptionsByCartItemId(cartItemId: string, client?: CartDatabaseClient): Promise<Prisma.BatchPayload>;
    deleteCartItemOptionsByCartId(cartId: string, client?: CartDatabaseClient): Promise<Prisma.BatchPayload>;
}
export {};

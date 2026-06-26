import { CartAggregateEntity, CartAggregateRecord } from '../entities/cart-aggregate.entity';
import { CartsRepository } from '../repositories/carts.repository';
export declare class CartQueryService {
    private readonly cartsRepository;
    constructor(cartsRepository: CartsRepository);
    findCartAggregateById(cartId: string): Promise<CartAggregateRecord | null>;
    findOwnedCartAggregateByUserId(userId: string, cartId: string): Promise<CartAggregateRecord | null>;
    getOwnedActiveCartAggregateOrEmpty(userId: string, branchId: string): Promise<CartAggregateEntity>;
    buildCartAggregate(cart: CartAggregateRecord): CartAggregateEntity;
    buildEmptyCartAggregate(branchId: string): CartAggregateEntity;
    belongsToUser(cart: CartAggregateRecord, userId: string): boolean;
}

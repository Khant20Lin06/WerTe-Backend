import { CartItemOptionOwnershipEntity, CartItemOptionOwnershipRecord } from '../entities/cart-item-option-ownership.entity';
import { CartItemOwnershipEntity, CartItemOwnershipRecord } from '../entities/cart-item-ownership.entity';
import { CartOwnershipEntity, CartOwnershipRecord } from '../entities/cart-ownership.entity';
import { CartsRepository } from '../repositories/carts.repository';
export declare class CartsService {
    private readonly cartsRepository;
    constructor(cartsRepository: CartsRepository);
    findCartById(id: string): Promise<CartOwnershipRecord | null>;
    listByCustomerProfileId(customerProfileId: string): Promise<CartOwnershipRecord[]>;
    findActiveByCustomerProfileIdAndBranchId(customerProfileId: string, branchId: string): Promise<CartOwnershipRecord | null>;
    findActiveOwnedByUserIdAndBranchId(userId: string, branchId: string): Promise<CartOwnershipRecord | null>;
    findCartItemById(id: string): Promise<CartItemOwnershipRecord | null>;
    listCartItemsByCartId(cartId: string): Promise<CartItemOwnershipRecord[]>;
    findCartItemOptionById(id: string): Promise<CartItemOptionOwnershipRecord | null>;
    listCartItemOptionsByCartItemId(cartItemId: string): Promise<CartItemOptionOwnershipRecord[]>;
    findOwnedCartByUserId(userId: string, cartId: string): Promise<CartOwnershipRecord | null>;
    findOwnedCartItemByUserId(userId: string, cartItemId: string): Promise<CartItemOwnershipRecord | null>;
    findOwnedCartItemOptionByUserId(userId: string, cartItemOptionId: string): Promise<CartItemOptionOwnershipRecord | null>;
    buildCartOwnership(cart: CartOwnershipRecord): CartOwnershipEntity;
    buildCartItemOwnership(cartItem: CartItemOwnershipRecord): CartItemOwnershipEntity;
    buildCartItemOptionOwnership(cartItemOption: CartItemOptionOwnershipRecord): CartItemOptionOwnershipEntity;
    belongsToUser(cart: CartOwnershipRecord, userId: string): boolean;
    belongsToCustomerProfile(cart: CartOwnershipRecord, customerProfileId: string): boolean;
    belongsToBranch(cart: CartOwnershipRecord, branchId: string): boolean;
    cartItemBelongsToUser(cartItem: CartItemOwnershipRecord, userId: string): boolean;
    cartItemBelongsToCart(cartItem: CartItemOwnershipRecord, cartId: string): boolean;
    cartItemOptionBelongsToUser(cartItemOption: CartItemOptionOwnershipRecord, userId: string): boolean;
    cartItemOptionBelongsToCartItem(cartItemOption: CartItemOptionOwnershipRecord, cartItemId: string): boolean;
}

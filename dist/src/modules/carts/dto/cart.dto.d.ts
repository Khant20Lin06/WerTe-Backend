import { CartAggregateEntity } from '../entities/cart-aggregate.entity';
export declare class CartSelectedOptionDto {
    cartItemOptionId: string;
    itemOptionId: string;
    itemOptionName: string;
    itemOptionIsActive: boolean;
    optionGroupId: string;
    optionGroupName: string;
    optionGroupIsActive: boolean;
    nameSnapshot: string;
    priceDeltaSnapshot: string;
}
export declare class CartItemDto {
    cartItemId: string;
    menuItemId: string;
    branchId: string;
    categoryId?: string | null;
    menuItemName: string;
    menuItemDescription?: string | null;
    menuItemImageUrl?: string | null;
    menuItemBasePrice: string;
    menuItemIsAvailable: boolean;
    quantity: number;
    unitPriceSnapshot: string;
    lineTotal: string;
    selectedOptions: CartSelectedOptionDto[];
}
export declare class CartDto {
    cartId: string | null;
    customerProfileId: string | null;
    branchId: string;
    merchantId: string | null;
    branchName: string | null;
    branchStatus: string | null;
    merchantStatus: string | null;
    status: string;
    totalQuantity: number;
    subtotalAmount: string;
    totalAmount: string;
    isEmpty: boolean;
    items: CartItemDto[];
}
export declare function toCartDto(cart: CartAggregateEntity): CartDto;

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
export declare class CartPricingService {
    private readonly cartsRepository;
    constructor(cartsRepository: CartsRepository);
    computeUnitPriceSnapshot(menuItem: Pick<MenuItemOwnershipRecord, 'basePrice'>, selectedOptions: Array<Pick<ItemOptionOwnershipRecord, 'priceDelta'>>): Prisma.Decimal;
    computeLineTotal(quantity: number, unitPriceSnapshot: Prisma.Decimal): Prisma.Decimal;
    computeCartTotals(cartItems: Array<Pick<CartItemOwnershipRecord, 'quantity' | 'lineTotal'>>): CartPricingSummary;
    recomputeCartTotals(cartId: string, tx: Prisma.TransactionClient): Promise<CartPricingSummary>;
}

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CustomerProfilesService } from '../../customer-profiles/services/customer-profiles.service';
import { MenusService } from '../../menus/services/menus.service';
import { CartAggregateEntity } from '../entities/cart-aggregate.entity';
import { CartsRepository } from '../repositories/carts.repository';
import { CartPricingService } from './cart-pricing.service';
import { CartQueryService } from './cart-query.service';
export type AddCartItemInput = {
    menuItemId: string;
    quantity: number;
    selectedOptionIds?: string[];
};
export type UpdateCartItemInput = {
    quantity: number;
    selectedOptionIds?: string[];
};
export declare class CartMutationService {
    private readonly prisma;
    private readonly customerProfilesService;
    private readonly menusService;
    private readonly cartsRepository;
    private readonly cartPricingService;
    private readonly cartQueryService;
    constructor(prisma: PrismaService, customerProfilesService: CustomerProfilesService, menusService: MenusService, cartsRepository: CartsRepository, cartPricingService: CartPricingService, cartQueryService: CartQueryService);
    addCurrentCustomerCartItem(currentUser: AuthenticatedUserEntity, branchId: string, payload: AddCartItemInput): Promise<CartAggregateEntity>;
    updateCurrentCustomerCartItem(currentUser: AuthenticatedUserEntity, cartItemId: string, payload: UpdateCartItemInput): Promise<CartAggregateEntity>;
    removeCurrentCustomerCartItem(currentUser: AuthenticatedUserEntity, cartItemId: string): Promise<CartAggregateEntity>;
    clearCurrentCustomerBranchCart(currentUser: AuthenticatedUserEntity, branchId: string): Promise<CartAggregateEntity>;
    private resolveCurrentCustomerProfile;
    private resolveOwnedCartItem;
    private resolveMenuItemForBranch;
    private resolveSelectedOptionsForMenuItem;
    private resolveCartAggregateOrThrow;
    private assertSelectedVariantCombinationIsValid;
    private assertPositiveQuantity;
    private assertNoDuplicateOptionSelection;
    private assertSelectedOptionsHaveAvailableStock;
}

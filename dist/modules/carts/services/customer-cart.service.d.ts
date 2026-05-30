import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { CartDto } from '../dto/cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartMutationService } from './cart-mutation.service';
import { CartQueryService } from './cart-query.service';
export declare class CustomerCartService {
    private readonly cartQueryService;
    private readonly cartMutationService;
    constructor(cartQueryService: CartQueryService, cartMutationService: CartMutationService);
    getCurrentCustomerCart(currentUser: AuthenticatedUserEntity, branchId: string): Promise<CartDto>;
    addCurrentCustomerCartItem(currentUser: AuthenticatedUserEntity, payload: AddCartItemDto): Promise<CartDto>;
    updateCurrentCustomerCartItem(currentUser: AuthenticatedUserEntity, cartItemId: string, payload: UpdateCartItemDto): Promise<CartDto>;
    removeCurrentCustomerCartItem(currentUser: AuthenticatedUserEntity, cartItemId: string): Promise<CartDto>;
    clearCurrentCustomerCart(currentUser: AuthenticatedUserEntity, branchId: string): Promise<CartDto>;
}

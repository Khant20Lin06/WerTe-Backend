import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { CartDto } from '../dto/cart.dto';
import { GetCartQueryDto } from '../dto/get-cart-query.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CustomerCartService } from '../services/customer-cart.service';
export declare class CustomerCartController {
    private readonly customerCartService;
    constructor(customerCartService: CustomerCartService);
    getCurrentCart(currentUser: AuthenticatedUserEntity, query: GetCartQueryDto): Promise<CartDto>;
    addItem(currentUser: AuthenticatedUserEntity, body: AddCartItemDto): Promise<CartDto>;
    updateItem(currentUser: AuthenticatedUserEntity, cartItemId: string, body: UpdateCartItemDto): Promise<CartDto>;
    removeItem(currentUser: AuthenticatedUserEntity, cartItemId: string): Promise<CartDto>;
    clearCart(currentUser: AuthenticatedUserEntity, query: GetCartQueryDto): Promise<CartDto>;
}

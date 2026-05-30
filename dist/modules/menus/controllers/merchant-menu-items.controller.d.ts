import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { MenuItemDto } from '../dto/menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { MerchantMenuItemsService } from '../services/merchant-menu-items.service';
export declare class MerchantMenuItemsController {
    private readonly merchantMenuItemsService;
    constructor(merchantMenuItemsService: MerchantMenuItemsService);
    list(currentUser: AuthenticatedUserEntity, branchId: string): Promise<MenuItemDto[]>;
    get(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string): Promise<MenuItemDto>;
    create(currentUser: AuthenticatedUserEntity, branchId: string, body: CreateMenuItemDto): Promise<MenuItemDto>;
    update(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, body: UpdateMenuItemDto): Promise<MenuItemDto>;
}

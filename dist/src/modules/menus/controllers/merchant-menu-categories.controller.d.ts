import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateMenuCategoryDto } from '../dto/create-menu-category.dto';
import { MenuCategoryDto } from '../dto/menu-category.dto';
import { UpdateMenuCategoryDto } from '../dto/update-menu-category.dto';
import { MerchantMenuCategoriesService } from '../services/merchant-menu-categories.service';
export declare class MerchantMenuCategoriesController {
    private readonly merchantMenuCategoriesService;
    constructor(merchantMenuCategoriesService: MerchantMenuCategoriesService);
    list(currentUser: AuthenticatedUserEntity, branchId: string): Promise<MenuCategoryDto[]>;
    get(currentUser: AuthenticatedUserEntity, branchId: string, categoryId: string): Promise<MenuCategoryDto>;
    create(currentUser: AuthenticatedUserEntity, branchId: string, body: CreateMenuCategoryDto): Promise<MenuCategoryDto>;
    update(currentUser: AuthenticatedUserEntity, branchId: string, categoryId: string, body: UpdateMenuCategoryDto): Promise<MenuCategoryDto>;
    delete(currentUser: AuthenticatedUserEntity, branchId: string, categoryId: string): Promise<void>;
}

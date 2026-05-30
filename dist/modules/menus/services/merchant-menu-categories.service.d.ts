import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { BranchesService } from '../../branches/services/branches.service';
import { CreateMenuCategoryDto } from '../dto/create-menu-category.dto';
import { MenuCategoryDto } from '../dto/menu-category.dto';
import { UpdateMenuCategoryDto } from '../dto/update-menu-category.dto';
import { MenuCategoryPolicyService } from '../policies/menu-category-policy.service';
import { MenusRepository } from '../repositories/menus.repository';
import { MenusService } from './menus.service';
export declare class MerchantMenuCategoriesService {
    private readonly prisma;
    private readonly branchesService;
    private readonly menusService;
    private readonly menusRepository;
    private readonly menuCategoryPolicyService;
    constructor(prisma: PrismaService, branchesService: BranchesService, menusService: MenusService, menusRepository: MenusRepository, menuCategoryPolicyService: MenuCategoryPolicyService);
    listBranchCategories(currentUser: AuthenticatedUserEntity, branchId: string): Promise<MenuCategoryDto[]>;
    getBranchCategory(currentUser: AuthenticatedUserEntity, branchId: string, categoryId: string): Promise<MenuCategoryDto>;
    createBranchCategory(currentUser: AuthenticatedUserEntity, branchId: string, payload: CreateMenuCategoryDto): Promise<MenuCategoryDto>;
    updateBranchCategory(currentUser: AuthenticatedUserEntity, branchId: string, categoryId: string, payload: UpdateMenuCategoryDto): Promise<MenuCategoryDto>;
    private resolveOwnedBranch;
    private resolveOwnedCategory;
}

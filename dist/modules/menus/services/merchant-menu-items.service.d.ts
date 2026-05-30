import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { BranchesService } from '../../branches/services/branches.service';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { MenuItemDto } from '../dto/menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { MenuItemPolicyService } from '../policies/menu-item-policy.service';
import { MenusRepository } from '../repositories/menus.repository';
import { MenusService } from './menus.service';
export declare class MerchantMenuItemsService {
    private readonly prisma;
    private readonly branchesService;
    private readonly menusService;
    private readonly menusRepository;
    private readonly menuItemPolicyService;
    constructor(prisma: PrismaService, branchesService: BranchesService, menusService: MenusService, menusRepository: MenusRepository, menuItemPolicyService: MenuItemPolicyService);
    listBranchItems(currentUser: AuthenticatedUserEntity, branchId: string): Promise<MenuItemDto[]>;
    getBranchItem(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string): Promise<MenuItemDto>;
    createBranchItem(currentUser: AuthenticatedUserEntity, branchId: string, payload: CreateMenuItemDto): Promise<MenuItemDto>;
    updateBranchItem(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, payload: UpdateMenuItemDto): Promise<MenuItemDto>;
    private resolveOwnedBranch;
    private resolveOwnedItem;
    private resolveOptionalOwnedCategory;
}

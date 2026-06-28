import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateItemOptionGroupDto } from '../dto/create-item-option-group.dto';
import { ItemOptionGroupDto } from '../dto/item-option-group.dto';
import { UpdateItemOptionGroupDto } from '../dto/update-item-option-group.dto';
import { MenuOptionGroupPolicyService } from '../policies/menu-option-group-policy.service';
import { MenusRepository } from '../repositories/menus.repository';
import { MenuCacheService } from './menu-cache.service';
import { MenusService } from './menus.service';
export declare class MerchantMenuOptionGroupsService {
    private readonly prisma;
    private readonly menusService;
    private readonly menusRepository;
    private readonly menuOptionGroupPolicyService;
    private readonly menuCache;
    constructor(prisma: PrismaService, menusService: MenusService, menusRepository: MenusRepository, menuOptionGroupPolicyService: MenuOptionGroupPolicyService, menuCache: MenuCacheService);
    listItemOptionGroups(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string): Promise<ItemOptionGroupDto[]>;
    getItemOptionGroup(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string): Promise<ItemOptionGroupDto>;
    createItemOptionGroup(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, payload: CreateItemOptionGroupDto): Promise<ItemOptionGroupDto>;
    updateItemOptionGroup(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string, payload: UpdateItemOptionGroupDto): Promise<ItemOptionGroupDto>;
    deleteItemOptionGroup(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string): Promise<void>;
    private resolveOwnedItem;
    private resolveOwnedOptionGroup;
    private assertSelectionBounds;
}

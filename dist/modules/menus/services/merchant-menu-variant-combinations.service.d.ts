import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateItemVariantCombinationDto } from '../dto/create-item-variant-combination.dto';
import { ItemVariantCombinationDto } from '../dto/item-variant-combination.dto';
import { UpdateItemVariantCombinationDto } from '../dto/update-item-variant-combination.dto';
import { MenuItemPolicyService } from '../policies/menu-item-policy.service';
import { MenusRepository } from '../repositories/menus.repository';
import { MenuCacheService } from './menu-cache.service';
import { MenusService } from './menus.service';
export declare class MerchantMenuVariantCombinationsService {
    private readonly prisma;
    private readonly menusService;
    private readonly menusRepository;
    private readonly menuItemPolicyService;
    private readonly menuCache;
    constructor(prisma: PrismaService, menusService: MenusService, menusRepository: MenusRepository, menuItemPolicyService: MenuItemPolicyService, menuCache: MenuCacheService);
    listItemVariantCombinations(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string): Promise<ItemVariantCombinationDto[]>;
    getItemVariantCombination(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, combinationId: string): Promise<ItemVariantCombinationDto>;
    createItemVariantCombination(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, payload: CreateItemVariantCombinationDto): Promise<ItemVariantCombinationDto>;
    updateItemVariantCombination(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, combinationId: string, payload: UpdateItemVariantCombinationDto): Promise<ItemVariantCombinationDto>;
    private resolveOwnedItem;
    private resolveOwnedVariantCombination;
    private resolveVariantSelection;
    private normalizeCreateInventory;
    private normalizeUpdateInventory;
    private assertInventoryValue;
    private assertSelectedOptionIdsAreUnique;
    private normalizeOptionalString;
}

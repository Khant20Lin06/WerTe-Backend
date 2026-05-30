import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateItemOptionDto } from '../dto/create-item-option.dto';
import { ItemOptionDto } from '../dto/item-option.dto';
import { UpdateItemOptionDto } from '../dto/update-item-option.dto';
import { MenuOptionPolicyService } from '../policies/menu-option-policy.service';
import { MenusRepository } from '../repositories/menus.repository';
import { MenusService } from './menus.service';
export declare class MerchantMenuOptionsService {
    private readonly prisma;
    private readonly menusService;
    private readonly menusRepository;
    private readonly menuOptionPolicyService;
    constructor(prisma: PrismaService, menusService: MenusService, menusRepository: MenusRepository, menuOptionPolicyService: MenuOptionPolicyService);
    listGroupOptions(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string): Promise<ItemOptionDto[]>;
    getGroupOption(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string, optionId: string): Promise<ItemOptionDto>;
    createGroupOption(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string, payload: CreateItemOptionDto): Promise<ItemOptionDto>;
    updateGroupOption(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string, optionId: string, payload: UpdateItemOptionDto): Promise<ItemOptionDto>;
    private resolveOwnedOptionGroup;
    private resolveOwnedOption;
}

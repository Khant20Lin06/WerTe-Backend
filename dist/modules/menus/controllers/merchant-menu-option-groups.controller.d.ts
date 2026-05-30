import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateItemOptionGroupDto } from '../dto/create-item-option-group.dto';
import { ItemOptionGroupDto } from '../dto/item-option-group.dto';
import { UpdateItemOptionGroupDto } from '../dto/update-item-option-group.dto';
import { MerchantMenuOptionGroupsService } from '../services/merchant-menu-option-groups.service';
export declare class MerchantMenuOptionGroupsController {
    private readonly merchantMenuOptionGroupsService;
    constructor(merchantMenuOptionGroupsService: MerchantMenuOptionGroupsService);
    list(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string): Promise<ItemOptionGroupDto[]>;
    get(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string): Promise<ItemOptionGroupDto>;
    create(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, body: CreateItemOptionGroupDto): Promise<ItemOptionGroupDto>;
    update(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string, body: UpdateItemOptionGroupDto): Promise<ItemOptionGroupDto>;
}

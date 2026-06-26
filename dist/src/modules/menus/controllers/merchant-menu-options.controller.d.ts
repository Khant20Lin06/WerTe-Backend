import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';
import { CreateItemOptionDto } from '../dto/create-item-option.dto';
import { ItemOptionDto } from '../dto/item-option.dto';
import { UpdateItemOptionDto } from '../dto/update-item-option.dto';
import { MerchantMenuOptionsService } from '../services/merchant-menu-options.service';
export declare class MerchantMenuOptionsController {
    private readonly merchantMenuOptionsService;
    constructor(merchantMenuOptionsService: MerchantMenuOptionsService);
    list(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string): Promise<ItemOptionDto[]>;
    get(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string, optionId: string): Promise<ItemOptionDto>;
    create(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string, body: CreateItemOptionDto): Promise<ItemOptionDto>;
    update(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string, optionId: string, body: UpdateItemOptionDto): Promise<ItemOptionDto>;
    delete(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string, optionId: string): Promise<void>;
    adjustInventory(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, optionGroupId: string, optionId: string, body: AdjustInventoryDto): Promise<ItemOptionDto>;
}

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateItemVariantCombinationDto } from '../dto/create-item-variant-combination.dto';
import { ItemVariantCombinationDto } from '../dto/item-variant-combination.dto';
import { UpdateItemVariantCombinationDto } from '../dto/update-item-variant-combination.dto';
import { MerchantMenuVariantCombinationsService } from '../services/merchant-menu-variant-combinations.service';
export declare class MerchantMenuVariantCombinationsController {
    private readonly merchantMenuVariantCombinationsService;
    constructor(merchantMenuVariantCombinationsService: MerchantMenuVariantCombinationsService);
    list(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string): Promise<ItemVariantCombinationDto[]>;
    get(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, combinationId: string): Promise<ItemVariantCombinationDto>;
    create(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, body: CreateItemVariantCombinationDto): Promise<ItemVariantCombinationDto>;
    update(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, combinationId: string, body: UpdateItemVariantCombinationDto): Promise<ItemVariantCombinationDto>;
}

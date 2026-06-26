import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ListMerchantInventoryAdjustmentsQueryDto } from '../dto/list-merchant-inventory-adjustments-query.dto';
import { MerchantInventoryAdjustmentDto } from '../dto/merchant-inventory-adjustment.dto';
import { MerchantInventoryOverviewDto } from '../dto/merchant-inventory-overview.dto';
import { MerchantRestockSuggestionsDto } from '../dto/merchant-restock-suggestions.dto';
import { MerchantInventoryReadService } from '../services/merchant-inventory-read.service';
export declare class MerchantInventoryController {
    private readonly merchantInventoryReadService;
    constructor(merchantInventoryReadService: MerchantInventoryReadService);
    getOverview(currentUser: AuthenticatedUserEntity, branchId: string): Promise<MerchantInventoryOverviewDto>;
    listAdjustments(currentUser: AuthenticatedUserEntity, branchId: string, query: ListMerchantInventoryAdjustmentsQueryDto): Promise<MerchantInventoryAdjustmentDto[]>;
    getRestockSuggestions(currentUser: AuthenticatedUserEntity, branchId: string): Promise<MerchantRestockSuggestionsDto>;
}

import { AuditService } from '../../audit/services/audit.service';
import { BranchesService } from '../../branches/services/branches.service';
import { MerchantInventoryOverviewDto } from '../dto/merchant-inventory-overview.dto';
import { MerchantRestockSuggestionsDto } from '../dto/merchant-restock-suggestions.dto';
import { MenusService } from './menus.service';
export declare class MerchantInventoryReadService {
    private readonly branchesService;
    private readonly menusService;
    private readonly auditService;
    constructor(branchesService: BranchesService, menusService: MenusService, auditService: AuditService);
    getOwnedBranchInventoryOverview(userId: string, branchId: string): Promise<MerchantInventoryOverviewDto>;
    listOwnedBranchInventoryAdjustments(userId: string, branchId: string, limit: number): Promise<import("../dto/merchant-inventory-adjustment.dto").MerchantInventoryAdjustmentDto[]>;
    getOwnedBranchRestockSuggestions(userId: string, branchId: string): Promise<MerchantRestockSuggestionsDto>;
    private resolveOwnedBranch;
    private resolveAttentionLevel;
    private buildTargetStockQuantity;
    private readMetadataString;
}

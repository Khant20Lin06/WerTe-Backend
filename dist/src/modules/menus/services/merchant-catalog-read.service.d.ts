import { BranchCatalogEntity } from '../entities/branch-catalog.entity';
import { MenusService } from './menus.service';
export declare class MerchantCatalogReadService {
    private readonly menusService;
    constructor(menusService: MenusService);
    getOwnedBranchCatalog(userId: string, branchId: string): Promise<BranchCatalogEntity | null>;
    getOwnedBranchScopeOverview(userId: string, branchId: string): Promise<import("../dto/merchant-menu-scope-overview.dto").MerchantMenuScopeOverviewDto>;
}

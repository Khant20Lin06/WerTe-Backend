import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantMenuScopeOverviewDto } from '../dto/merchant-menu-scope-overview.dto';
import { MerchantCatalogReadService } from '../services/merchant-catalog-read.service';
export declare class MerchantMenuScopeController {
    private readonly merchantCatalogReadService;
    constructor(merchantCatalogReadService: MerchantCatalogReadService);
    getScopeOverview(currentUser: AuthenticatedUserEntity, branchId: string): Promise<MerchantMenuScopeOverviewDto>;
}

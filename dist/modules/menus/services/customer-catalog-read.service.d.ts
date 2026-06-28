import { BranchCatalogEntity } from '../entities/branch-catalog.entity';
import { MenuCacheService } from './menu-cache.service';
import { MenusService } from './menus.service';
export declare class CustomerCatalogReadService {
    private readonly menusService;
    private readonly menuCache;
    constructor(menusService: MenusService, menuCache: MenuCacheService);
    getVisibleBranchCatalog(branchId: string, options?: {
        storeTypeCode?: string;
    }): Promise<BranchCatalogEntity | null>;
    getVisibleBranchCatalogOrThrow(branchId: string, options?: {
        storeTypeCode?: string;
    }): Promise<BranchCatalogEntity>;
    private normalizeOptionalString;
}

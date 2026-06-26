import { BranchCatalogEntity } from '../entities/branch-catalog.entity';
import { MenusService } from './menus.service';
export declare class CustomerCatalogReadService {
    private readonly menusService;
    constructor(menusService: MenusService);
    getVisibleBranchCatalog(branchId: string, options?: {
        storeTypeCode?: string;
    }): Promise<BranchCatalogEntity | null>;
    getVisibleBranchCatalogOrThrow(branchId: string, options?: {
        storeTypeCode?: string;
    }): Promise<BranchCatalogEntity>;
    private normalizeOptionalString;
}

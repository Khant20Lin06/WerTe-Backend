import { BranchCatalogDto } from '../dto/branch-catalog.dto';
import { CustomerCatalogReadService } from '../services/customer-catalog-read.service';
export declare class CustomerCatalogController {
    private readonly customerCatalogReadService;
    constructor(customerCatalogReadService: CustomerCatalogReadService);
    getBranchMenu(branchId: string): Promise<BranchCatalogDto>;
}

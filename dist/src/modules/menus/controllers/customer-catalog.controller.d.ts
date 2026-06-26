import { BranchCatalogDto } from '../dto/branch-catalog.dto';
import { GetCustomerBranchCatalogQueryDto } from '../dto/get-customer-branch-catalog-query.dto';
import { CustomerCatalogReadService } from '../services/customer-catalog-read.service';
export declare class CustomerCatalogController {
    private readonly customerCatalogReadService;
    constructor(customerCatalogReadService: CustomerCatalogReadService);
    getBranchMenu(branchId: string, query: GetCustomerBranchCatalogQueryDto): Promise<BranchCatalogDto>;
}

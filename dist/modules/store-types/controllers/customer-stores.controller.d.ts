import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CustomerStoreCatalogEntryDto } from '../dto/customer-store-catalog-entry.dto';
import { CustomerStoreDetailDto } from '../dto/customer-store-detail.dto';
import { CustomerStoreFacetsDto } from '../dto/customer-store-facets.dto';
import { GetCustomerStoreCatalogQueryDto } from '../dto/get-customer-store-catalog-query.dto';
import { CustomerStoreSummaryDto } from '../dto/customer-store-summary.dto';
import { ListCustomerStoresQueryDto } from '../dto/list-customer-stores-query.dto';
import { CustomerStoreDiscoveryService } from '../services/customer-store-discovery.service';
export declare class CustomerStoresController {
    private readonly customerStoreDiscoveryService;
    constructor(customerStoreDiscoveryService: CustomerStoreDiscoveryService);
    facets(currentUser: AuthenticatedUserEntity | null, query: ListCustomerStoresQueryDto): Promise<CustomerStoreFacetsDto>;
    list(currentUser: AuthenticatedUserEntity | null, query: ListCustomerStoresQueryDto): Promise<CustomerStoreSummaryDto[]>;
    detail(currentUser: AuthenticatedUserEntity, branchId: string): Promise<CustomerStoreDetailDto>;
    catalog(currentUser: AuthenticatedUserEntity, branchId: string, query: GetCustomerStoreCatalogQueryDto): Promise<CustomerStoreCatalogEntryDto>;
}

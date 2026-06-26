import { CustomerStoreDiscoveryRecord } from '../entities/customer-store-discovery.entity';
export declare class CustomerStoreTypeFacetDto {
    id: string;
    code: string;
    name: string;
    count: number;
}
export declare class CustomerTownshipFacetDto {
    township: string;
    count: number;
}
export declare class CustomerStoreFacetsDto {
    totalStoreCount: number;
    storeTypes: CustomerStoreTypeFacetDto[];
    townships: CustomerTownshipFacetDto[];
}
export declare function toCustomerStoreFacetsDto(branches: CustomerStoreDiscoveryRecord[]): CustomerStoreFacetsDto;

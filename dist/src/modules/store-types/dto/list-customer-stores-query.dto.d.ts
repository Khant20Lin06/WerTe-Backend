export declare enum CustomerStoreSortBy {
    NAME_ASC = "NAME_ASC",
    NAME_DESC = "NAME_DESC",
    TOWNSHIP_ASC = "TOWNSHIP_ASC",
    TOWNSHIP_DESC = "TOWNSHIP_DESC",
    MERCHANT_NAME_ASC = "MERCHANT_NAME_ASC"
}
export declare class ListCustomerStoresQueryDto {
    storeTypeCode?: string;
    storeTypeCodes?: string[];
    township?: string;
    keyword?: string;
    merchantId?: string;
    branchId?: string;
    sortBy?: CustomerStoreSortBy;
}

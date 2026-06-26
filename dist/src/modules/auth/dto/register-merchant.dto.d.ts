export declare const VALID_STORE_TYPE_CODES: readonly ["restaurant", "grocery", "pharmacy", "beauty", "fashion"];
export type StoreTypeCode = (typeof VALID_STORE_TYPE_CODES)[number];
export declare class RegisterMerchantDto {
    phone: string;
    password: string;
    name: string;
    supportPhone?: string;
    storeType?: StoreTypeCode;
}

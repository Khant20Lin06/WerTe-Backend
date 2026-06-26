import { MerchantStatus } from '@prisma/client';
export declare class AdminUpdateMerchantStatusDto {
    status: Exclude<MerchantStatus, 'PENDING'>;
}

import { MerchantStatus } from '@prisma/client';
import { MerchantOwnershipRecord } from '../entities/merchant-ownership.entity';
export declare class MerchantProfileDto {
    id: string;
    name: string;
    phone: string;
    supportPhone?: string | null;
    status: MerchantStatus;
    createdAt: string;
    updatedAt: string;
}
export declare function toMerchantProfileDto(merchant: MerchantOwnershipRecord): MerchantProfileDto;

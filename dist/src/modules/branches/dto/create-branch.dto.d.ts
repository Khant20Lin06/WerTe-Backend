import { BranchStatus } from '@prisma/client';
import { StoreTypeCode } from '../../auth/dto/register-merchant.dto';
export declare class CreateBranchDto {
    name: string;
    contactPhone?: string;
    line1?: string;
    township: string;
    latitude?: number;
    longitude?: number;
    storeType?: StoreTypeCode;
    status?: BranchStatus;
    zoneIds?: string[];
    operatingHours?: Record<string, {
        open: boolean;
        openTime?: string;
        closeTime?: string;
    }>;
}

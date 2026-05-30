import { BranchStatus } from '@prisma/client';
export declare class CreateBranchDto {
    name: string;
    contactPhone?: string;
    line1?: string;
    township: string;
    latitude?: number;
    longitude?: number;
    status?: BranchStatus;
    zoneIds?: string[];
}

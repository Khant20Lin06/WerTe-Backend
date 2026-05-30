import { BranchStatus, ZoneStatus } from '@prisma/client';
import { BranchOwnershipRecord } from '../entities/branch-ownership.entity';
export declare class BranchZoneDto {
    zoneId: string;
    code: string;
    name: string;
    status: ZoneStatus;
}
export declare class BranchDto {
    id: string;
    merchantId: string;
    name: string;
    contactPhone?: string | null;
    line1?: string | null;
    township: string;
    latitude?: string | null;
    longitude?: string | null;
    status: BranchStatus;
    zones: BranchZoneDto[];
    createdAt: string;
    updatedAt: string;
}
export declare function toBranchDto(branch: BranchOwnershipRecord): BranchDto;

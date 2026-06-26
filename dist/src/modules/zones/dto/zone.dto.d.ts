import { ZoneStatus } from '@prisma/client';
import { ZoneManagementRecord } from '../entities/zone-management.entity';
import { ZoneReadRecord } from '../entities/zone-read.entity';
type ZoneDtoSource = ZoneReadRecord | ZoneManagementRecord;
export declare class ZoneDto {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    status: ZoneStatus;
    branchCount?: number;
    createdAt: string;
    updatedAt: string;
}
export declare function toZoneDto(zone: ZoneDtoSource): ZoneDto;
export {};

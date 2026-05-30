import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ZoneManagementRecord } from '../entities/zone-management.entity';
import { ZoneReadRecord } from '../entities/zone-read.entity';
export declare class ZonesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<ZoneReadRecord | null>;
    findByCode(code: string): Promise<ZoneReadRecord | null>;
    findManagementById(id: string): Promise<ZoneManagementRecord | null>;
    findManagementByCode(code: string): Promise<ZoneManagementRecord | null>;
    listAll(): Promise<ZoneManagementRecord[]>;
    listActive(): Promise<ZoneReadRecord[]>;
    listByBranchId(branchId: string): Promise<ZoneReadRecord[]>;
    listByIds(ids: string[]): Promise<ZoneReadRecord[]>;
    create(data: Prisma.ZoneCreateInput): Promise<ZoneManagementRecord>;
    update(id: string, data: Prisma.ZoneUpdateInput): Promise<ZoneManagementRecord>;
}

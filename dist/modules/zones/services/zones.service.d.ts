import { ZoneManagementRecord } from '../entities/zone-management.entity';
import { ZoneReadEntity, ZoneReadRecord } from '../entities/zone-read.entity';
import { ZonesRepository } from '../repositories/zones.repository';
export declare class ZonesService {
    private readonly zonesRepository;
    constructor(zonesRepository: ZonesRepository);
    findById(id: string): Promise<ZoneReadRecord | null>;
    findByCode(code: string): Promise<ZoneReadRecord | null>;
    listActive(): Promise<ZoneReadRecord[]>;
    listByBranchId(branchId: string): Promise<ZoneReadRecord[]>;
    listByIds(ids: string[]): Promise<ZoneReadRecord[]>;
    listAll(): Promise<ZoneManagementRecord[]>;
    findManagementById(id: string): Promise<ZoneManagementRecord | null>;
    findManagementByCode(code: string): Promise<ZoneManagementRecord | null>;
    buildReadModel(zone: ZoneReadRecord): ZoneReadEntity;
}

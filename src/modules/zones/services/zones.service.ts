import { Injectable } from '@nestjs/common';

import { ZoneManagementRecord } from '../entities/zone-management.entity';
import {
  buildZoneRead,
  ZoneReadEntity,
  ZoneReadRecord,
} from '../entities/zone-read.entity';
import { ZonesRepository } from '../repositories/zones.repository';

@Injectable()
export class ZonesService {
  constructor(private readonly zonesRepository: ZonesRepository) {}

  findById(id: string): Promise<ZoneReadRecord | null> {
    return this.zonesRepository.findById(id);
  }

  findByCode(code: string): Promise<ZoneReadRecord | null> {
    return this.zonesRepository.findByCode(code);
  }

  listActive(): Promise<ZoneReadRecord[]> {
    return this.zonesRepository.listActive();
  }

  listByBranchId(branchId: string): Promise<ZoneReadRecord[]> {
    return this.zonesRepository.listByBranchId(branchId);
  }

  listByIds(ids: string[]): Promise<ZoneReadRecord[]> {
    return this.zonesRepository.listByIds(ids);
  }

  listAll(): Promise<ZoneManagementRecord[]> {
    return this.zonesRepository.listAll();
  }

  findManagementById(id: string): Promise<ZoneManagementRecord | null> {
    return this.zonesRepository.findManagementById(id);
  }

  findManagementByCode(code: string): Promise<ZoneManagementRecord | null> {
    return this.zonesRepository.findManagementByCode(code);
  }

  buildReadModel(zone: ZoneReadRecord): ZoneReadEntity {
    return buildZoneRead(zone);
  }
}

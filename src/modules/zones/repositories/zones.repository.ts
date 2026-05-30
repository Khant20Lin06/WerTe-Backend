import { Injectable } from '@nestjs/common';
import { Prisma, ZoneStatus } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  ZoneManagementRecord,
  zoneManagementSelect,
} from '../entities/zone-management.entity';
import { ZoneReadRecord, zoneReadSelect } from '../entities/zone-read.entity';

@Injectable()
export class ZonesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<ZoneReadRecord | null> {
    return this.prisma.zone.findUnique({
      where: { id },
      select: zoneReadSelect,
    });
  }

  findByCode(code: string): Promise<ZoneReadRecord | null> {
    return this.prisma.zone.findUnique({
      where: { code },
      select: zoneReadSelect,
    });
  }

  findManagementById(id: string): Promise<ZoneManagementRecord | null> {
    return this.prisma.zone.findUnique({
      where: { id },
      select: zoneManagementSelect,
    });
  }

  findManagementByCode(code: string): Promise<ZoneManagementRecord | null> {
    return this.prisma.zone.findUnique({
      where: { code },
      select: zoneManagementSelect,
    });
  }

  listAll(): Promise<ZoneManagementRecord[]> {
    return this.prisma.zone.findMany({
      select: zoneManagementSelect,
      orderBy: [{ name: 'asc' }],
    });
  }

  listActive(): Promise<ZoneReadRecord[]> {
    return this.prisma.zone.findMany({
      where: { status: ZoneStatus.ACTIVE },
      select: zoneReadSelect,
      orderBy: [{ name: 'asc' }],
    });
  }

  listByBranchId(branchId: string): Promise<ZoneReadRecord[]> {
    return this.prisma.zone.findMany({
      where: {
        branchZones: {
          some: {
            branchId,
          },
        },
      },
      select: zoneReadSelect,
      orderBy: [{ name: 'asc' }],
    });
  }

  listByIds(ids: string[]): Promise<ZoneReadRecord[]> {
    return this.prisma.zone.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: zoneReadSelect,
      orderBy: [{ name: 'asc' }],
    });
  }

  create(data: Prisma.ZoneCreateInput): Promise<ZoneManagementRecord> {
    return this.prisma.zone.create({
      data,
      select: zoneManagementSelect,
    });
  }

  update(
    id: string,
    data: Prisma.ZoneUpdateInput,
  ): Promise<ZoneManagementRecord> {
    return this.prisma.zone.update({
      where: { id },
      data,
      select: zoneManagementSelect,
    });
  }
}

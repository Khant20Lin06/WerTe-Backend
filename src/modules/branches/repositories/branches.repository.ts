import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  branchOwnershipInclude,
  BranchOwnershipRecord,
} from '../entities/branch-ownership.entity';

type BranchDatabaseClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class BranchesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(
    id: string,
    client: BranchDatabaseClient = this.prisma,
  ): Promise<BranchOwnershipRecord | null> {
    return client.branch.findUnique({
      where: { id },
      include: branchOwnershipInclude,
    });
  }

  listByMerchantId(merchantId: string): Promise<BranchOwnershipRecord[]> {
    return this.prisma.branch.findMany({
      where: { merchantId },
      include: branchOwnershipInclude,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  create(
    data: Prisma.BranchUncheckedCreateInput,
    client: BranchDatabaseClient = this.prisma,
  ) {
    return client.branch.create({
      data,
      include: branchOwnershipInclude,
    });
  }

  update(
    id: string,
    data: Prisma.BranchUpdateInput,
    client: BranchDatabaseClient = this.prisma,
  ) {
    return client.branch.update({
      where: { id },
      data,
      include: branchOwnershipInclude,
    });
  }

  clearZoneAssignments(
    branchId: string,
    client: BranchDatabaseClient = this.prisma,
  ) {
    return client.branchZone.deleteMany({
      where: {
        branchId,
      },
    });
  }

  assignZones(
    branchId: string,
    zoneIds: string[],
    client: BranchDatabaseClient = this.prisma,
  ) {
    if (zoneIds.length === 0) {
      return Promise.resolve({ count: 0 });
    }

    return client.branchZone.createMany({
      data: zoneIds.map((zoneId) => ({
        branchId,
        zoneId,
      })),
      skipDuplicates: true,
    });
  }
}

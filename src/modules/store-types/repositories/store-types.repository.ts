import { Injectable } from '@nestjs/common';
import {
  BranchStatus,
  BranchStoreTypeStatus,
  MerchantStatus,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  BranchStoreTypeManagementRecord,
  branchStoreTypeManagementInclude,
} from '../entities/branch-store-type-management.entity';
import {
  customerStoreDiscoveryInclude,
  CustomerStoreDiscoveryRecord,
} from '../entities/customer-store-discovery.entity';
import {
  StoreTypeManagementRecord,
  storeTypeManagementInclude,
} from '../entities/store-type-management.entity';

type StoreTypesDatabaseClient = PrismaService | Prisma.TransactionClient;

const branchSummarySelect = Prisma.validator<Prisma.BranchSelect>()({
  id: true,
  merchantId: true,
  name: true,
  status: true,
  storeType: true,
  primaryStoreTypeId: true,
  merchant: {
    select: {
      id: true,
      userId: true,
      name: true,
      storeType: true,
      primaryStoreTypeId: true,
    },
  },
});

export type BranchSummaryRecord = Prisma.BranchGetPayload<{
  select: typeof branchSummarySelect;
}>;

@Injectable()
export class StoreTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  listStoreTypes(
    client: StoreTypesDatabaseClient = this.prisma,
  ): Promise<StoreTypeManagementRecord[]> {
    return client.storeType.findMany({
      include: storeTypeManagementInclude,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  listActiveStoreTypes(
    client: StoreTypesDatabaseClient = this.prisma,
  ): Promise<StoreTypeManagementRecord[]> {
    return client.storeType.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: storeTypeManagementInclude,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  findStoreTypeById(
    id: string,
    client: StoreTypesDatabaseClient = this.prisma,
  ): Promise<StoreTypeManagementRecord | null> {
    return client.storeType.findUnique({
      where: { id },
      include: storeTypeManagementInclude,
    });
  }

  findStoreTypeByCode(
    code: string,
    client: StoreTypesDatabaseClient = this.prisma,
  ): Promise<StoreTypeManagementRecord | null> {
    return client.storeType.findUnique({
      where: { code },
      include: storeTypeManagementInclude,
    });
  }

  createStoreType(
    data: Prisma.StoreTypeCreateInput,
    client: StoreTypesDatabaseClient = this.prisma,
  ): Promise<StoreTypeManagementRecord> {
    return client.storeType.create({
      data,
      include: storeTypeManagementInclude,
    });
  }

  updateStoreType(
    id: string,
    data: Prisma.StoreTypeUpdateInput,
    client: StoreTypesDatabaseClient = this.prisma,
  ): Promise<StoreTypeManagementRecord> {
    return client.storeType.update({
      where: { id },
      data,
      include: storeTypeManagementInclude,
    });
  }

  findBranchSummaryById(
    branchId: string,
    client: StoreTypesDatabaseClient = this.prisma,
  ): Promise<BranchSummaryRecord | null> {
    return client.branch.findUnique({
      where: { id: branchId },
      select: branchSummarySelect,
    });
  }

  listBranchStoreTypes(
    filter: {
      branchId?: string;
      storeTypeId?: string;
      status?: BranchStoreTypeStatus;
    },
    client: StoreTypesDatabaseClient = this.prisma,
  ): Promise<BranchStoreTypeManagementRecord[]> {
    return client.branchStoreType.findMany({
      where: {
        ...(filter.branchId !== undefined ? { branchId: filter.branchId } : {}),
        ...(filter.storeTypeId !== undefined
          ? { storeTypeId: filter.storeTypeId }
          : {}),
        ...(filter.status !== undefined ? { status: filter.status } : {}),
      },
      include: branchStoreTypeManagementInclude,
      orderBy: [
        { branch: { name: 'asc' } },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  findBranchStoreType(
    branchId: string,
    storeTypeId: string,
    client: StoreTypesDatabaseClient = this.prisma,
  ): Promise<BranchStoreTypeManagementRecord | null> {
    return client.branchStoreType.findUnique({
      where: {
        branchId_storeTypeId: {
          branchId,
          storeTypeId,
        },
      },
      include: branchStoreTypeManagementInclude,
    });
  }

  createBranchStoreType(
    data: Prisma.BranchStoreTypeUncheckedCreateInput,
    client: StoreTypesDatabaseClient = this.prisma,
  ): Promise<BranchStoreTypeManagementRecord> {
    return client.branchStoreType.create({
      data,
      include: branchStoreTypeManagementInclude,
    });
  }

  updateBranchStoreType(
    branchId: string,
    storeTypeId: string,
    data: Prisma.BranchStoreTypeUncheckedUpdateInput,
    client: StoreTypesDatabaseClient = this.prisma,
  ): Promise<BranchStoreTypeManagementRecord> {
    return client.branchStoreType.update({
      where: {
        branchId_storeTypeId: {
          branchId,
          storeTypeId,
        },
      },
      data,
      include: branchStoreTypeManagementInclude,
    });
  }

  clearBranchPrimaryAssignments(
    branchId: string,
    client: StoreTypesDatabaseClient = this.prisma,
  ) {
    return client.branchStoreType.updateMany({
      where: {
        branchId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  listApprovedBranchStoreTypes(
    branchId: string,
    client: StoreTypesDatabaseClient = this.prisma,
  ): Promise<BranchStoreTypeManagementRecord[]> {
    return client.branchStoreType.findMany({
      where: {
        branchId,
        status: BranchStoreTypeStatus.APPROVED,
      },
      include: branchStoreTypeManagementInclude,
      orderBy: [
        { isPrimary: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  listCustomerDiscoverableBranches(
    filter: {
      branchId?: string;
      merchantId?: string;
      storeTypeCodes?: string[];
      township?: string;
      keyword?: string;
    },
    client: StoreTypesDatabaseClient = this.prisma,
  ): Promise<CustomerStoreDiscoveryRecord[]> {
    return client.branch.findMany({
      where: {
        status: BranchStatus.ACTIVE,
        ...(filter.branchId !== undefined ? { id: filter.branchId } : {}),
        ...(filter.merchantId !== undefined
          ? { merchantId: filter.merchantId }
          : {}),
        ...(filter.township !== undefined
          ? {
              township: {
                contains: filter.township,
                mode: 'insensitive',
              },
            }
          : {}),
        merchant: {
          status: MerchantStatus.ACTIVE,
        },
        storeTypes: {
          some: {
            status: BranchStoreTypeStatus.APPROVED,
            storeType: {
              isActive: true,
              deletedAt: null,
              ...(filter.storeTypeCodes !== undefined
                ? {
                    code: {
                      in: filter.storeTypeCodes,
                    },
                  }
                : {}),
            },
          },
        },
        ...(filter.keyword !== undefined
          ? {
              OR: [
                {
                  name: {
                    contains: filter.keyword,
                    mode: 'insensitive',
                  },
                },
                {
                  township: {
                    contains: filter.keyword,
                    mode: 'insensitive',
                  },
                },
                {
                  merchant: {
                    name: {
                      contains: filter.keyword,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: customerStoreDiscoveryInclude,
      orderBy: [{ name: 'asc' }, { createdAt: 'asc' }],
    });
  }

  updateBranchPrimaryStoreType(
    branchId: string,
    data: Prisma.BranchUncheckedUpdateInput,
    client: StoreTypesDatabaseClient = this.prisma,
  ) {
    return client.branch.update({
      where: { id: branchId },
      data,
    });
  }
}

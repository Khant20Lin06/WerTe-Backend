import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, RatingTargetType, ZoneStatus } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantOwnershipRecord } from '../../merchants/entities/merchant-ownership.entity';
import { MerchantAccountService } from '../../merchants/services/merchant-account.service';
import { DiscoveryCacheService } from '../../store-types/services/discovery-cache.service';
import { ZonesService } from '../../zones/services/zones.service';
import { BranchDto, BranchRatingSummary, toBranchDto } from '../dto/branch.dto';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { BranchOwnershipRecord } from '../entities/branch-ownership.entity';
import { BranchPolicyService } from '../policies/branch-policy.service';
import { BranchesRepository } from '../repositories/branches.repository';
import { BranchesService } from './branches.service';

@Injectable()
export class MerchantBranchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly merchantAccountService: MerchantAccountService,
    private readonly branchesRepository: BranchesRepository,
    private readonly branchesService: BranchesService,
    private readonly branchPolicyService: BranchPolicyService,
    private readonly zonesService: ZonesService,
    private readonly discoveryCache: DiscoveryCacheService,
  ) {}

  async listCurrentMerchantBranches(
    currentUser: AuthenticatedUserEntity,
  ): Promise<BranchDto[]> {
    const merchant = await this.resolveCurrentMerchant(currentUser);
    const branches = await this.branchesService.listByMerchantId(merchant.id);
    const ratingMap = await this.fetchBranchRatingMap(
      branches.map((branch) => branch.id),
    );

    return branches.map((branch) =>
      toBranchDto(branch, ratingMap.get(branch.id)),
    );
  }

  async getCurrentMerchantBranch(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<BranchDto> {
    const branch = await this.resolveOwnedBranch(currentUser, branchId);
    const rating = await this.fetchSingleBranchRating(branch.id);

    return toBranchDto(branch, rating);
  }

  private async fetchBranchRatingMap(
    branchIds: string[],
  ): Promise<Map<string, BranchRatingSummary>> {
    if (branchIds.length === 0) return new Map();
    const rows = await this.prisma.rating.groupBy({
      by: ['targetId'],
      where: { targetType: RatingTargetType.BRANCH, targetId: { in: branchIds } },
      _avg: { score: true },
      _count: { score: true },
    });
    const map = new Map<string, BranchRatingSummary>();
    for (const row of rows) {
      map.set(row.targetId, {
        averageRating: row._avg.score !== null ? Math.round(row._avg.score * 10) / 10 : null,
        reviewCount: row._count.score,
      });
    }
    return map;
  }

  private async fetchSingleBranchRating(
    branchId: string,
  ): Promise<BranchRatingSummary> {
    const map = await this.fetchBranchRatingMap([branchId]);
    return map.get(branchId) ?? { averageRating: null, reviewCount: 0 };
  }

  async createCurrentMerchantBranch(
    currentUser: AuthenticatedUserEntity,
    payload: CreateBranchDto,
  ): Promise<BranchDto> {
    const merchant = await this.resolveCurrentMerchant(currentUser);
    const zoneIds = this.normalizeZoneIds(payload.zoneIds);
    const storeType = this.normalizeStoreTypeCode(
      payload.storeType ?? merchant.storeType,
    );

    await this.assertValidZoneAssignments(zoneIds);

    const branch = await this.prisma.runInTransaction(async (tx) => {
      const createdBranch = await this.branchesRepository.create(
        {
          merchantId: merchant.id,
          name: payload.name,
          contactPhone: payload.contactPhone,
          line1: payload.line1,
          township: payload.township,
          latitude: payload.latitude,
          longitude: payload.longitude,
          storeType,
          status: payload.status,
          ...(payload.operatingHours !== undefined
            ? { operatingHours: (payload.operatingHours ?? Prisma.JsonNull) as Prisma.InputJsonValue }
            : {}),
        },
        tx,
      );

      if (zoneIds.length > 0) {
        await this.branchesRepository.assignZones(createdBranch.id, zoneIds, tx);
      }

      return this.branchesRepository.findById(createdBranch.id, tx);
    });

    if (branch === null) {
      throw new AppException(
        'Created branch could not be loaded.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          code: ErrorCodes.internalServerError,
        },
      );
    }

    // New branch — evict the merchant's branch list so it reflects the addition.
    await this.branchesService.invalidateCache(branch.id, merchant.id);

    return toBranchDto(branch);
  }

  async updateCurrentMerchantBranch(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    payload: UpdateBranchDto,
  ): Promise<BranchDto> {
    const branch = await this.resolveOwnedBranch(currentUser, branchId);
    const zoneIds =
      payload.zoneIds !== undefined ? this.normalizeZoneIds(payload.zoneIds) : null;
    const storeType =
      payload.storeType !== undefined
        ? this.normalizeStoreTypeCode(payload.storeType)
        : undefined;

    if (zoneIds !== null) {
      await this.assertValidZoneAssignments(zoneIds);
    }

    const updatedBranch = await this.prisma.runInTransaction(async (tx) => {
      await this.branchesRepository.update(
        branch.id,
        {
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.contactPhone !== undefined
            ? { contactPhone: payload.contactPhone }
            : {}),
          ...(payload.line1 !== undefined ? { line1: payload.line1 } : {}),
          ...(payload.township !== undefined
            ? { township: payload.township }
            : {}),
          ...(payload.latitude !== undefined
            ? { latitude: payload.latitude }
            : {}),
          ...(payload.longitude !== undefined
            ? { longitude: payload.longitude }
            : {}),
          ...(storeType !== undefined ? { storeType } : {}),
          ...(payload.status !== undefined ? { status: payload.status } : {}),
          ...(payload.operatingHours !== undefined
            ? { operatingHours: (payload.operatingHours ?? Prisma.JsonNull) as Prisma.InputJsonValue }
            : {}),
        },
        tx,
      );

      if (zoneIds !== null) {
        await this.branchesRepository.clearZoneAssignments(branch.id, tx);
        await this.branchesRepository.assignZones(branch.id, zoneIds, tx);
      }

      return this.branchesRepository.findById(branch.id, tx);
    });

    if (updatedBranch === null) {
      throw new AppException(
        'Updated branch could not be loaded.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          code: ErrorCodes.internalServerError,
        },
      );
    }

    await Promise.all([
      this.branchesService.invalidateCache(updatedBranch.id, updatedBranch.merchant.id),
      this.discoveryCache.invalidateAll(),
    ]);

    return toBranchDto(updatedBranch);
  }

  private async resolveCurrentMerchant(
    currentUser: AuthenticatedUserEntity,
  ): Promise<MerchantOwnershipRecord> {
    return this.merchantAccountService.resolveOwnedMerchant(currentUser);
  }

  private async resolveOwnedBranch(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<BranchOwnershipRecord> {
    const branch = await this.branchesRepository.findById(branchId);

    if (branch === null) {
      throw new AppException('Branch was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (!this.branchPolicyService.canManageBranch(currentUser, branch)) {
      throw new AppException(
        'You are not allowed to manage this branch.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return branch;
  }

  private normalizeZoneIds(zoneIds?: string[]): string[] {
    if (zoneIds === undefined) {
      return [];
    }

    return [...new Set(zoneIds)];
  }

  private normalizeStoreTypeCode(storeType: string): string {
    return storeType.trim().toLowerCase();
  }

  private async assertValidZoneAssignments(zoneIds: string[]) {
    if (zoneIds.length === 0) {
      return;
    }

    const zones = await this.zonesService.listByIds(zoneIds);
    if (zones.length !== zoneIds.length) {
      throw new AppException(
        'One or more branch zones do not exist.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            zoneIds,
          },
        },
      );
    }

    const inactiveZones = zones.filter((zone) => zone.status !== ZoneStatus.ACTIVE);
    if (inactiveZones.length > 0) {
      throw new AppException(
        'Inactive zones cannot be assigned to a branch.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            zoneIds: inactiveZones.map((zone) => zone.id),
          },
        },
      );
    }
  }
}

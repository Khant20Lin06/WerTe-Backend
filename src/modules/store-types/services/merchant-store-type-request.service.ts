import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AuditActionSource,
  AuditActorType,
  AuditResourceType,
  BranchStoreTypeStatus,
  UserRole,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import {
  hasOwnedResourceAccess,
} from '../../../common/policies/tenant-access-policy.helper';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import {
  AvailableStoreTypeDto,
  toAvailableStoreTypeDto,
} from '../dto/available-store-type.dto';
import {
  BranchStoreTypeDto,
  toBranchStoreTypeDto,
} from '../dto/branch-store-type.dto';
import { RequestBranchStoreTypeDto } from '../dto/request-branch-store-type.dto';
import { StoreTypePolicyService } from '../policies/store-type-policy.service';
import { StoreTypesRepository } from '../repositories/store-types.repository';
import { StoreTypeCacheService } from './store-type-cache.service';

@Injectable()
export class MerchantStoreTypeRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storeTypesRepository: StoreTypesRepository,
    private readonly storeTypeCache: StoreTypeCacheService,
    private readonly storeTypePolicyService: StoreTypePolicyService,
    private readonly auditService: AuditService,
  ) {}

  async listAvailableStoreTypes(
    currentUser: AuthenticatedUserEntity,
  ): Promise<AvailableStoreTypeDto[]> {
    this.assertCanRequestStoreTypes(currentUser);

    const cached = await this.storeTypeCache.getActiveList();
    if (cached !== null) return cached.map(toAvailableStoreTypeDto);

    const storeTypes = await this.storeTypesRepository.listActiveStoreTypes();
    await this.storeTypeCache.setActiveList(storeTypes);

    return storeTypes.map((storeType) => toAvailableStoreTypeDto(storeType));
  }

  async listCurrentMerchantBranchStoreTypes(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<BranchStoreTypeDto[]> {
    this.assertCanRequestStoreTypes(currentUser);
    await this.requireOwnedBranch(currentUser, branchId);

    const assignments = await this.storeTypesRepository.listBranchStoreTypes({
      branchId,
    });

    return assignments.map((assignment) => toBranchStoreTypeDto(assignment));
  }

  async requestCurrentMerchantBranchStoreType(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    payload: RequestBranchStoreTypeDto,
  ): Promise<BranchStoreTypeDto> {
    this.assertCanRequestStoreTypes(currentUser);

    const assignment = await this.prisma.runInTransaction(async (tx) => {
      await this.requireOwnedBranch(currentUser, branchId, tx);

      const storeType = await this.requireRequestableStoreType(
        payload.storeTypeId,
        tx,
      );
      const existingAssignment = await this.storeTypesRepository.findBranchStoreType(
        branchId,
        storeType.id,
        tx,
      );

      if (existingAssignment?.status === BranchStoreTypeStatus.APPROVED) {
        throw new AppException(
          'This store type is already approved for the branch.',
          HttpStatus.CONFLICT,
          {
            code: ErrorCodes.conflict,
            details: {
              branchId,
              storeTypeId: storeType.id,
            },
          },
        );
      }

      const normalizedReason = this.normalizeOptionalString(payload.reason);
      const sortOrder = payload.sortOrder ?? existingAssignment?.sortOrder ?? 0;

      if (existingAssignment === null) {
        await this.storeTypesRepository.createBranchStoreType(
          {
            branchId,
            storeTypeId: storeType.id,
            status: BranchStoreTypeStatus.PENDING,
            isPrimary: false,
            sortOrder,
            requestedByUserId: currentUser.userId,
            approvedByUserId: null,
            approvedAt: null,
            rejectedAt: null,
            hiddenAt: null,
            reason: normalizedReason,
          },
          tx,
        );
      } else {
        await this.storeTypesRepository.updateBranchStoreType(
          branchId,
          storeType.id,
          {
            status: BranchStoreTypeStatus.PENDING,
            isPrimary: false,
            sortOrder,
            requestedByUserId: currentUser.userId,
            approvedByUserId: null,
            approvedAt: null,
            rejectedAt: null,
            hiddenAt: null,
            reason: normalizedReason,
          },
          tx,
        );
      }

      return this.requireBranchStoreType(branchId, storeType.id, tx);
    });

    await this.auditService.logAction({
      actorType: AuditActorType.USER,
      actorUserId: currentUser.userId,
      actorRole: currentUser.role,
      actionSource: AuditActionSource.API,
      action: 'branch_store_types.requested',
      resourceType: AuditResourceType.BRANCH_STORE_TYPE,
      resourceId: `${branchId}:${payload.storeTypeId}`,
      resourceLabel: assignment.storeType.name,
      branchId,
      metadataJson: {
        status: assignment.status,
        reason: assignment.reason,
      },
    });

    return toBranchStoreTypeDto(assignment);
  }

  private assertCanRequestStoreTypes(currentUser: AuthenticatedUserEntity) {
    if (!this.storeTypePolicyService.canRequestStoreTypes(currentUser)) {
      throw new AppException(
        'You are not allowed to request store types.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }
  }

  private async requireOwnedBranch(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    client?: Parameters<StoreTypesRepository['findBranchSummaryById']>[1],
  ) {
    const branch = await this.storeTypesRepository.findBranchSummaryById(
      branchId,
      client,
    );
    if (branch === null) {
      throw new AppException('Branch was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (
      !hasOwnedResourceAccess({
        currentUser,
        expectedRole: UserRole.MERCHANT,
        ownerUserId: branch.merchant.userId,
        resourceId: branch.merchant.id,
        actorScopedResourceId: currentUser.actorContext.merchantId,
      })
    ) {
      throw new AppException(
        'You are not allowed to manage store type requests for this branch.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return branch;
  }

  private async requireRequestableStoreType(
    storeTypeId: string,
    client?: Parameters<StoreTypesRepository['findStoreTypeById']>[1],
  ) {
    const storeType = await this.storeTypesRepository.findStoreTypeById(
      storeTypeId,
      client,
    );
    if (storeType === null) {
      throw new AppException('Store type was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (!storeType.isActive || storeType.deletedAt !== null) {
      throw new AppException(
        'This store type is not currently available for merchant requests.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            storeTypeId,
          },
        },
      );
    }

    return storeType;
  }

  private async requireBranchStoreType(
    branchId: string,
    storeTypeId: string,
    client?: Parameters<StoreTypesRepository['findBranchStoreType']>[2],
  ) {
    const assignment = await this.storeTypesRepository.findBranchStoreType(
      branchId,
      storeTypeId,
      client,
    );

    if (assignment === null) {
      throw new AppException(
        'Branch store type request could not be loaded.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          code: ErrorCodes.internalServerError,
        },
      );
    }

    return assignment;
  }

  private normalizeOptionalString(value?: string | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalizedValue = value.trim();

    return normalizedValue.length > 0 ? normalizedValue : null;
  }
}

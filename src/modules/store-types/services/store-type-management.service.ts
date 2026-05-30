import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AuditActionSource,
  AuditActorType,
  AuditResourceType,
  BranchStoreTypeStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdminBranchStoreTypeActionDto } from '../dto/admin-branch-store-type-action.dto';
import {
  BranchStoreTypeDto,
  toBranchStoreTypeDto,
} from '../dto/branch-store-type.dto';
import { CreateStoreTypeDto } from '../dto/create-store-type.dto';
import { ListAdminBranchStoreTypesQueryDto } from '../dto/list-admin-branch-store-types-query.dto';
import { ManageBranchStoreTypeDto } from '../dto/manage-branch-store-type.dto';
import { StoreTypeDto, toStoreTypeDto } from '../dto/store-type.dto';
import { UpdateStoreTypeDto } from '../dto/update-store-type.dto';
import { StoreTypePolicyService } from '../policies/store-type-policy.service';
import { StoreTypesRepository } from '../repositories/store-types.repository';

@Injectable()
export class StoreTypeManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storeTypesRepository: StoreTypesRepository,
    private readonly storeTypePolicyService: StoreTypePolicyService,
    private readonly auditService: AuditService,
  ) {}

  async listStoreTypes(
    currentUser: AuthenticatedUserEntity,
  ): Promise<StoreTypeDto[]> {
    this.assertCanManageStoreTypes(currentUser);

    const storeTypes = await this.storeTypesRepository.listStoreTypes();

    return storeTypes.map((storeType) => toStoreTypeDto(storeType));
  }

  async getStoreType(
    currentUser: AuthenticatedUserEntity,
    storeTypeId: string,
  ): Promise<StoreTypeDto> {
    this.assertCanManageStoreTypes(currentUser);

    const storeType = await this.requireStoreType(storeTypeId);

    return toStoreTypeDto(storeType);
  }

  async createStoreType(
    currentUser: AuthenticatedUserEntity,
    payload: CreateStoreTypeDto,
  ): Promise<StoreTypeDto> {
    this.assertCanManageStoreTypes(currentUser);

    const code = this.normalizeStoreTypeCode(payload.code);
    const existingStoreType = await this.storeTypesRepository.findStoreTypeByCode(
      code,
    );
    if (existingStoreType !== null) {
      throw new AppException(
        'Store type code is already in use.',
        HttpStatus.CONFLICT,
        {
          code: ErrorCodes.conflict,
          details: {
            code,
          },
        },
      );
    }

    const storeType = await this.storeTypesRepository.createStoreType({
      code,
      name: this.normalizeRequiredString(payload.name, 'Store type name'),
      description: this.normalizeOptionalString(payload.description),
      iconUrl: this.normalizeOptionalString(payload.iconUrl),
      isActive: payload.isActive ?? true,
      isSystem: false,
      sortOrder: payload.sortOrder ?? 0,
      ...(payload.isActive === false ? { deletedAt: new Date() } : {}),
    });

    await this.auditService.logAction({
      actorType: AuditActorType.USER,
      actorUserId: currentUser.userId,
      actorRole: currentUser.role,
      actionSource: AuditActionSource.API,
      action: 'store_types.created',
      resourceType: AuditResourceType.STORE_TYPE,
      resourceId: storeType.id,
      resourceLabel: storeType.name,
      metadataJson: {
        code: storeType.code,
        isActive: storeType.isActive,
        isSystem: storeType.isSystem,
      },
    });

    return toStoreTypeDto(storeType);
  }

  async updateStoreType(
    currentUser: AuthenticatedUserEntity,
    storeTypeId: string,
    payload: UpdateStoreTypeDto,
  ): Promise<StoreTypeDto> {
    this.assertCanManageStoreTypes(currentUser);

    const existingStoreType = await this.requireStoreType(storeTypeId);
    const isActive = payload.isActive ?? existingStoreType.isActive;

    const storeType = await this.storeTypesRepository.updateStoreType(storeTypeId, {
      ...(payload.name !== undefined
        ? {
            name: this.normalizeRequiredString(payload.name, 'Store type name'),
          }
        : {}),
      ...(payload.description !== undefined
        ? {
            description: this.normalizeOptionalString(payload.description),
          }
        : {}),
      ...(payload.iconUrl !== undefined
        ? {
            iconUrl: this.normalizeOptionalString(payload.iconUrl),
          }
        : {}),
      ...(payload.sortOrder !== undefined ? { sortOrder: payload.sortOrder } : {}),
      ...(payload.isActive !== undefined
        ? {
            isActive,
            deletedAt: isActive ? null : existingStoreType.deletedAt ?? new Date(),
          }
        : {}),
    });

    await this.auditService.logAction({
      actorType: AuditActorType.USER,
      actorUserId: currentUser.userId,
      actorRole: currentUser.role,
      actionSource: AuditActionSource.API,
      action: 'store_types.updated',
      resourceType: AuditResourceType.STORE_TYPE,
      resourceId: storeType.id,
      resourceLabel: storeType.name,
      metadataJson: {
        isActive: storeType.isActive,
        sortOrder: storeType.sortOrder,
      },
    });

    return toStoreTypeDto(storeType);
  }

  async archiveStoreType(
    currentUser: AuthenticatedUserEntity,
    storeTypeId: string,
  ): Promise<StoreTypeDto> {
    this.assertCanManageStoreTypes(currentUser);

    const storeType = await this.requireStoreType(storeTypeId);
    if (!storeType.isActive && storeType.deletedAt !== null) {
      return toStoreTypeDto(storeType);
    }

    const archivedStoreType = await this.storeTypesRepository.updateStoreType(
      storeTypeId,
      {
        isActive: false,
        deletedAt: new Date(),
      },
    );

    await this.auditService.logAction({
      actorType: AuditActorType.USER,
      actorUserId: currentUser.userId,
      actorRole: currentUser.role,
      actionSource: AuditActionSource.API,
      action: 'store_types.archived',
      resourceType: AuditResourceType.STORE_TYPE,
      resourceId: archivedStoreType.id,
      resourceLabel: archivedStoreType.name,
      metadataJson: {
        code: archivedStoreType.code,
      },
    });

    return toStoreTypeDto(archivedStoreType);
  }

  async activateStoreType(
    currentUser: AuthenticatedUserEntity,
    storeTypeId: string,
  ): Promise<StoreTypeDto> {
    this.assertCanManageStoreTypes(currentUser);

    await this.requireStoreType(storeTypeId);

    const activatedStoreType = await this.storeTypesRepository.updateStoreType(
      storeTypeId,
      {
        isActive: true,
        deletedAt: null,
      },
    );

    await this.auditService.logAction({
      actorType: AuditActorType.USER,
      actorUserId: currentUser.userId,
      actorRole: currentUser.role,
      actionSource: AuditActionSource.API,
      action: 'store_types.activated',
      resourceType: AuditResourceType.STORE_TYPE,
      resourceId: activatedStoreType.id,
      resourceLabel: activatedStoreType.name,
      metadataJson: {
        code: activatedStoreType.code,
      },
    });

    return toStoreTypeDto(activatedStoreType);
  }

  async listBranchStoreTypes(
    currentUser: AuthenticatedUserEntity,
    query: ListAdminBranchStoreTypesQueryDto,
  ): Promise<BranchStoreTypeDto[]> {
    this.assertCanManageStoreTypes(currentUser);

    const assignments = await this.storeTypesRepository.listBranchStoreTypes(query);

    return assignments.map((assignment) => toBranchStoreTypeDto(assignment));
  }

  async listBranchStoreTypesByBranch(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<BranchStoreTypeDto[]> {
    this.assertCanManageStoreTypes(currentUser);
    await this.requireBranch(branchId);

    return this.listBranchStoreTypes(currentUser, { branchId });
  }

  async assignBranchStoreType(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    payload: ManageBranchStoreTypeDto,
  ): Promise<BranchStoreTypeDto> {
    this.assertCanManageStoreTypes(currentUser);

    const targetStatus = payload.status ?? BranchStoreTypeStatus.APPROVED;
    this.assertPrimaryCompatible(targetStatus, payload.isPrimary);

    const assignment = await this.prisma.runInTransaction(async (tx) => {
      const branch = await this.requireBranch(branchId, tx);
      const storeType = await this.requireStoreType(payload.storeTypeId, tx);
      this.assertStoreTypeCanBeActivated(storeType.isActive, storeType.name);

      const existingAssignment = await this.storeTypesRepository.findBranchStoreType(
        branch.id,
        storeType.id,
        tx,
      );

      const nextSortOrder = payload.sortOrder ?? existingAssignment?.sortOrder ?? 0;
      const nextReason =
        payload.reason !== undefined
          ? this.normalizeOptionalString(payload.reason)
          : existingAssignment?.reason ?? null;

      if (existingAssignment === null) {
        await this.storeTypesRepository.createBranchStoreType(
          this.buildBranchStoreTypeCreateInput({
            branchId: branch.id,
            storeTypeId: storeType.id,
            currentUser,
            status: targetStatus,
            isPrimary: payload.isPrimary ?? false,
            sortOrder: nextSortOrder,
            reason: nextReason,
          }),
          tx,
        );
      } else {
        await this.storeTypesRepository.updateBranchStoreType(
          branch.id,
          storeType.id,
          this.buildBranchStoreTypeUpdateInput({
            currentUser,
            status: targetStatus,
            isPrimary: payload.isPrimary ?? existingAssignment.isPrimary,
            sortOrder: nextSortOrder,
            reason: nextReason,
          }),
          tx,
        );
      }

      await this.syncBranchPrimaryStoreType(branch.id, tx);

      return this.requireBranchStoreType(branch.id, storeType.id, tx);
    });

    await this.auditService.logAction({
      actorType: AuditActorType.USER,
      actorUserId: currentUser.userId,
      actorRole: currentUser.role,
      actionSource: AuditActionSource.API,
      action: 'branch_store_types.assigned',
      resourceType: AuditResourceType.BRANCH_STORE_TYPE,
      resourceId: `${branchId}:${payload.storeTypeId}`,
      resourceLabel: assignment.storeType.name,
      branchId,
      metadataJson: {
        status: assignment.status,
        isPrimary: assignment.isPrimary,
        reason: assignment.reason,
      },
    });

    return toBranchStoreTypeDto(assignment);
  }

  async approveBranchStoreType(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    storeTypeId: string,
    payload: AdminBranchStoreTypeActionDto,
  ): Promise<BranchStoreTypeDto> {
    return this.updateBranchStoreTypeLifecycle(
      currentUser,
      branchId,
      storeTypeId,
      BranchStoreTypeStatus.APPROVED,
      payload,
      'branch_store_types.approved',
    );
  }

  async rejectBranchStoreType(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    storeTypeId: string,
    payload: AdminBranchStoreTypeActionDto,
  ): Promise<BranchStoreTypeDto> {
    return this.updateBranchStoreTypeLifecycle(
      currentUser,
      branchId,
      storeTypeId,
      BranchStoreTypeStatus.REJECTED,
      payload,
      'branch_store_types.rejected',
    );
  }

  async hideBranchStoreType(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    storeTypeId: string,
    payload: AdminBranchStoreTypeActionDto,
  ): Promise<BranchStoreTypeDto> {
    return this.updateBranchStoreTypeLifecycle(
      currentUser,
      branchId,
      storeTypeId,
      BranchStoreTypeStatus.HIDDEN,
      payload,
      'branch_store_types.hidden',
    );
  }

  async unhideBranchStoreType(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    storeTypeId: string,
    payload: AdminBranchStoreTypeActionDto,
  ): Promise<BranchStoreTypeDto> {
    return this.updateBranchStoreTypeLifecycle(
      currentUser,
      branchId,
      storeTypeId,
      BranchStoreTypeStatus.APPROVED,
      payload,
      'branch_store_types.unhidden',
    );
  }

  private async updateBranchStoreTypeLifecycle(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    storeTypeId: string,
    status: BranchStoreTypeStatus,
    payload: AdminBranchStoreTypeActionDto,
    auditAction: string,
  ): Promise<BranchStoreTypeDto> {
    this.assertCanManageStoreTypes(currentUser);
    this.assertPrimaryCompatible(status, payload.isPrimary);

    const assignment = await this.prisma.runInTransaction(async (tx) => {
      const existingAssignment = await this.requireBranchStoreType(
        branchId,
        storeTypeId,
        tx,
      );

      if (status === BranchStoreTypeStatus.APPROVED) {
        this.assertStoreTypeCanBeActivated(
          existingAssignment.storeType.isActive,
          existingAssignment.storeType.name,
        );
      }

      await this.storeTypesRepository.updateBranchStoreType(
        branchId,
        storeTypeId,
        this.buildBranchStoreTypeUpdateInput({
          currentUser,
          status,
          isPrimary:
            status === BranchStoreTypeStatus.APPROVED
              ? payload.isPrimary ?? existingAssignment.isPrimary
              : false,
          sortOrder: payload.sortOrder ?? existingAssignment.sortOrder,
          reason:
            payload.reason !== undefined
              ? this.normalizeOptionalString(payload.reason)
              : existingAssignment.reason,
        }),
        tx,
      );

      await this.syncBranchPrimaryStoreType(branchId, tx);

      return this.requireBranchStoreType(branchId, storeTypeId, tx);
    });

    await this.auditService.logAction({
      actorType: AuditActorType.USER,
      actorUserId: currentUser.userId,
      actorRole: currentUser.role,
      actionSource: AuditActionSource.API,
      action: auditAction,
      resourceType: AuditResourceType.BRANCH_STORE_TYPE,
      resourceId: `${branchId}:${storeTypeId}`,
      resourceLabel: assignment.storeType.name,
      branchId,
      metadataJson: {
        status: assignment.status,
        isPrimary: assignment.isPrimary,
        reason: assignment.reason,
      },
    });

    return toBranchStoreTypeDto(assignment);
  }

  private async requireStoreType(
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

    return storeType;
  }

  private async requireBranch(
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

    return branch;
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
        'Branch store type assignment was not found.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    return assignment;
  }

  private assertCanManageStoreTypes(currentUser: AuthenticatedUserEntity) {
    if (!this.storeTypePolicyService.canManageStoreTypes(currentUser)) {
      throw new AppException(
        'You are not allowed to manage store types.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }
  }

  private assertPrimaryCompatible(
    status: BranchStoreTypeStatus,
    isPrimary?: boolean,
  ) {
    if (isPrimary === true && status !== BranchStoreTypeStatus.APPROVED) {
      throw new AppException(
        'Only approved branch store types can be marked as primary.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }
  }

  private assertStoreTypeCanBeActivated(isActive: boolean, storeTypeName: string) {
    if (!isActive) {
      throw new AppException(
        `Inactive store type "${storeTypeName}" cannot be approved for a branch.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }
  }

  private normalizeStoreTypeCode(code: string): string {
    return this.normalizeRequiredString(code, 'Store type code').toLowerCase();
  }

  private normalizeRequiredString(value: string, fieldName: string): string {
    const normalizedValue = value.trim();
    if (normalizedValue.length === 0) {
      throw new AppException(`${fieldName} is required.`, HttpStatus.BAD_REQUEST, {
        code: ErrorCodes.badRequest,
      });
    }

    return normalizedValue;
  }

  private normalizeOptionalString(value?: string | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalizedValue = value.trim();

    return normalizedValue.length > 0 ? normalizedValue : null;
  }

  private buildBranchStoreTypeCreateInput(input: {
    branchId: string;
    storeTypeId: string;
    currentUser: AuthenticatedUserEntity;
    status: BranchStoreTypeStatus;
    isPrimary: boolean;
    sortOrder: number;
    reason: string | null;
  }) {
    const now = new Date();

    return {
      branchId: input.branchId,
      storeTypeId: input.storeTypeId,
      status: input.status,
      isPrimary:
        input.status === BranchStoreTypeStatus.APPROVED && input.isPrimary,
      sortOrder: input.sortOrder,
      requestedByUserId: input.currentUser.userId,
      approvedByUserId:
        input.status === BranchStoreTypeStatus.APPROVED
          ? input.currentUser.userId
          : null,
      approvedAt:
        input.status === BranchStoreTypeStatus.APPROVED ? now : null,
      rejectedAt:
        input.status === BranchStoreTypeStatus.REJECTED ? now : null,
      hiddenAt: input.status === BranchStoreTypeStatus.HIDDEN ? now : null,
      reason: input.reason,
    };
  }

  private buildBranchStoreTypeUpdateInput(input: {
    currentUser: AuthenticatedUserEntity;
    status: BranchStoreTypeStatus;
    isPrimary: boolean;
    sortOrder: number;
    reason: string | null;
  }) {
    const now = new Date();

    return {
      status: input.status,
      isPrimary:
        input.status === BranchStoreTypeStatus.APPROVED && input.isPrimary,
      sortOrder: input.sortOrder,
      approvedByUserId:
        input.status === BranchStoreTypeStatus.APPROVED
          ? input.currentUser.userId
          : null,
      approvedAt:
        input.status === BranchStoreTypeStatus.APPROVED ? now : null,
      rejectedAt:
        input.status === BranchStoreTypeStatus.REJECTED ? now : null,
      hiddenAt: input.status === BranchStoreTypeStatus.HIDDEN ? now : null,
      reason: input.reason,
    };
  }

  private async syncBranchPrimaryStoreType(
    branchId: string,
    client: Parameters<StoreTypesRepository['listApprovedBranchStoreTypes']>[1],
  ) {
    const approvedAssignments =
      await this.storeTypesRepository.listApprovedBranchStoreTypes(branchId, client);

    const primaryAssignment =
      approvedAssignments.find((assignment) => assignment.isPrimary) ??
      approvedAssignments[0] ??
      null;

    await this.storeTypesRepository.clearBranchPrimaryAssignments(branchId, client);

    if (primaryAssignment !== null) {
      await this.storeTypesRepository.updateBranchStoreType(
        branchId,
        primaryAssignment.storeType.id,
        {
          isPrimary: true,
        },
        client,
      );

      await this.storeTypesRepository.updateBranchPrimaryStoreType(
        branchId,
        {
          primaryStoreTypeId: primaryAssignment.storeType.id,
          storeType: primaryAssignment.storeType.code,
        },
        client,
      );

      return;
    }

    await this.storeTypesRepository.updateBranchPrimaryStoreType(
      branchId,
      {
        primaryStoreTypeId: null,
      },
      client,
    );
  }
}

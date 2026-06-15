import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AuditActionSource,
  AuditActorType,
  AuditResourceType,
  Prisma,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { BranchOwnershipRecord } from '../../branches/entities/branch-ownership.entity';
import { BranchesService } from '../../branches/services/branches.service';
import { CreateMenuCategoryDto } from '../dto/create-menu-category.dto';
import { MenuCategoryDto, toMenuCategoryDto } from '../dto/menu-category.dto';
import { UpdateMenuCategoryDto } from '../dto/update-menu-category.dto';
import { MenuCategoryOwnershipRecord } from '../entities/menu-category-ownership.entity';
import { MenuCategoryPolicyService } from '../policies/menu-category-policy.service';
import { MenusRepository } from '../repositories/menus.repository';
import { MenusService } from './menus.service';

@Injectable()
export class MerchantMenuCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchesService: BranchesService,
    private readonly menusService: MenusService,
    private readonly menusRepository: MenusRepository,
    private readonly menuCategoryPolicyService: MenuCategoryPolicyService,
    private readonly auditService: AuditService,
  ) {}

  async listBranchCategories(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<MenuCategoryDto[]> {
    const branch = await this.resolveOwnedBranch(currentUser, branchId);
    const categories = await this.menusService.listCategoriesByBranchId(branch.id);

    return categories.map((category) => toMenuCategoryDto(category));
  }

  async getBranchCategory(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    categoryId: string,
  ): Promise<MenuCategoryDto> {
    const category = await this.resolveOwnedCategory(
      currentUser,
      branchId,
      categoryId,
    );

    return toMenuCategoryDto(category);
  }

  async createBranchCategory(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    payload: CreateMenuCategoryDto,
  ): Promise<MenuCategoryDto> {
    const branch = await this.resolveOwnedBranch(currentUser, branchId);

    const category = await this.prisma.runInTransaction(async (tx) => {
      const nextSortOrder =
        payload.sortOrder ??
        ((await this.menusRepository.findHighestCategorySortOrderByBranchId(
          branch.id,
          tx,
        ))?.sortOrder ?? -1) + 1;
      const scopedStoreTypeIds = await this.resolveScopedStoreTypeIds(
        branch.id,
        payload.storeTypeIds,
        tx,
      );

      const createdCategory = await this.menusRepository.createCategory(
        {
          branchId: branch.id,
          name: payload.name,
          description: payload.description,
          sortOrder: nextSortOrder,
          isActive: payload.isActive ?? true,
        },
        tx,
      );

      await this.menusRepository.replaceCategoryStoreTypes(
        createdCategory.id,
        scopedStoreTypeIds,
        tx,
      );

      return this.menusRepository.findCategoryById(createdCategory.id, tx);
    });

    if (category === null) {
      throw new AppException(
        'Created menu category could not be reloaded.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          code: ErrorCodes.internalServerError,
        },
      );
    }

    await this.auditService.logAction({
      actorType: AuditActorType.USER,
      actorUserId: currentUser.userId,
      actorRole: currentUser.role,
      actionSource: AuditActionSource.API,
      action: 'menu_categories.scope_created',
      resourceType: AuditResourceType.MENU_CATEGORY,
      resourceId: category.id,
      resourceLabel: category.name,
      branchId: branch.id,
      metadataJson: {
        afterScope: this.buildScopeSnapshot(category.storeTypes),
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      },
    });

    return toMenuCategoryDto(category);
  }

  async updateBranchCategory(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    categoryId: string,
    payload: UpdateMenuCategoryDto,
  ): Promise<MenuCategoryDto> {
    const category = await this.resolveOwnedCategory(
      currentUser,
      branchId,
      categoryId,
    );

    const updatedCategory = await this.prisma.runInTransaction(async (tx) => {
      const nextCategory = await this.menusRepository.updateCategory(
        category.id,
        {
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.description !== undefined
            ? { description: payload.description }
            : {}),
          ...(payload.sortOrder !== undefined
            ? { sortOrder: payload.sortOrder }
            : {}),
          ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        },
        tx,
      );

      if (payload.storeTypeIds !== undefined) {
        const scopedStoreTypeIds = await this.resolveScopedStoreTypeIds(
          branchId,
          payload.storeTypeIds,
          tx,
        );

        await this.menusRepository.replaceCategoryStoreTypes(
          category.id,
          scopedStoreTypeIds,
          tx,
        );

        return this.menusRepository.findCategoryById(nextCategory.id, tx);
      }

      return nextCategory;
    });

    if (updatedCategory === null) {
      throw new AppException(
        'Updated menu category could not be reloaded.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          code: ErrorCodes.internalServerError,
        },
      );
    }

    if (payload.storeTypeIds !== undefined) {
      await this.auditService.logAction({
        actorType: AuditActorType.USER,
        actorUserId: currentUser.userId,
        actorRole: currentUser.role,
        actionSource: AuditActionSource.API,
        action: 'menu_categories.scope_updated',
        resourceType: AuditResourceType.MENU_CATEGORY,
        resourceId: updatedCategory.id,
        resourceLabel: updatedCategory.name,
        branchId: updatedCategory.branch.id,
        metadataJson: {
          beforeScope: this.buildScopeSnapshot(category.storeTypes),
          afterScope: this.buildScopeSnapshot(updatedCategory.storeTypes),
          isActive: updatedCategory.isActive,
          sortOrder: updatedCategory.sortOrder,
        },
      });
    }

    return toMenuCategoryDto(updatedCategory);
  }

  async deleteBranchCategory(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    categoryId: string,
  ): Promise<void> {
    const category = await this.resolveOwnedCategory(
      currentUser,
      branchId,
      categoryId,
    );
    await this.menusRepository.deleteCategory(category.id);
  }

  private buildScopeSnapshot(
    storeTypes: MenuCategoryOwnershipRecord['storeTypes'],
  ): Prisma.InputJsonValue {
    return {
      scopeMode: this.toScopeMode(storeTypes.length),
      storeTypeIds: storeTypes.map((assignment) => assignment.storeType.id),
      storeTypeCodes: storeTypes.map((assignment) => assignment.storeType.code),
    };
  }

  private toScopeMode(storeTypeCount: number): string {
    return storeTypeCount === 0
      ? 'ALL_APPROVED_STORE_TYPES'
      : 'SELECTED_STORE_TYPES';
  }

  private async resolveScopedStoreTypeIds(
    branchId: string,
    storeTypeIds: string[] | undefined,
    client: Prisma.TransactionClient,
  ): Promise<string[]> {
    const normalizedStoreTypeIds = this.normalizeStoreTypeIds(storeTypeIds);

    if (normalizedStoreTypeIds.length === 0) {
      return [];
    }

    const approvedStoreTypes =
      await this.menusRepository.listApprovedStoreTypesByBranchId(branchId, client);
    const approvedStoreTypeIdSet = new Set(
      approvedStoreTypes.map((assignment) => assignment.storeType.id),
    );

    const invalidStoreTypeIds = normalizedStoreTypeIds.filter(
      (storeTypeId) => !approvedStoreTypeIdSet.has(storeTypeId),
    );

    if (invalidStoreTypeIds.length > 0) {
      throw new AppException(
        'Category storeTypeIds must belong to approved active store types for the branch.',
        HttpStatus.BAD_REQUEST,
        {
          code: ErrorCodes.validationFailed,
          details: {
            branchId,
            invalidStoreTypeIds,
          },
        },
      );
    }

    return normalizedStoreTypeIds;
  }

  private normalizeStoreTypeIds(storeTypeIds?: string[]): string[] {
    if (storeTypeIds === undefined) {
      return [];
    }

    const normalizedValues = storeTypeIds
      .map((storeTypeId) => storeTypeId.trim())
      .filter((storeTypeId) => storeTypeId.length > 0);

    return [...new Set(normalizedValues)];
  }

  private async resolveOwnedBranch(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<BranchOwnershipRecord> {
    const branch = await this.branchesService.findOwnedByUserId(
      currentUser.userId,
      branchId,
    );

    if (branch === null) {
      throw new AppException('Branch was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (!this.menuCategoryPolicyService.canManageBranchCatalog(currentUser, branch)) {
      throw new AppException(
        'You are not allowed to manage categories for this branch.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return branch;
  }

  private async resolveOwnedCategory(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    categoryId: string,
  ): Promise<MenuCategoryOwnershipRecord> {
    const category = await this.menusService.findCategoryOwnedByUserId(
      currentUser.userId,
      categoryId,
    );

    if (category === null || category.branch.id !== branchId) {
      throw new AppException(
        'Menu category was not found for the requested branch.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    if (!this.menuCategoryPolicyService.canManageCategory(currentUser, category)) {
      throw new AppException(
        'You are not allowed to manage this menu category.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return category;
  }
}

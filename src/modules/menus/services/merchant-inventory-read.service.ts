import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuditService } from '../../audit/services/audit.service';
import { BranchOwnershipRecord } from '../../branches/entities/branch-ownership.entity';
import { BranchesService } from '../../branches/services/branches.service';
import { toMerchantInventoryAdjustmentDto } from '../dto/merchant-inventory-adjustment.dto';
import {
  MerchantInventoryAttentionLevel,
  MerchantInventoryOverviewDto,
} from '../dto/merchant-inventory-overview.dto';
import { MerchantRestockSuggestionsDto } from '../dto/merchant-restock-suggestions.dto';
import { MenusService } from './menus.service';

@Injectable()
export class MerchantInventoryReadService {
  constructor(
    private readonly branchesService: BranchesService,
    private readonly menusService: MenusService,
    private readonly auditService: AuditService,
  ) {}

  async getOwnedBranchInventoryOverview(
    userId: string,
    branchId: string,
  ): Promise<MerchantInventoryOverviewDto> {
    const branch = await this.resolveOwnedBranch(userId, branchId);
    const [items, options] = await Promise.all([
      this.menusService.listItemsByBranchId(branch.id),
      this.menusService.listOptionsByBranchId(branch.id),
    ]);
    const itemEntities = items.map((item) => this.menusService.buildItemOwnership(item));
    const optionEntities = options.map((option) =>
      this.menusService.buildOptionOwnership(option),
    );

    const trackedItems = itemEntities.filter((item) => item.isStockTracked);
    const trackedOptions = optionEntities.filter((option) => option.isStockTracked);
    const attentionItems = trackedItems
      .filter((item) => this.resolveAttentionLevel(item.isInStock, item.isLowStock) !== null)
      .map((item) => ({
        itemId: item.itemId,
        categoryId: item.categoryId ?? null,
        categoryName:
          items.find((candidate) => candidate.id === item.itemId)?.category?.name ?? null,
        name: item.name,
        sku: item.sku ?? null,
        stockQuantity: item.stockQuantity ?? null,
        lowStockThreshold: item.lowStockThreshold ?? null,
        attentionLevel: this.resolveAttentionLevel(item.isInStock, item.isLowStock)!,
      }));
    const attentionOptions = trackedOptions
      .filter(
        (option) =>
          this.resolveAttentionLevel(
            option.isInStock,
            option.isLowStock,
          ) !== null,
      )
      .map((option) => ({
        optionId: option.optionId,
        optionGroupId: option.optionGroupId,
        optionGroupName:
          options.find((candidate) => candidate.id === option.optionId)?.group.name ??
          option.optionGroupId,
        menuItemId: option.menuItemId,
        menuItemName:
          options.find((candidate) => candidate.id === option.optionId)?.group.menuItem.name ??
          option.menuItemId,
        name: option.name,
        stockQuantity: option.stockQuantity ?? null,
        lowStockThreshold: option.lowStockThreshold ?? null,
        attentionLevel: this.resolveAttentionLevel(option.isInStock, option.isLowStock)!,
      }));

    return {
      branchId: branch.id,
      branchName: branch.name,
      township: branch.township,
      totals: {
        trackedItemCount: trackedItems.length,
        lowStockItemCount: trackedItems.filter(
          (item) => item.isInStock && item.isLowStock,
        ).length,
        outOfStockItemCount: trackedItems.filter((item) => !item.isInStock).length,
        trackedOptionCount: trackedOptions.length,
        lowStockOptionCount: trackedOptions.filter(
          (option) => option.isInStock && option.isLowStock,
        ).length,
        outOfStockOptionCount: trackedOptions.filter((option) => !option.isInStock).length,
      },
      attentionItems,
      attentionOptions,
    };
  }

  async listOwnedBranchInventoryAdjustments(
    userId: string,
    branchId: string,
    limit: number,
  ) {
    await this.resolveOwnedBranch(userId, branchId);

    const logs = await this.auditService.listBranchInventoryAdjustmentLogs(
      branchId,
      limit,
    );

    return logs.map((log) => toMerchantInventoryAdjustmentDto(log));
  }

  async getOwnedBranchRestockSuggestions(
    userId: string,
    branchId: string,
  ): Promise<MerchantRestockSuggestionsDto> {
    const branch = await this.resolveOwnedBranch(userId, branchId);
    const [items, options, logs] = await Promise.all([
      this.menusService.listItemsByBranchId(branch.id),
      this.menusService.listOptionsByBranchId(branch.id),
      this.auditService.listBranchInventoryAdjustmentLogs(branch.id, 200),
    ]);
    const itemEntities = items.map((item) => this.menusService.buildItemOwnership(item));
    const optionEntities = options.map((option) =>
      this.menusService.buildOptionOwnership(option),
    );
    const latestAdjustments = new Map(
      logs.map((log) => [
        `${log.resourceType}:${log.resourceId}`,
        {
          createdAt: log.createdAt,
          reasonCode:
            this.readMetadataString(log.metadata, 'reasonCode') ?? null,
        },
      ]),
    );

    const itemSuggestions = itemEntities
      .filter((item) => item.isStockTracked)
      .map((item) => ({
        item,
        attentionLevel: this.resolveAttentionLevel(item.isInStock, item.isLowStock),
      }))
      .filter(
        (
          candidate,
        ): candidate is {
          item: ReturnType<MenusService['buildItemOwnership']>;
          attentionLevel: MerchantInventoryAttentionLevel;
        } => candidate.attentionLevel !== null,
      )
      .map(({ item, attentionLevel }) => {
        const currentStockQuantity = item.stockQuantity ?? 0;
        const targetStockQuantity = this.buildTargetStockQuantity(
          currentStockQuantity,
          item.lowStockThreshold,
          attentionLevel,
        );
        const latestAdjustment =
          latestAdjustments.get(`MENU_ITEM:${item.itemId}`) ?? null;

        return {
          itemId: item.itemId,
          categoryId: item.categoryId ?? null,
          categoryName:
            items.find((candidate) => candidate.id === item.itemId)?.category?.name ??
            null,
          name: item.name,
          sku: item.sku ?? null,
          currentStockQuantity: item.stockQuantity ?? null,
          lowStockThreshold: item.lowStockThreshold ?? null,
          targetStockQuantity,
          suggestedRestockQuantity: Math.max(
            targetStockQuantity - currentStockQuantity,
            1,
          ),
          attentionLevel,
          lastAdjustedAt: latestAdjustment?.createdAt ?? null,
          lastAdjustmentReasonCode: latestAdjustment?.reasonCode ?? null,
        };
      });
    const optionSuggestions = optionEntities
      .filter((option) => option.isStockTracked)
      .map((option) => ({
        option,
        attentionLevel: this.resolveAttentionLevel(
          option.isInStock,
          option.isLowStock,
        ),
      }))
      .filter(
        (
          candidate,
        ): candidate is {
          option: ReturnType<MenusService['buildOptionOwnership']>;
          attentionLevel: MerchantInventoryAttentionLevel;
        } => candidate.attentionLevel !== null,
      )
      .map(({ option, attentionLevel }) => {
        const currentStockQuantity = option.stockQuantity ?? 0;
        const targetStockQuantity = this.buildTargetStockQuantity(
          currentStockQuantity,
          option.lowStockThreshold,
          attentionLevel,
        );
        const optionRecord = options.find((candidate) => candidate.id === option.optionId);
        const latestAdjustment =
          latestAdjustments.get(`ITEM_OPTION:${option.optionId}`) ?? null;

        return {
          optionId: option.optionId,
          optionGroupId: option.optionGroupId,
          optionGroupName: optionRecord?.group.name ?? option.optionGroupId,
          menuItemId: option.menuItemId,
          menuItemName: optionRecord?.group.menuItem.name ?? option.menuItemId,
          name: option.name,
          currentStockQuantity: option.stockQuantity ?? null,
          lowStockThreshold: option.lowStockThreshold ?? null,
          targetStockQuantity,
          suggestedRestockQuantity: Math.max(
            targetStockQuantity - currentStockQuantity,
            1,
          ),
          attentionLevel,
          lastAdjustedAt: latestAdjustment?.createdAt ?? null,
          lastAdjustmentReasonCode: latestAdjustment?.reasonCode ?? null,
        };
      });

    return {
      branchId: branch.id,
      branchName: branch.name,
      generatedAt: new Date().toISOString(),
      summary: {
        itemSuggestionCount: itemSuggestions.length,
        optionSuggestionCount: optionSuggestions.length,
        totalSuggestionCount: itemSuggestions.length + optionSuggestions.length,
      },
      itemSuggestions,
      optionSuggestions,
    };
  }

  private async resolveOwnedBranch(
    userId: string,
    branchId: string,
  ): Promise<BranchOwnershipRecord> {
    const branch = await this.branchesService.findOwnedByUserId(userId, branchId);

    if (branch === null) {
      throw new AppException('Branch was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    return branch;
  }

  private resolveAttentionLevel(
    isInStock: boolean,
    isLowStock: boolean,
  ): MerchantInventoryAttentionLevel | null {
    if (!isInStock) {
      return MerchantInventoryAttentionLevel.OUT_OF_STOCK;
    }

    if (isLowStock) {
      return MerchantInventoryAttentionLevel.LOW_STOCK;
    }

    return null;
  }

  private buildTargetStockQuantity(
    currentStockQuantity: number,
    lowStockThreshold: number | null | undefined,
    attentionLevel: MerchantInventoryAttentionLevel,
  ): number {
    if (lowStockThreshold !== null && lowStockThreshold !== undefined) {
      return Math.max(lowStockThreshold * 2, currentStockQuantity + 1, 1);
    }

    return attentionLevel === MerchantInventoryAttentionLevel.OUT_OF_STOCK
      ? Math.max(currentStockQuantity + 1, 1)
      : Math.max(currentStockQuantity + 2, 2);
  }

  private readMetadataString(
    metadata: unknown,
    key: string,
  ): string | null {
    if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return null;
    }

    const value = (metadata as Record<string, unknown>)[key];

    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }
}

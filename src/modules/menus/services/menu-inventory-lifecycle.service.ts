import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ItemOptionOwnershipRecord } from '../entities/item-option-ownership.entity';
import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
import { MenusRepository } from '../repositories/menus.repository';

type MenuInventoryDatabaseClient = PrismaService | Prisma.TransactionClient;

export type MenuInventoryOrderLineInput = {
  lineKey?: string;
  menuItemId: string;
  quantity: number;
  menuItemStockTrackedSnapshot: boolean;
  selectedVariantCombinationId?: string | null;
  variantCombinationStockTrackedSnapshot?: boolean;
  inventoryLotAllocations?: Array<{
    inventoryLotId: string;
    batchNoSnapshot: string;
    expiryDateSnapshot: string | null;
    quantity: number;
  }>;
  selectedOptions: Array<{
    itemOptionId: string;
    itemOptionStockTrackedSnapshot: boolean;
  }>;
};

export type MenuInventoryLotAllocation = {
  inventoryLotId: string;
  batchNoSnapshot: string;
  expiryDateSnapshot: string | null;
  quantity: number;
};

export type MenuInventoryAlertEvent = {
  merchantUserId: string;
  branchId: string;
  branchName: string | null;
  resourceType: 'MENU_ITEM' | 'ITEM_OPTION';
  resourceId: string;
  resourceLabel: string;
  attentionLevel: 'LOW_STOCK' | 'OUT_OF_STOCK';
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  menuItemName?: string | null;
};

export type MenuInventoryCompensationEvent = {
  merchantUserId: string;
  branchId: string;
  branchName: string | null;
  resourceType: 'MENU_ITEM' | 'ITEM_OPTION';
  resourceId: string;
  resourceLabel: string;
  restoredQuantity: number;
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  menuItemName?: string | null;
};

export type MenuInventoryReservationResult = {
  alerts: MenuInventoryAlertEvent[];
  inventoryLotAllocationsByLineKey: Record<string, MenuInventoryLotAllocation[]>;
};

@Injectable()
export class MenuInventoryLifecycleService {
  constructor(private readonly menusRepository: MenusRepository) {}

  async reserveTrackedInventoryForOrder(
    items: MenuInventoryOrderLineInput[],
    client?: MenuInventoryDatabaseClient,
  ): Promise<MenuInventoryReservationResult> {
    const alerts = new Map<string, MenuInventoryAlertEvent>();
    const inventoryLotAllocationsByLineKey: Record<
      string,
      MenuInventoryLotAllocation[]
    > = {};

    for (const item of items) {
      if (item.menuItemStockTrackedSnapshot) {
        const previousItem = await this.menusRepository.findItemById(
          item.menuItemId,
          client,
        );
        const usesInventoryLots =
          (await this.menusRepository.countItemInventoryLotsByMenuItemId(
            item.menuItemId,
            client,
          )) > 0;

        if (usesInventoryLots) {
          const lotAllocations = await this.reserveTrackedInventoryLots(
            item.menuItemId,
            item.quantity,
            client,
          );

          if (item.lineKey !== undefined && lotAllocations.length > 0) {
            inventoryLotAllocationsByLineKey[item.lineKey] = lotAllocations;
          }
        }

        const wasReserved = await this.menusRepository.decrementTrackedItemStock(
          item.menuItemId,
          item.quantity,
          client,
        );

        if (!wasReserved) {
          throw new AppException(
            'The requested item is no longer available in the requested quantity.',
            HttpStatus.CONFLICT,
            {
              code: ErrorCodes.conflict,
              details: {
                menuItemId: item.menuItemId,
                requestedQuantity: item.quantity,
              },
            },
          );
        }

        const nextItem = await this.menusRepository.findItemById(item.menuItemId, client);
        const nextAlert = this.buildItemAlertEvent(previousItem, nextItem);

        if (nextAlert !== null) {
          alerts.set(`MENU_ITEM:${nextAlert.resourceId}`, nextAlert);
        }
      }

      if (
        item.variantCombinationStockTrackedSnapshot === true &&
        item.selectedVariantCombinationId !== undefined &&
        item.selectedVariantCombinationId !== null
      ) {
        const wasReserved =
          await this.menusRepository.decrementTrackedVariantCombinationStock(
            item.selectedVariantCombinationId,
            item.quantity,
            client,
          );

        if (!wasReserved) {
          throw new AppException(
            'The selected variant combination is no longer available in the requested quantity.',
            HttpStatus.CONFLICT,
            {
              code: ErrorCodes.conflict,
              details: {
                combinationId: item.selectedVariantCombinationId,
                requestedQuantity: item.quantity,
              },
            },
          );
        }
      }

      for (const selectedOption of item.selectedOptions) {
        if (!selectedOption.itemOptionStockTrackedSnapshot) {
          continue;
        }

        const previousOption = await this.menusRepository.findOptionById(
          selectedOption.itemOptionId,
          client,
        );
        const wasReserved =
          await this.menusRepository.decrementTrackedOptionStock(
            selectedOption.itemOptionId,
            item.quantity,
            client,
          );

        if (!wasReserved) {
          throw new AppException(
            'One of the selected options is no longer available in the requested quantity.',
            HttpStatus.CONFLICT,
            {
              code: ErrorCodes.conflict,
              details: {
                itemOptionId: selectedOption.itemOptionId,
                requestedQuantity: item.quantity,
              },
            },
          );
        }

        const nextOption = await this.menusRepository.findOptionById(
          selectedOption.itemOptionId,
          client,
        );
        const nextAlert = this.buildOptionAlertEvent(previousOption, nextOption);

        if (nextAlert !== null) {
          alerts.set(`ITEM_OPTION:${nextAlert.resourceId}`, nextAlert);
        }
      }
    }

    return {
      alerts: [...alerts.values()],
      inventoryLotAllocationsByLineKey,
    };
  }

  async restoreTrackedInventoryForOrder(
    items: MenuInventoryOrderLineInput[],
    client?: MenuInventoryDatabaseClient,
  ): Promise<void> {
    for (const item of items) {
      if (item.menuItemStockTrackedSnapshot) {
        await this.menusRepository.incrementItemStock(
          item.menuItemId,
          item.quantity,
          client,
        );

        for (const allocation of item.inventoryLotAllocations ?? []) {
          await this.menusRepository.incrementItemInventoryLotRemainingQuantity(
            allocation.inventoryLotId,
            allocation.quantity,
            client,
          );
        }
      }

      if (
        item.variantCombinationStockTrackedSnapshot === true &&
        item.selectedVariantCombinationId !== undefined &&
        item.selectedVariantCombinationId !== null
      ) {
        await this.menusRepository.incrementVariantCombinationStock(
          item.selectedVariantCombinationId,
          item.quantity,
          client,
        );
      }

      for (const selectedOption of item.selectedOptions) {
        if (!selectedOption.itemOptionStockTrackedSnapshot) {
          continue;
        }

        await this.menusRepository.incrementOptionStock(
          selectedOption.itemOptionId,
          item.quantity,
          client,
        );
      }
    }
  }

  async collectTrackedInventoryRestorationAlerts(
    items: MenuInventoryOrderLineInput[],
    client?: MenuInventoryDatabaseClient,
  ): Promise<MenuInventoryCompensationEvent[]> {
    const itemQuantityById = new Map<string, number>();
    const optionQuantityById = new Map<string, number>();

    for (const item of items) {
      if (item.menuItemStockTrackedSnapshot) {
        this.accumulateQuantity(itemQuantityById, item.menuItemId, item.quantity);
      }

      for (const selectedOption of item.selectedOptions) {
        if (!selectedOption.itemOptionStockTrackedSnapshot) {
          continue;
        }

        this.accumulateQuantity(
          optionQuantityById,
          selectedOption.itemOptionId,
          item.quantity,
        );
      }
    }

    const alerts: MenuInventoryCompensationEvent[] = [];

    for (const [menuItemId, restoredQuantity] of itemQuantityById.entries()) {
      const item = await this.menusRepository.findItemById(menuItemId, client);
      const alert = this.buildItemCompensationEvent(item, restoredQuantity);

      if (alert !== null) {
        alerts.push(alert);
      }
    }

    for (const [itemOptionId, restoredQuantity] of optionQuantityById.entries()) {
      const option = await this.menusRepository.findOptionById(itemOptionId, client);
      const alert = this.buildOptionCompensationEvent(option, restoredQuantity);

      if (alert !== null) {
        alerts.push(alert);
      }
    }

    return alerts;
  }

  private async reserveTrackedInventoryLots(
    menuItemId: string,
    quantity: number,
    client?: MenuInventoryDatabaseClient,
  ): Promise<MenuInventoryLotAllocation[]> {
    const lots = await this.menusRepository.listItemInventoryLotsByMenuItemId(
      menuItemId,
      client,
    );
    const availableLots = [...lots]
      .filter((lot) => lot.remainingQuantity > 0)
      .sort(
        (left, right) =>
          this.compareOptionalDates(left.expiryDate, right.expiryDate) ||
          left.receivedAt.getTime() - right.receivedAt.getTime() ||
          left.createdAt.getTime() - right.createdAt.getTime() ||
          left.id.localeCompare(right.id),
      );
    const availableQuantity = availableLots.reduce(
      (total, lot) => total + lot.remainingQuantity,
      0,
    );

    if (availableQuantity < quantity) {
      throw new AppException(
        'The requested item is no longer available in the requested quantity across its remaining inventory lots.',
        HttpStatus.CONFLICT,
        {
          code: ErrorCodes.conflict,
          details: {
            menuItemId,
            requestedQuantity: quantity,
            availableLotQuantity: availableQuantity,
          },
        },
      );
    }

    const allocations: MenuInventoryLotAllocation[] = [];
    let remainingQuantity = quantity;

    for (const lot of availableLots) {
      if (remainingQuantity <= 0) {
        break;
      }

      const allocatedQuantity = Math.min(lot.remainingQuantity, remainingQuantity);
      const reserved = await this.menusRepository.decrementItemInventoryLotQuantity(
        lot.id,
        allocatedQuantity,
        client,
      );

      if (!reserved) {
        throw new AppException(
          'The requested inventory lot is no longer available in the requested quantity.',
          HttpStatus.CONFLICT,
          {
            code: ErrorCodes.conflict,
            details: {
              menuItemId,
              lotId: lot.id,
              requestedQuantity: allocatedQuantity,
            },
          },
        );
      }

      allocations.push({
        inventoryLotId: lot.id,
        batchNoSnapshot: lot.batchNo,
        expiryDateSnapshot: lot.expiryDate?.toISOString() ?? null,
        quantity: allocatedQuantity,
      });
      remainingQuantity -= allocatedQuantity;
    }

    return allocations;
  }

  private compareOptionalDates(
    left: Date | null,
    right: Date | null,
  ): number {
    if (left === null && right === null) {
      return 0;
    }

    if (left === null) {
      return 1;
    }

    if (right === null) {
      return -1;
    }

    return left.getTime() - right.getTime();
  }

  private buildItemAlertEvent(
    previousItem: MenuItemOwnershipRecord | null,
    nextItem: MenuItemOwnershipRecord | null,
  ): MenuInventoryAlertEvent | null {
    if (previousItem === null || nextItem === null) {
      return null;
    }

    const previousAttentionLevel = this.resolveItemAttentionLevel(previousItem);
    const nextAttentionLevel = this.resolveItemAttentionLevel(nextItem);

    if (
      nextAttentionLevel === null ||
      !this.shouldEmitAlert(previousAttentionLevel, nextAttentionLevel)
    ) {
      return null;
    }

    return {
      merchantUserId: nextItem.branch.merchant.user.id,
      branchId: nextItem.branch.id,
      branchName: null,
      resourceType: 'MENU_ITEM',
      resourceId: nextItem.id,
      resourceLabel: nextItem.name,
      attentionLevel: nextAttentionLevel,
      stockQuantity: nextItem.stockQuantity ?? null,
      lowStockThreshold: nextItem.lowStockThreshold ?? null,
    };
  }

  private buildOptionAlertEvent(
    previousOption: ItemOptionOwnershipRecord | null,
    nextOption: ItemOptionOwnershipRecord | null,
  ): MenuInventoryAlertEvent | null {
    if (previousOption === null || nextOption === null) {
      return null;
    }

    const previousAttentionLevel = this.resolveOptionAttentionLevel(previousOption);
    const nextAttentionLevel = this.resolveOptionAttentionLevel(nextOption);

    if (
      nextAttentionLevel === null ||
      !this.shouldEmitAlert(previousAttentionLevel, nextAttentionLevel)
    ) {
      return null;
    }

    return {
      merchantUserId: nextOption.group.menuItem.branch.merchant.user.id,
      branchId: nextOption.group.menuItem.branch.id,
      branchName: null,
      resourceType: 'ITEM_OPTION',
      resourceId: nextOption.id,
      resourceLabel: nextOption.name,
      attentionLevel: nextAttentionLevel,
      stockQuantity: nextOption.stockQuantity ?? null,
      lowStockThreshold: nextOption.lowStockThreshold ?? null,
      menuItemName: nextOption.group.menuItem.name,
    };
  }

  private buildItemCompensationEvent(
    item: MenuItemOwnershipRecord | null,
    restoredQuantity: number,
  ): MenuInventoryCompensationEvent | null {
    if (item === null || restoredQuantity <= 0) {
      return null;
    }

    return {
      merchantUserId: item.branch.merchant.user.id,
      branchId: item.branch.id,
      branchName: null,
      resourceType: 'MENU_ITEM',
      resourceId: item.id,
      resourceLabel: item.name,
      restoredQuantity,
      stockQuantity: item.stockQuantity ?? null,
      lowStockThreshold: item.lowStockThreshold ?? null,
    };
  }

  private buildOptionCompensationEvent(
    option: ItemOptionOwnershipRecord | null,
    restoredQuantity: number,
  ): MenuInventoryCompensationEvent | null {
    if (option === null || restoredQuantity <= 0) {
      return null;
    }

    return {
      merchantUserId: option.group.menuItem.branch.merchant.user.id,
      branchId: option.group.menuItem.branch.id,
      branchName: null,
      resourceType: 'ITEM_OPTION',
      resourceId: option.id,
      resourceLabel: option.name,
      restoredQuantity,
      stockQuantity: option.stockQuantity ?? null,
      lowStockThreshold: option.lowStockThreshold ?? null,
      menuItemName: option.group.menuItem.name,
    };
  }

  private accumulateQuantity(
    quantities: Map<string, number>,
    resourceId: string,
    quantity: number,
  ): void {
    quantities.set(resourceId, (quantities.get(resourceId) ?? 0) + quantity);
  }

  private shouldEmitAlert(
    previousAttentionLevel: 'LOW_STOCK' | 'OUT_OF_STOCK' | null,
    nextAttentionLevel: 'LOW_STOCK' | 'OUT_OF_STOCK',
  ): boolean {
    return (
      previousAttentionLevel === null ||
      (previousAttentionLevel === 'LOW_STOCK' &&
        nextAttentionLevel === 'OUT_OF_STOCK')
    );
  }

  private resolveItemAttentionLevel(
    item: MenuItemOwnershipRecord,
  ): 'LOW_STOCK' | 'OUT_OF_STOCK' | null {
    if (!item.isStockTracked) {
      return null;
    }

    if ((item.stockQuantity ?? 0) <= 0) {
      return 'OUT_OF_STOCK';
    }

    if (
      item.lowStockThreshold !== null &&
      item.lowStockThreshold !== undefined &&
      item.stockQuantity !== null &&
      item.stockQuantity <= item.lowStockThreshold
    ) {
      return 'LOW_STOCK';
    }

    return null;
  }

  private resolveOptionAttentionLevel(
    option: ItemOptionOwnershipRecord,
  ): 'LOW_STOCK' | 'OUT_OF_STOCK' | null {
    if (!option.isStockTracked) {
      return null;
    }

    if ((option.stockQuantity ?? 0) <= 0) {
      return 'OUT_OF_STOCK';
    }

    if (
      option.lowStockThreshold !== null &&
      option.lowStockThreshold !== undefined &&
      option.stockQuantity !== null &&
      option.stockQuantity <= option.lowStockThreshold
    ) {
      return 'LOW_STOCK';
    }

    return null;
  }
}

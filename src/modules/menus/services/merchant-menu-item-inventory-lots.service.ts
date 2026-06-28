import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AuditActionSource,
  AuditActorType,
  AuditResourceType,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';
import { CreateItemInventoryLotDto } from '../dto/create-item-inventory-lot.dto';
import {
  ItemInventoryLotDto,
  toItemInventoryLotDto,
} from '../dto/item-inventory-lot.dto';
import { UpdateItemInventoryLotDto } from '../dto/update-item-inventory-lot.dto';
import { MenuItemInventoryLotRecord } from '../entities/menu-item-inventory-lot.entity';
import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
import { MenusRepository } from '../repositories/menus.repository';
import { MenuCacheService } from './menu-cache.service';
import { MenusService } from './menus.service';

@Injectable()
export class MerchantMenuItemInventoryLotsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly menusService: MenusService,
    private readonly menusRepository: MenusRepository,
    private readonly auditService: AuditService,
    private readonly notificationEventService: NotificationEventService,
    private readonly menuCache: MenuCacheService,
  ) {}

  async listItemInventoryLots(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
  ): Promise<ItemInventoryLotDto[]> {
    const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
    const lots = await this.menusService.listItemInventoryLotsByMenuItemId(item.id);

    return lots.map((lot) => toItemInventoryLotDto(lot));
  }

  async createItemInventoryLot(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    payload: CreateItemInventoryLotDto,
  ): Promise<ItemInventoryLotDto> {
    const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
    this.assertStockTrackingEnabled(item);
    const batchNo = this.requireBatchNo(payload.batchNo);
    const note = this.normalizeOptionalString(payload.note);

    const createdLot = await this.prisma.runInTransaction(async (tx) => {
      const existingLotCount =
        await this.menusRepository.countItemInventoryLotsByMenuItemId(item.id, tx);

      if (existingLotCount === 0 && (item.stockQuantity ?? 0) > 0) {
        throw new AppException(
          'The first inventory lot can only be created when the item aggregate stock is zero. Reset or consume the direct stock first, then bootstrap lots.',
          HttpStatus.CONFLICT,
          {
            code: ErrorCodes.conflict,
            details: {
              itemId: item.id,
              currentStockQuantity: item.stockQuantity ?? 0,
            },
          },
        );
      }

      const existingLot =
        await this.menusRepository.findItemInventoryLotByMenuItemIdAndBatchNo(
          item.id,
          batchNo,
          tx,
        );

      if (existingLot !== null) {
        throw new AppException(
          'An inventory lot with the same batch number already exists for this item.',
          HttpStatus.CONFLICT,
          {
            code: ErrorCodes.conflict,
            details: {
              itemId: item.id,
              batchNo,
            },
          },
        );
      }

      const lot = await this.menusRepository.createItemInventoryLot(
        {
          menuItemId: item.id,
          batchNo,
          expiryDate: this.toOptionalDate(payload.expiryDate),
          receivedAt: this.toOptionalDate(payload.receivedAt) ?? new Date(),
          receivedQuantity: payload.quantity,
          remainingQuantity: payload.quantity,
          note,
        },
        tx,
      );

      await this.menusRepository.incrementItemStock(item.id, payload.quantity, tx);

      return lot;
    });

    await this.auditService.logAction({
      actorType: AuditActorType.USER,
      actorUserId: currentUser.userId,
      actorRole: currentUser.role,
      actionSource: AuditActionSource.API,
      action: 'menu_items.inventory_lot_created',
      resourceType: AuditResourceType.MENU_ITEM,
      resourceId: item.id,
      resourceLabel: item.name,
      branchId: item.branch.id,
      metadataJson: {
        lotId: createdLot.id,
        batchNo: createdLot.batchNo,
        expiryDate: createdLot.expiryDate?.toISOString() ?? null,
        receivedQuantity: createdLot.receivedQuantity,
        remainingQuantity: createdLot.remainingQuantity,
        note,
      },
    });

    void this.menuCache.invalidate(branchId);

    return toItemInventoryLotDto(createdLot);
  }

  async updateItemInventoryLot(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    lotId: string,
    payload: UpdateItemInventoryLotDto,
  ): Promise<ItemInventoryLotDto> {
    const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
    const lot = await this.resolveOwnedLot(item.id, lotId);
    const batchNo =
      payload.batchNo !== undefined ? this.requireBatchNo(payload.batchNo) : undefined;
    const note =
      payload.note !== undefined ? this.normalizeOptionalString(payload.note) : undefined;

    const updatedLot = await this.prisma.runInTransaction(async (tx) => {
      if (batchNo !== undefined && batchNo !== lot.batchNo) {
        const existingLot =
          await this.menusRepository.findItemInventoryLotByMenuItemIdAndBatchNo(
            item.id,
            batchNo,
            tx,
          );

        if (existingLot !== null && existingLot.id !== lot.id) {
          throw new AppException(
            'An inventory lot with the same batch number already exists for this item.',
            HttpStatus.CONFLICT,
            {
              code: ErrorCodes.conflict,
              details: {
                itemId: item.id,
                batchNo,
              },
            },
          );
        }
      }

      return this.menusRepository.updateItemInventoryLot(
        lot.id,
        {
          ...(batchNo !== undefined ? { batchNo } : {}),
          ...(payload.expiryDate !== undefined
            ? { expiryDate: this.toOptionalDate(payload.expiryDate) }
            : {}),
          ...(payload.receivedAt !== undefined
            ? { receivedAt: this.toDateOrUndefined(payload.receivedAt) }
            : {}),
          ...(note !== undefined ? { note } : {}),
        },
        tx,
      );
    });

    await this.auditService.logAction({
      actorType: AuditActorType.USER,
      actorUserId: currentUser.userId,
      actorRole: currentUser.role,
      actionSource: AuditActionSource.API,
      action: 'menu_items.inventory_lot_updated',
      resourceType: AuditResourceType.MENU_ITEM,
      resourceId: item.id,
      resourceLabel: item.name,
      branchId: item.branch.id,
      metadataJson: {
        lotId: updatedLot.id,
        batchNo: updatedLot.batchNo,
        expiryDate: updatedLot.expiryDate?.toISOString() ?? null,
        receivedAt: updatedLot.receivedAt.toISOString(),
        note: updatedLot.note ?? null,
      },
    });

    void this.menuCache.invalidate(branchId);

    return toItemInventoryLotDto(updatedLot);
  }

  async adjustItemInventoryLot(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    lotId: string,
    payload: AdjustInventoryDto,
  ): Promise<ItemInventoryLotDto> {
    const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
    const lot = await this.resolveOwnedLot(item.id, lotId);
    this.assertStockTrackingEnabled(item);
    const reasonCode = this.requireReasonCode(payload.reasonCode);
    const note = this.normalizeOptionalString(payload.note);

    const { updatedLot, updatedItem } = await this.prisma.runInTransaction(async (tx) => {
      const adjustedLot = await this.menusRepository.adjustItemInventoryLotQuantity(
        lot.id,
        payload.delta,
        tx,
      );

      if (!adjustedLot) {
        throw new AppException(
          'The requested lot adjustment would make the remaining quantity invalid.',
          HttpStatus.CONFLICT,
          {
            code: ErrorCodes.conflict,
            details: {
              itemId: item.id,
              lotId: lot.id,
              requestedDelta: payload.delta,
              currentRemainingQuantity: lot.remainingQuantity,
            },
          },
        );
      }

      const adjustedItem = await this.menusRepository.adjustTrackedItemStock(
        item.id,
        payload.delta,
        tx,
      );

      if (!adjustedItem) {
        throw new AppException(
          'The requested lot adjustment would make the aggregate stock quantity invalid.',
          HttpStatus.CONFLICT,
          {
            code: ErrorCodes.conflict,
            details: {
              itemId: item.id,
              lotId: lot.id,
              requestedDelta: payload.delta,
              currentStockQuantity: item.stockQuantity ?? 0,
            },
          },
        );
      }

      const [nextLot, nextItem] = await Promise.all([
        this.menusRepository.findItemInventoryLotById(lot.id, tx),
        this.menusRepository.findItemById(item.id, tx),
      ]);

      if (nextLot === null || nextItem === null) {
        throw new AppException(
          'The adjusted inventory lot could not be reloaded.',
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            code: ErrorCodes.internalServerError,
          },
        );
      }

      return {
        updatedLot: nextLot,
        updatedItem: nextItem,
      };
    });

    await this.auditService.logAction({
      actorType: AuditActorType.USER,
      actorUserId: currentUser.userId,
      actorRole: currentUser.role,
      actionSource: AuditActionSource.API,
      action: 'menu_items.inventory_lot_adjusted',
      resourceType: AuditResourceType.MENU_ITEM,
      resourceId: item.id,
      resourceLabel: item.name,
      branchId: item.branch.id,
      metadataJson: {
        lotId: updatedLot.id,
        delta: payload.delta,
        reasonCode,
        note,
        batchNo: updatedLot.batchNo,
        beforeRemainingQuantity: lot.remainingQuantity,
        afterRemainingQuantity: updatedLot.remainingQuantity,
        beforeStockQuantity: item.stockQuantity,
        afterStockQuantity: updatedItem.stockQuantity,
      },
    });

    await this.publishInventoryAlertIfNeeded(item, updatedItem);

    void this.menuCache.invalidate(branchId);

    return toItemInventoryLotDto(updatedLot);
  }

  async hasItemInventoryLots(itemId: string): Promise<boolean> {
    return (await this.menusRepository.countItemInventoryLotsByMenuItemId(itemId)) > 0;
  }

  private async resolveOwnedItem(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
  ): Promise<MenuItemOwnershipRecord> {
    const item = await this.menusService.findItemOwnedByUserId(
      currentUser.userId,
      itemId,
    );

    if (item === null || item.branch.id !== branchId) {
      throw new AppException(
        'Menu item was not found for the requested branch.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    return item;
  }

  private async resolveOwnedLot(
    menuItemId: string,
    lotId: string,
  ): Promise<MenuItemInventoryLotRecord> {
    const lot = await this.menusService.findItemInventoryLotById(lotId);

    if (lot === null || lot.menuItem.id !== menuItemId) {
      throw new AppException(
        'Inventory lot was not found for the requested menu item.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    return lot;
  }

  private assertStockTrackingEnabled(item: MenuItemOwnershipRecord): void {
    if (item.isStockTracked) {
      return;
    }

    throw new AppException(
      'Inventory lots require stock tracking to be enabled for the menu item.',
      HttpStatus.CONFLICT,
      {
        code: ErrorCodes.conflict,
      },
    );
  }

  private requireBatchNo(batchNo: string): string {
    const normalized = batchNo.trim();

    if (normalized.length === 0) {
      throw new AppException(
        'batchNo is required for inventory lots.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    return normalized;
  }

  private requireReasonCode(reasonCode: string): string {
    const normalized = this.normalizeOptionalString(reasonCode);

    if (normalized === null) {
      throw new AppException(
        'A reason code is required for inventory adjustments.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    return normalized;
  }

  private normalizeOptionalString(value: string | undefined | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalized = value.trim();

    return normalized.length === 0 ? null : normalized;
  }

  private toOptionalDate(value: string | undefined): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.trim();

    return normalized.length === 0 ? null : new Date(normalized);
  }

  private toDateOrUndefined(value: string | undefined): Date | undefined {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.trim();

    return normalized.length === 0 ? undefined : new Date(normalized);
  }

  private async publishInventoryAlertIfNeeded(
    previousItem: MenuItemOwnershipRecord,
    nextItem: MenuItemOwnershipRecord,
  ): Promise<void> {
    const previousAttentionLevel = this.resolveInventoryAttentionLevel(previousItem);
    const nextAttentionLevel = this.resolveInventoryAttentionLevel(nextItem);

    if (nextAttentionLevel === null) {
      return;
    }

    const shouldNotify =
      previousAttentionLevel === null ||
      (previousAttentionLevel === 'LOW_STOCK' &&
        nextAttentionLevel === 'OUT_OF_STOCK');

    if (!shouldNotify) {
      return;
    }

    await this.notificationEventService.publishMerchantInventoryAlert({
      merchantUserId: nextItem.branch.merchant.user.id,
      branchId: nextItem.branch.id,
      branchName: null,
      resourceType: 'MENU_ITEM',
      resourceId: nextItem.id,
      resourceLabel: nextItem.name,
      attentionLevel: nextAttentionLevel,
      stockQuantity: nextItem.stockQuantity ?? null,
      lowStockThreshold: nextItem.lowStockThreshold ?? null,
    });
  }

  private resolveInventoryAttentionLevel(
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
}

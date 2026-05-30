import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationType,
  Prisma,
} from '@prisma/client';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuditService } from '../../audit/services/audit.service';
import {
  AdminInventoryAlertKind,
  AdminInventoryAlertStatus,
} from '../dto/admin-inventory-alert.dto';
import { BulkMarkInventoryAlertsReadDto } from '../dto/bulk-mark-inventory-alerts-read.dto';
import { BulkMarkInventoryAlertsReadResponseDto } from '../dto/bulk-mark-inventory-alerts-read-response.dto';
import {
  ListNotificationsQueryDto,
} from '../dto/list-notifications-query.dto';
import {
  notificationPageCacheTtlSeconds,
  notificationPageDefaultLimit,
  notificationPagePollIntervalSeconds,
  notificationPresetCacheTtlSeconds,
  notificationPresetLabels,
  notificationPresetOrder,
} from '../constants/notification-contract.constants';
import type { NotificationPresetFilter } from '../constants/notification-contract.constants';
import { readAdminInventoryAlertMetadata } from '../entities/admin-inventory-alert-notification.entity';
import {
  buildNotificationContractEntity,
  NotificationContractEntity,
} from '../entities/notification-contract.entity';
import {
  buildNotificationCenterEntity,
  NotificationCenterEntity,
  NotificationCenterRecord,
  NotificationInventoryAlertEntity,
} from '../entities/notification-center.entity';
import {
  buildNotificationCenterPage,
  NotificationCenterPageEntity,
} from '../entities/notification-center-page.entity';
import {
  NotificationListPresetEntity,
} from '../entities/notification-list-preset.entity';
import { NotificationUnreadFacetsEntity } from '../entities/notification-unread-facets.entity';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationDeliveryService } from './notification-delivery.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly auditService: AuditService,
    private readonly notificationDeliveryService: NotificationDeliveryService,
  ) {}

  async listUserNotifications(
    userId: string,
    query: ListNotificationsQueryDto = {},
  ): Promise<NotificationCenterEntity[]> {
    const page = await this.listUserNotificationPage(userId, query);

    return page.notifications;
  }

  async listUserNotificationPage(
    userId: string,
    query: ListNotificationsQueryDto = {},
  ): Promise<NotificationCenterPageEntity> {
    const normalizedQuery = this.applyPreset(query);
    const limit = normalizedQuery.limit ?? notificationPageDefaultLimit;
    const fetchLimit = this.resolveFetchLimit(limit, normalizedQuery);
    const records = await this.collectMatchingNotifications(userId, normalizedQuery, {
      fetchLimit,
      targetMatchCount: limit + 1,
    });
    const hasMore = records.length > limit;
    const notifications = hasMore ? records.slice(0, limit) : records;

    return buildNotificationCenterPage({
      nextCursor: hasMore
        ? notifications[notifications.length - 1]?.notificationId ?? null
        : null,
      hasMore,
      appliedPreset: normalizedQuery.preset ?? null,
      generatedAt: new Date().toISOString(),
      cacheTtlSeconds: notificationPageCacheTtlSeconds,
      suggestedPollIntervalSeconds: notificationPagePollIntervalSeconds,
      notifications,
    });
  }

  getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.countUnreadByUserId(userId);
  }

  async getUnreadFacets(userId: string): Promise<NotificationUnreadFacetsEntity> {
    const [totalUnreadCount, unreadInventoryAlerts] = await Promise.all([
      this.notificationsRepository.countUnreadByUserId(userId),
      this.notificationsRepository.listUnreadInventoryAlertsByUserId(userId),
    ]);
    const unreadInventoryNotifications =
      await this.buildNotificationCenterEntities(unreadInventoryAlerts);
    const inventoryAlerts = unreadInventoryNotifications
      .map((notification) => notification.inventoryAlert)
      .filter(
        (inventoryAlert): inventoryAlert is NotificationInventoryAlertEntity =>
          inventoryAlert !== null,
      );

    return {
      totalUnreadCount,
      inventoryAlertUnreadCount: inventoryAlerts.length,
      unreadAttentionAlertCount: inventoryAlerts.filter(
        (alert) => alert.alertKind === AdminInventoryAlertKind.ATTENTION,
      ).length,
      unreadCompensationAlertCount: inventoryAlerts.filter(
        (alert) => alert.alertKind === AdminInventoryAlertKind.COMPENSATION,
      ).length,
      unreadOpenInventoryAlertCount: inventoryAlerts.filter(
        (alert) => alert.status === AdminInventoryAlertStatus.OPEN,
      ).length,
      unreadAcknowledgedInventoryAlertCount: inventoryAlerts.filter(
        (alert) => alert.status === AdminInventoryAlertStatus.ACKNOWLEDGED,
      ).length,
      unreadResolvedInventoryAlertCount: inventoryAlerts.filter(
        (alert) => alert.status === AdminInventoryAlertStatus.RESOLVED,
      ).length,
      unreadDismissedInventoryAlertCount: inventoryAlerts.filter(
        (alert) => alert.status === AdminInventoryAlertStatus.DISMISSED,
      ).length,
      unreadLowStockAlertCount: inventoryAlerts.filter(
        (alert) => alert.attentionLevel === 'LOW_STOCK',
      ).length,
      unreadOutOfStockAlertCount: inventoryAlerts.filter(
        (alert) => alert.attentionLevel === 'OUT_OF_STOCK',
      ).length,
    };
  }

  async listNotificationPresets(
    userId: string,
  ): Promise<NotificationListPresetEntity[]> {
    const facets = await this.getUnreadFacets(userId);

    return this.buildNotificationPresetsFromFacets(facets);
  }

  getNotificationContract(): NotificationContractEntity {
    return buildNotificationContractEntity();
  }

  async bulkMarkInventoryAlertsRead(
    userId: string,
    payload: BulkMarkInventoryAlertsReadDto,
  ): Promise<BulkMarkInventoryAlertsReadResponseDto> {
    const explicitNotificationIds = this.normalizeNotificationIds(
      payload.notificationIds,
    );
    let notificationIdsToMark: string[] = [];
    let markedCount = 0;

    if (explicitNotificationIds.length > 0) {
      const inventoryAlerts =
        await this.notificationsRepository.findInventoryAlertsByIdsForUser(
          userId,
          explicitNotificationIds,
        );
      const validInventoryAlerts = inventoryAlerts.filter(
        (notification) => readAdminInventoryAlertMetadata(notification) !== null,
      );

      if (validInventoryAlerts.length !== explicitNotificationIds.length) {
        throw new AppException(
          'Inventory alert notification was not found.',
          HttpStatus.NOT_FOUND,
          {
            code: ErrorCodes.notFound,
          },
        );
      }

      notificationIdsToMark = validInventoryAlerts.map(
        (notification) => notification.id,
      );
      markedCount = validInventoryAlerts.filter(
        (notification) => notification.readAt === null,
      ).length;
    } else {
      if (payload.markAllMatching !== true) {
        throw new AppException(
          'Provide notificationIds or set markAllMatching to true.',
          HttpStatus.BAD_REQUEST,
          {
            code: ErrorCodes.badRequest,
          },
        );
      }

      const matchingInventoryAlerts = await this.listUserNotificationPage(userId, {
        limit: payload.limit ?? 100,
        type: NotificationType.SYSTEM_ALERT,
        unreadOnly: true,
        keyword: payload.keyword,
        inventoryAlertKind: payload.inventoryAlertKind,
        inventoryAlertStatus: payload.inventoryAlertStatus,
        inventoryResourceType: payload.inventoryResourceType,
        inventoryAttentionLevel: payload.inventoryAttentionLevel,
        branchId: payload.branchId,
      });

      notificationIdsToMark = matchingInventoryAlerts.notifications
        .filter((notification) => notification.inventoryAlert !== null)
        .map((notification) => notification.notificationId);
      markedCount = notificationIdsToMark.length;
    }

    if (notificationIdsToMark.length === 0) {
      return {
        markedCount: 0,
        notifications: [],
      };
    }

    const updatedNotifications = await this.notificationsRepository.markManyRead(
      notificationIdsToMark,
      userId,
    );
    const notificationEntities =
      await this.buildNotificationCenterEntities(updatedNotifications);

    if (markedCount > 0) {
      this.notificationDeliveryService.emitNotificationBulkRead(userId, {
        markedCount,
        notifications: notificationEntities,
      });
      await this.emitLiveUnreadState(userId);
    }

    return {
      markedCount,
      notifications: notificationEntities,
    };
  }

  async hasRecentMerchantInventoryAlert(input: {
    userId: string;
    resourceType: 'MENU_ITEM' | 'ITEM_OPTION';
    resourceId: string;
    attentionLevel: 'LOW_STOCK' | 'OUT_OF_STOCK';
    since: Date;
  }): Promise<boolean> {
    const notifications =
      await this.notificationsRepository.listRecentInventoryAlertsByUserIdSince(
        input.userId,
        input.since,
      );
    const inventoryAlerts = notifications
      .map((notification) => ({
        notification,
        metadata: readAdminInventoryAlertMetadata(notification),
      }))
      .filter(
        (
          alert,
        ): alert is {
          notification: (typeof notifications)[number];
          metadata: NonNullable<ReturnType<typeof readAdminInventoryAlertMetadata>>;
        } => alert.metadata !== null,
      );
    const matchingNotifications = inventoryAlerts.filter(({ metadata }) => {
      return (
        metadata.alertKind === 'ATTENTION' &&
        metadata.resourceType === input.resourceType &&
        metadata.resourceId === input.resourceId &&
        metadata.attentionLevel === input.attentionLevel
      );
    });

    if (matchingNotifications.length === 0) {
      return false;
    }

    const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs(
      matchingNotifications.map(({ notification }) => notification.id),
    );
    const latestLifecycleByNotificationId =
      this.buildLatestLifecycleLogMap(lifecycleLogs);

    return matchingNotifications.some(({ notification, metadata }) => {
      const status = this.resolveInventoryAlertStatus(
        latestLifecycleByNotificationId.get(notification.id) ?? null,
      );

      if (status === AdminInventoryAlertStatus.RESOLVED) {
        return false;
      }

      if (
        status === AdminInventoryAlertStatus.DISMISSED &&
        this.hasLaterCompensationAlert(
          inventoryAlerts,
          metadata.resourceType,
          metadata.resourceId,
          notification.createdAt,
        )
      ) {
        return false;
      }

      return true;
    });
  }

  async createNotification(payload: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    navigationPath?: string | null;
    metadataJson?: Prisma.InputJsonValue;
    orderId?: string | null;
    deliveryId?: string | null;
    conversationId?: string | null;
    messageId?: string | null;
  }): Promise<NotificationCenterEntity> {
    const notification = await this.notificationsRepository.create(payload);
    const entity = await this.buildNotificationEntity(notification);

    this.notificationDeliveryService.emitNotificationCreated(entity);
    await this.emitLiveUnreadState(entity.userId);

    return entity;
  }

  async markNotificationRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationCenterEntity | null> {
    const notification = await this.notificationsRepository.markRead(
      notificationId,
      userId,
    );

    if (notification === null) {
      return null;
    }

    const entity = await this.buildNotificationEntity(notification);
    this.notificationDeliveryService.emitNotificationRead(entity);
    await this.emitLiveUnreadState(userId);

    return entity;
  }

  createDeliveryAttempt(payload: {
    notificationId: string;
    channel: NotificationChannel;
    status?: NotificationDeliveryStatus;
    providerMessageId?: string | null;
    failureCode?: string | null;
    failureMessage?: string | null;
    queuedAt?: Date | null;
    sentAt?: Date | null;
    deliveredAt?: Date | null;
  }) {
    return this.notificationsRepository.createDeliveryAttempt(payload);
  }

  markQueuedPushDeliveriesSent(
    notificationId: string,
    providerMessageId: string,
  ) {
    return this.notificationsRepository.markQueuedPushDeliveriesSent(
      notificationId,
      providerMessageId,
    );
  }

  markQueuedPushDeliveriesFailed(
    notificationId: string,
    failureCode: string,
    failureMessage: string,
  ) {
    return this.notificationsRepository.markQueuedPushDeliveriesFailed(
      notificationId,
      failureCode,
      failureMessage,
    );
  }

  getPushNotificationDispatch(notificationId: string) {
    return this.notificationsRepository.findPushNotificationDispatchById(
      notificationId,
    );
  }

  deletePushTokensByIds(userId: string, pushTokenIds: string[]) {
    return this.notificationsRepository.deletePushTokensByIds(
      userId,
      pushTokenIds,
    );
  }

  private async buildNotificationEntity(
    notification: NotificationCenterRecord,
  ): Promise<NotificationCenterEntity> {
    const [entity] = await this.buildNotificationCenterEntities([notification]);

    return entity;
  }

  private buildNotificationPresetsFromFacets(
    facets: NotificationUnreadFacetsEntity,
  ): NotificationListPresetEntity[] {
    return notificationPresetOrder.map((presetKey, index) =>
      this.buildPreset(
        presetKey,
        this.resolvePresetUnreadCount(presetKey, facets),
        index,
      ),
    );
  }

  private async emitLiveUnreadState(userId: string): Promise<void> {
    const facets = await this.getUnreadFacets(userId);
    this.notificationDeliveryService.emitUnreadCountUpdated(userId, {
      unreadCount: facets.totalUnreadCount,
    });
    this.notificationDeliveryService.emitUnreadFacetsUpdated(userId, facets);
    this.notificationDeliveryService.emitNotificationPresetsUpdated(
      userId,
      this.buildNotificationPresetsFromFacets(facets),
    );
  }

  private async collectMatchingNotifications(
    userId: string,
    query: ListNotificationsQueryDto,
    input: {
      fetchLimit: number;
      targetMatchCount: number;
    },
  ): Promise<NotificationCenterEntity[]> {
    const matched: NotificationCenterEntity[] = [];
    let cursor = query.cursor;
    let hasMore = true;

    while (hasMore && matched.length < input.targetMatchCount) {
      const page = await this.notificationsRepository.listPageByUserId({
        userId,
        limit: input.fetchLimit,
        type:
          query.type ??
          (this.hasInventoryAlertFilters(query)
            ? NotificationType.SYSTEM_ALERT
            : undefined),
        unreadOnly: query.unreadOnly ?? false,
        cursor,
      });
      const notifications = await this.buildNotificationCenterEntities(page.records);

      matched.push(
        ...notifications.filter((notification) => this.matchesQuery(notification, query)),
      );
      hasMore = page.hasMore;
      cursor = page.nextCursor ?? undefined;
    }

    return matched;
  }

  private async buildNotificationCenterEntities(
    notifications: NotificationCenterRecord[],
  ): Promise<NotificationCenterEntity[]> {
    const inventoryAlertCandidates = notifications
      .map((notification) => ({
        notificationId: notification.id,
        metadata: readAdminInventoryAlertMetadata(notification),
      }))
      .filter(
        (
          candidate,
        ): candidate is {
          notificationId: string;
          metadata: NonNullable<ReturnType<typeof readAdminInventoryAlertMetadata>>;
        } => candidate.metadata !== null,
      );
    const inventoryAlertNotificationIds = inventoryAlertCandidates.map(
      ({ notificationId }) => notificationId,
    );
    const acknowledgements =
      await this.auditService.listInventoryAlertAcknowledgementLogs(
        inventoryAlertNotificationIds,
      );
    const latestAcknowledgementByNotificationId =
      this.buildLatestLifecycleLogMap(acknowledgements);
    const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs(
      inventoryAlertNotificationIds,
    );
    const latestLifecycleByNotificationId =
      this.buildLatestLifecycleLogMap(lifecycleLogs);
    const inventoryAlertMetadataByNotificationId = new Map(
      inventoryAlertCandidates.map((candidate) => [
        candidate.notificationId,
        candidate.metadata,
      ]),
    );

    return notifications.map((notification) =>
      buildNotificationCenterEntity(
        notification,
        this.buildInventoryAlertEntity(
          inventoryAlertMetadataByNotificationId.get(notification.id) ?? null,
          latestAcknowledgementByNotificationId.get(notification.id) ?? null,
          latestLifecycleByNotificationId.get(notification.id) ?? null,
        ),
      ),
    );
  }

  private applyPreset(query: ListNotificationsQueryDto): ListNotificationsQueryDto {
    if (query.preset === undefined || query.preset === 'ALL') {
      return query;
    }

    const presetDefaults: Partial<ListNotificationsQueryDto> = {};

    switch (query.preset) {
      case 'UNREAD':
        presetDefaults.unreadOnly = true;
        break;
      case 'INVENTORY_OPEN':
        presetDefaults.type = NotificationType.SYSTEM_ALERT;
        presetDefaults.inventoryAlertKind = 'ATTENTION';
        presetDefaults.inventoryAlertStatus = 'OPEN';
        break;
      case 'INVENTORY_RESOLVED':
        presetDefaults.type = NotificationType.SYSTEM_ALERT;
        presetDefaults.inventoryAlertStatus = 'RESOLVED';
        break;
      case 'INVENTORY_COMPENSATION':
        presetDefaults.type = NotificationType.SYSTEM_ALERT;
        presetDefaults.inventoryAlertKind = 'COMPENSATION';
        break;
      case 'INVENTORY_ATTENTION':
        presetDefaults.type = NotificationType.SYSTEM_ALERT;
        presetDefaults.inventoryAlertKind = 'ATTENTION';
        break;
      case 'INVENTORY_LOW_STOCK':
        presetDefaults.type = NotificationType.SYSTEM_ALERT;
        presetDefaults.inventoryAlertKind = 'ATTENTION';
        presetDefaults.inventoryAttentionLevel = 'LOW_STOCK';
        break;
      case 'INVENTORY_OUT_OF_STOCK':
        presetDefaults.type = NotificationType.SYSTEM_ALERT;
        presetDefaults.inventoryAlertKind = 'ATTENTION';
        presetDefaults.inventoryAttentionLevel = 'OUT_OF_STOCK';
        break;
      default:
        break;
    }

    return {
      ...presetDefaults,
      ...query,
      preset: query.preset,
    };
  }

  private resolveFetchLimit(
    limit: number,
    query: ListNotificationsQueryDto,
  ): number {
    if (
      this.hasInventoryAlertFilters(query) ||
      (query.keyword !== undefined && query.keyword.trim().length > 0) ||
      query.preset !== undefined
    ) {
      return Math.min(Math.max(limit * 5, 100), 500);
    }

    return limit;
  }

  private hasInventoryAlertFilters(query: ListNotificationsQueryDto): boolean {
    return (
      (query.inventoryAlertKind !== undefined &&
        query.inventoryAlertKind !== 'ALL') ||
      (query.inventoryAlertStatus !== undefined &&
        query.inventoryAlertStatus !== 'ALL') ||
      (query.inventoryResourceType !== undefined &&
        query.inventoryResourceType !== 'ALL') ||
      (query.inventoryAttentionLevel !== undefined &&
        query.inventoryAttentionLevel !== 'ALL') ||
      (query.branchId !== undefined && query.branchId.trim().length > 0)
    );
  }

  private matchesQuery(
    notification: NotificationCenterEntity,
    query: ListNotificationsQueryDto,
  ): boolean {
    const inventoryAlert = notification.inventoryAlert;

    if (this.hasInventoryAlertFilters(query) && inventoryAlert === null) {
      return false;
    }

    if (
      query.inventoryAlertKind !== undefined &&
      query.inventoryAlertKind !== 'ALL' &&
      inventoryAlert?.alertKind !== query.inventoryAlertKind
    ) {
      return false;
    }

    if (
      query.inventoryAlertStatus !== undefined &&
      query.inventoryAlertStatus !== 'ALL' &&
      inventoryAlert?.status !== query.inventoryAlertStatus
    ) {
      return false;
    }

    if (
      query.inventoryResourceType !== undefined &&
      query.inventoryResourceType !== 'ALL' &&
      inventoryAlert?.resourceType !== query.inventoryResourceType
    ) {
      return false;
    }

    if (
      query.inventoryAttentionLevel !== undefined &&
      query.inventoryAttentionLevel !== 'ALL' &&
      inventoryAlert?.attentionLevel !== query.inventoryAttentionLevel
    ) {
      return false;
    }

    if (query.branchId !== undefined && query.branchId.trim().length > 0) {
      if (inventoryAlert?.branchId !== query.branchId.trim()) {
        return false;
      }
    }

    if (query.keyword !== undefined && query.keyword.trim().length > 0) {
      const keyword = query.keyword.trim().toLowerCase();
      const haystacks = [
        notification.title,
        notification.body,
        notification.orderCode,
        notification.orderStatus,
        notification.conversationType,
        notification.messageType,
        inventoryAlert?.branchName,
        inventoryAlert?.resourceLabel,
        inventoryAlert?.menuItemName,
        inventoryAlert?.orderCode,
        inventoryAlert?.reasonCode,
        inventoryAlert?.attentionLevel,
        inventoryAlert?.alertKind,
        inventoryAlert?.status,
      ]
        .filter((value): value is string => value !== null)
        .map((value) => value.toLowerCase());

      if (!haystacks.some((value) => value.includes(keyword))) {
        return false;
      }
    }

    return true;
  }

  private buildInventoryAlertEntity(
    metadata: ReturnType<typeof readAdminInventoryAlertMetadata>,
    acknowledgement: Awaited<
      ReturnType<AuditService['listInventoryAlertAcknowledgementLogs']>
    >[number] | null,
    lifecycleLog: Awaited<
      ReturnType<AuditService['listInventoryAlertLifecycleLogs']>
    >[number] | null,
  ): NotificationInventoryAlertEntity | null {
    if (metadata === null) {
      return null;
    }

    return {
      alertKind:
        metadata.alertKind === 'COMPENSATION'
          ? AdminInventoryAlertKind.COMPENSATION
          : AdminInventoryAlertKind.ATTENTION,
      status: this.resolveInventoryAlertStatus(lifecycleLog),
      branchId: metadata.branchId,
      branchName: metadata.branchName,
      resourceType: metadata.resourceType,
      resourceId: metadata.resourceId,
      resourceLabel: metadata.resourceLabel,
      menuItemName: metadata.menuItemName,
      attentionLevel: metadata.attentionLevel,
      stockQuantity: metadata.stockQuantity,
      lowStockThreshold: metadata.lowStockThreshold,
      restoredQuantity: metadata.restoredQuantity,
      orderId: metadata.orderId,
      orderCode: metadata.orderCode,
      reasonCode: metadata.reasonCode,
      acknowledgementNote: this.readMetadataString(acknowledgement?.metadata, 'note'),
      acknowledgedAt: acknowledgement?.createdAt ?? null,
      statusNote: this.readMetadataString(lifecycleLog?.metadata, 'note'),
      statusChangedAt: lifecycleLog?.createdAt ?? null,
    };
  }

  private buildLatestLifecycleLogMap(
    logs: Awaited<
      | ReturnType<AuditService['listInventoryAlertAcknowledgementLogs']>
      | ReturnType<AuditService['listInventoryAlertLifecycleLogs']>
    >,
  ) {
    const latestLogsByNotificationId = new Map<string, (typeof logs)[number]>();

    for (const log of logs) {
      if (!latestLogsByNotificationId.has(log.resourceId)) {
        latestLogsByNotificationId.set(log.resourceId, log);
      }
    }

    return latestLogsByNotificationId;
  }

  private resolveInventoryAlertStatus(
    lifecycleLog: Awaited<
      ReturnType<AuditService['listInventoryAlertLifecycleLogs']>
    >[number] | null,
  ): AdminInventoryAlertStatus {
    switch (lifecycleLog?.action) {
      case 'inventory_alerts.dismissed':
        return AdminInventoryAlertStatus.DISMISSED;
      case 'inventory_alerts.resolved':
        return AdminInventoryAlertStatus.RESOLVED;
      case 'inventory_alerts.acknowledged':
        return AdminInventoryAlertStatus.ACKNOWLEDGED;
      default:
        return AdminInventoryAlertStatus.OPEN;
    }
  }

  private hasLaterCompensationAlert(
    inventoryAlerts: Array<{
      notification: NotificationCenterRecord | {
        id: string;
        createdAt: Date;
      };
      metadata: NonNullable<ReturnType<typeof readAdminInventoryAlertMetadata>>;
    }>,
    resourceType: 'MENU_ITEM' | 'ITEM_OPTION',
    resourceId: string,
    afterCreatedAt: Date,
  ): boolean {
    return inventoryAlerts.some(
      ({ notification, metadata }) =>
        metadata.alertKind === 'COMPENSATION' &&
        metadata.resourceType === resourceType &&
        metadata.resourceId === resourceId &&
        notification.createdAt > afterCreatedAt,
    );
  }

  private buildPreset(
    key: NotificationPresetFilter,
    unreadCount: number,
    sortOrder: number,
  ): NotificationListPresetEntity {
    const query = this.applyPreset({
      preset: key,
    });

    return {
      key,
      label: notificationPresetLabels[key],
      sortOrder,
      isDefault: key === 'ALL',
      cacheTtlSeconds: notificationPresetCacheTtlSeconds,
      unreadCount,
      query: {
        preset: key,
        unreadOnly: query.unreadOnly ?? null,
        type: query.type ?? null,
        inventoryAlertKind: query.inventoryAlertKind ?? null,
        inventoryAlertStatus: query.inventoryAlertStatus ?? null,
        inventoryResourceType: query.inventoryResourceType ?? null,
        inventoryAttentionLevel: query.inventoryAttentionLevel ?? null,
        branchId: query.branchId ?? null,
      },
    };
  }

  private resolvePresetUnreadCount(
    preset: NotificationPresetFilter,
    facets: NotificationUnreadFacetsEntity,
  ): number {
    switch (preset) {
      case 'ALL':
      case 'UNREAD':
        return facets.totalUnreadCount;
      case 'INVENTORY_OPEN':
        return facets.unreadOpenInventoryAlertCount;
      case 'INVENTORY_RESOLVED':
        return facets.unreadResolvedInventoryAlertCount;
      case 'INVENTORY_COMPENSATION':
        return facets.unreadCompensationAlertCount;
      case 'INVENTORY_ATTENTION':
        return facets.unreadAttentionAlertCount;
      case 'INVENTORY_LOW_STOCK':
        return facets.unreadLowStockAlertCount;
      case 'INVENTORY_OUT_OF_STOCK':
        return facets.unreadOutOfStockAlertCount;
      default:
        return facets.totalUnreadCount;
    }
  }

  private readMetadataString(metadata: unknown, key: string): string | null {
    if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return null;
    }

    const value = (metadata as Record<string, unknown>)[key];

    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }

  private normalizeNotificationIds(notificationIds?: string[]): string[] {
    if (notificationIds === undefined) {
      return [];
    }

    const normalizedIds = notificationIds
      .map((notificationId) => notificationId.trim())
      .filter((notificationId) => notificationId.length > 0);

    return [...new Set(normalizedIds)];
  }
}

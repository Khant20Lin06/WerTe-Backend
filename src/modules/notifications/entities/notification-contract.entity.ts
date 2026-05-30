import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

import { WebsocketEvents } from '../../../infrastructure/websocket/websocket-events';
import {
  notificationContractQueryExamples,
  notificationContractRestRoutes,
  notificationInventoryAlertAttentionLevelFilters,
  notificationInventoryAlertKindFilters,
  notificationInventoryAlertStatusFilters,
  notificationInventoryResourceTypeFilters,
  notificationPageCacheTtlSeconds,
  notificationPageDefaultLimit,
  notificationPageMaxLimit,
  notificationPagePollIntervalSeconds,
  notificationPresetCacheTtlSeconds,
  notificationPresetFilters,
  notificationPresetLabels,
  notificationPresetOrder,
} from '../constants/notification-contract.constants';

export class NotificationContractWebsocketEventsEntity {
  @ApiProperty({ example: '/notifications' })
  namespace!: string;

  @ApiProperty({ example: WebsocketEvents.notificationCreated })
  notificationCreated!: string;

  @ApiProperty({ example: WebsocketEvents.notificationRead })
  notificationRead!: string;

  @ApiProperty({ example: WebsocketEvents.notificationBulkRead })
  notificationBulkRead!: string;

  @ApiProperty({ example: WebsocketEvents.notificationUnreadCountUpdated })
  unreadCountUpdated!: string;

  @ApiProperty({ example: WebsocketEvents.notificationUnreadFacetsUpdated })
  unreadFacetsUpdated!: string;

  @ApiProperty({ example: WebsocketEvents.notificationPresetsUpdated })
  presetsUpdated!: string;

  @ApiProperty({ example: WebsocketEvents.notificationPreferenceUpdated })
  preferenceUpdated!: string;
}

export class NotificationContractRoutesEntity {
  @ApiProperty({ example: notificationContractRestRoutes.list })
  list!: string;

  @ApiProperty({ example: notificationContractRestRoutes.page })
  page!: string;

  @ApiProperty({ example: notificationContractRestRoutes.unreadCount })
  unreadCount!: string;

  @ApiProperty({ example: notificationContractRestRoutes.unreadFacets })
  unreadFacets!: string;

  @ApiProperty({ example: notificationContractRestRoutes.presets })
  presets!: string;

  @ApiProperty({ example: notificationContractRestRoutes.contract })
  contract!: string;

  @ApiProperty({ example: notificationContractRestRoutes.inventoryAlertPreferences })
  inventoryAlertPreferences!: string;

  @ApiProperty({ example: notificationContractRestRoutes.bulkInventoryAlertMarkRead })
  bulkInventoryAlertMarkRead!: string;

  @ApiProperty({ example: notificationContractRestRoutes.markReadTemplate })
  markReadTemplate!: string;
}

export class NotificationContractPresetDefinitionEntity {
  @ApiProperty({ example: 'ALL' })
  key!: string;

  @ApiProperty({ example: 'All notifications' })
  label!: string;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: true })
  isDefault!: boolean;
}

export class NotificationContractQueryCapabilitiesEntity {
  @ApiProperty({ enum: notificationPresetFilters, isArray: true })
  presets!: string[];

  @ApiProperty({ enum: notificationInventoryAlertKindFilters, isArray: true })
  inventoryAlertKinds!: string[];

  @ApiProperty({ enum: notificationInventoryAlertStatusFilters, isArray: true })
  inventoryAlertStatuses!: string[];

  @ApiProperty({ enum: notificationInventoryResourceTypeFilters, isArray: true })
  inventoryResourceTypes!: string[];

  @ApiProperty({
    enum: notificationInventoryAlertAttentionLevelFilters,
    isArray: true,
  })
  inventoryAttentionLevels!: string[];

  @ApiProperty({ enum: NotificationType, isArray: true })
  notificationTypes!: NotificationType[];
}

export class NotificationContractPageDefaultsEntity {
  @ApiProperty({ example: notificationPageDefaultLimit })
  defaultLimit!: number;

  @ApiProperty({ example: notificationPageMaxLimit })
  maxLimit!: number;

  @ApiProperty({ example: notificationPageCacheTtlSeconds })
  pageCacheTtlSeconds!: number;

  @ApiProperty({ example: notificationPagePollIntervalSeconds })
  suggestedPollIntervalSeconds!: number;

  @ApiProperty({ example: notificationPresetCacheTtlSeconds })
  presetCacheTtlSeconds!: number;
}

export class NotificationContractSamplesEntity {
  @ApiProperty({
    example: notificationContractQueryExamples.page,
  })
  pageQuery!: Record<string, unknown>;

  @ApiProperty({
    example: notificationContractQueryExamples.history,
  })
  historyQuery!: Record<string, unknown>;

  @ApiProperty({
    example: {
      unreadCount: 3,
    },
  })
  unreadCountPayload!: Record<string, unknown>;

  @ApiProperty({
    example: {
      totalUnreadCount: 5,
      inventoryAlertUnreadCount: 3,
      unreadAttentionAlertCount: 2,
      unreadCompensationAlertCount: 1,
      unreadOpenInventoryAlertCount: 2,
      unreadAcknowledgedInventoryAlertCount: 0,
      unreadResolvedInventoryAlertCount: 1,
      unreadDismissedInventoryAlertCount: 0,
      unreadLowStockAlertCount: 1,
      unreadOutOfStockAlertCount: 1,
    },
  })
  unreadFacetsPayload!: Record<string, unknown>;

  @ApiProperty({
    example: {
      userId: 'usr_merchant_1',
      inventoryAlertPushEnabled: true,
      inventoryAlertQuietHoursEnabled: true,
      inventoryAlertQuietHoursStartLocalTime: '22:00',
      inventoryAlertQuietHoursEndLocalTime: '06:00',
      inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
      inventoryAlertPushCurrentlyMuted: false,
      deliveryLanes: [
        {
          channel: 'IN_APP',
          enabled: true,
          active: true,
          suppressionReason: null,
        },
        {
          channel: 'PUSH',
          enabled: true,
          active: true,
          suppressionReason: null,
        },
      ],
      activeDeliveryChannels: ['IN_APP', 'PUSH'],
      inventoryAlertPushSuppressedReason: null,
    },
  })
  preferencePayload!: Record<string, unknown>;
}

export class NotificationContractEntity {
  @ApiProperty({ example: 'notification-contract.v1' })
  version!: string;

  @ApiProperty({ type: NotificationContractRoutesEntity })
  restRoutes!: NotificationContractRoutesEntity;

  @ApiProperty({ type: NotificationContractWebsocketEventsEntity })
  websocketEvents!: NotificationContractWebsocketEventsEntity;

  @ApiProperty({ type: NotificationContractPageDefaultsEntity })
  pageDefaults!: NotificationContractPageDefaultsEntity;

  @ApiProperty({ type: NotificationContractQueryCapabilitiesEntity })
  queryCapabilities!: NotificationContractQueryCapabilitiesEntity;

  @ApiProperty({
    type: NotificationContractPresetDefinitionEntity,
    isArray: true,
  })
  presets!: NotificationContractPresetDefinitionEntity[];

  @ApiProperty({ type: NotificationContractSamplesEntity })
  samples!: NotificationContractSamplesEntity;
}

export function buildNotificationContractEntity(): NotificationContractEntity {
  return {
    version: 'notification-contract.v1',
    restRoutes: {
      ...notificationContractRestRoutes,
    },
    websocketEvents: {
      namespace: '/notifications',
      notificationCreated: WebsocketEvents.notificationCreated,
      notificationRead: WebsocketEvents.notificationRead,
      notificationBulkRead: WebsocketEvents.notificationBulkRead,
      unreadCountUpdated: WebsocketEvents.notificationUnreadCountUpdated,
      unreadFacetsUpdated: WebsocketEvents.notificationUnreadFacetsUpdated,
      presetsUpdated: WebsocketEvents.notificationPresetsUpdated,
      preferenceUpdated: WebsocketEvents.notificationPreferenceUpdated,
    },
    pageDefaults: {
      defaultLimit: notificationPageDefaultLimit,
      maxLimit: notificationPageMaxLimit,
      pageCacheTtlSeconds: notificationPageCacheTtlSeconds,
      suggestedPollIntervalSeconds: notificationPagePollIntervalSeconds,
      presetCacheTtlSeconds: notificationPresetCacheTtlSeconds,
    },
    queryCapabilities: {
      presets: [...notificationPresetFilters],
      inventoryAlertKinds: [...notificationInventoryAlertKindFilters],
      inventoryAlertStatuses: [...notificationInventoryAlertStatusFilters],
      inventoryResourceTypes: [...notificationInventoryResourceTypeFilters],
      inventoryAttentionLevels: [
        ...notificationInventoryAlertAttentionLevelFilters,
      ],
      notificationTypes: Object.values(NotificationType),
    },
    presets: notificationPresetOrder.map((key, index) => ({
      key,
      label: notificationPresetLabels[key],
      sortOrder: index,
      isDefault: key === 'ALL',
    })),
    samples: {
      pageQuery: { ...notificationContractQueryExamples.page },
      historyQuery: { ...notificationContractQueryExamples.history },
      unreadCountPayload: {
        unreadCount: 3,
      },
      unreadFacetsPayload: {
        totalUnreadCount: 5,
        inventoryAlertUnreadCount: 3,
        unreadAttentionAlertCount: 2,
        unreadCompensationAlertCount: 1,
        unreadOpenInventoryAlertCount: 2,
        unreadAcknowledgedInventoryAlertCount: 0,
        unreadResolvedInventoryAlertCount: 1,
        unreadDismissedInventoryAlertCount: 0,
        unreadLowStockAlertCount: 1,
        unreadOutOfStockAlertCount: 1,
      },
      preferencePayload: {
        userId: 'usr_merchant_1',
        inventoryAlertPushEnabled: true,
        inventoryAlertQuietHoursEnabled: true,
        inventoryAlertQuietHoursStartLocalTime: '22:00',
        inventoryAlertQuietHoursEndLocalTime: '06:00',
        inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
        inventoryAlertPushCurrentlyMuted: false,
        deliveryLanes: [
          {
            channel: 'IN_APP',
            enabled: true,
            active: true,
            suppressionReason: null,
          },
          {
            channel: 'PUSH',
            enabled: true,
            active: true,
            suppressionReason: null,
          },
        ],
        activeDeliveryChannels: ['IN_APP', 'PUSH'],
        inventoryAlertPushSuppressedReason: null,
      },
    },
  };
}

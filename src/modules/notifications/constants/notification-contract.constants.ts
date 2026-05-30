import { NotificationType } from '@prisma/client';

export const notificationInventoryAlertKindFilters = [
  'ALL',
  'ATTENTION',
  'COMPENSATION',
] as const;
export const notificationInventoryAlertStatusFilters = [
  'ALL',
  'OPEN',
  'ACKNOWLEDGED',
  'RESOLVED',
  'DISMISSED',
] as const;
export const notificationInventoryResourceTypeFilters = [
  'ALL',
  'MENU_ITEM',
  'ITEM_OPTION',
] as const;
export const notificationInventoryAlertAttentionLevelFilters = [
  'ALL',
  'LOW_STOCK',
  'OUT_OF_STOCK',
] as const;
export const notificationPresetFilters = [
  'ALL',
  'UNREAD',
  'INVENTORY_OPEN',
  'INVENTORY_RESOLVED',
  'INVENTORY_COMPENSATION',
  'INVENTORY_ATTENTION',
  'INVENTORY_LOW_STOCK',
  'INVENTORY_OUT_OF_STOCK',
] as const;

export type NotificationInventoryAlertKindFilter =
  (typeof notificationInventoryAlertKindFilters)[number];
export type NotificationInventoryAlertStatusFilter =
  (typeof notificationInventoryAlertStatusFilters)[number];
export type NotificationInventoryResourceTypeFilter =
  (typeof notificationInventoryResourceTypeFilters)[number];
export type NotificationInventoryAttentionLevelFilter =
  (typeof notificationInventoryAlertAttentionLevelFilters)[number];
export type NotificationPresetFilter =
  (typeof notificationPresetFilters)[number];

export const notificationPresetLabels: Record<NotificationPresetFilter, string> = {
  ALL: 'All notifications',
  UNREAD: 'Unread',
  INVENTORY_OPEN: 'Open inventory alerts',
  INVENTORY_RESOLVED: 'Resolved inventory history',
  INVENTORY_COMPENSATION: 'Compensation alerts',
  INVENTORY_ATTENTION: 'Attention alerts',
  INVENTORY_LOW_STOCK: 'Low stock alerts',
  INVENTORY_OUT_OF_STOCK: 'Out of stock alerts',
};

export const notificationPresetOrder: NotificationPresetFilter[] = [
  'ALL',
  'UNREAD',
  'INVENTORY_OPEN',
  'INVENTORY_ATTENTION',
  'INVENTORY_LOW_STOCK',
  'INVENTORY_OUT_OF_STOCK',
  'INVENTORY_COMPENSATION',
  'INVENTORY_RESOLVED',
];

export const notificationPageDefaultLimit = 20;
export const notificationPageMaxLimit = 100;
export const notificationPresetCacheTtlSeconds = 120;
export const notificationPageCacheTtlSeconds = 30;
export const notificationPagePollIntervalSeconds = 15;

export const notificationContractRestRoutes = {
  list: '/notifications',
  page: '/notifications/page',
  unreadCount: '/notifications/unread-count',
  unreadFacets: '/notifications/unread-facets',
  presets: '/notifications/presets',
  contract: '/notifications/contract',
  inventoryAlertPreferences: '/notifications/inventory-alert-preferences',
  bulkInventoryAlertMarkRead: '/notifications/inventory-alerts/mark-read',
  markReadTemplate: '/notifications/:notificationId/read',
} as const;

export const notificationContractQueryExamples = {
  page: {
    limit: notificationPageDefaultLimit,
    preset: 'INVENTORY_OPEN',
  },
  history: {
    type: NotificationType.SYSTEM_ALERT,
    inventoryAlertStatus: 'RESOLVED',
    inventoryAlertKind: 'ATTENTION',
  },
} as const;

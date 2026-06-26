"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationContractQueryExamples = exports.notificationContractRestRoutes = exports.notificationPagePollIntervalSeconds = exports.notificationPageCacheTtlSeconds = exports.notificationPresetCacheTtlSeconds = exports.notificationPageMaxLimit = exports.notificationPageDefaultLimit = exports.notificationPresetOrder = exports.notificationPresetLabels = exports.notificationPresetFilters = exports.notificationInventoryAlertAttentionLevelFilters = exports.notificationInventoryResourceTypeFilters = exports.notificationInventoryAlertStatusFilters = exports.notificationInventoryAlertKindFilters = void 0;
const client_1 = require("@prisma/client");
exports.notificationInventoryAlertKindFilters = [
    'ALL',
    'ATTENTION',
    'COMPENSATION',
];
exports.notificationInventoryAlertStatusFilters = [
    'ALL',
    'OPEN',
    'ACKNOWLEDGED',
    'RESOLVED',
    'DISMISSED',
];
exports.notificationInventoryResourceTypeFilters = [
    'ALL',
    'MENU_ITEM',
    'ITEM_OPTION',
];
exports.notificationInventoryAlertAttentionLevelFilters = [
    'ALL',
    'LOW_STOCK',
    'OUT_OF_STOCK',
];
exports.notificationPresetFilters = [
    'ALL',
    'UNREAD',
    'INVENTORY_OPEN',
    'INVENTORY_RESOLVED',
    'INVENTORY_COMPENSATION',
    'INVENTORY_ATTENTION',
    'INVENTORY_LOW_STOCK',
    'INVENTORY_OUT_OF_STOCK',
];
exports.notificationPresetLabels = {
    ALL: 'All notifications',
    UNREAD: 'Unread',
    INVENTORY_OPEN: 'Open inventory alerts',
    INVENTORY_RESOLVED: 'Resolved inventory history',
    INVENTORY_COMPENSATION: 'Compensation alerts',
    INVENTORY_ATTENTION: 'Attention alerts',
    INVENTORY_LOW_STOCK: 'Low stock alerts',
    INVENTORY_OUT_OF_STOCK: 'Out of stock alerts',
};
exports.notificationPresetOrder = [
    'ALL',
    'UNREAD',
    'INVENTORY_OPEN',
    'INVENTORY_ATTENTION',
    'INVENTORY_LOW_STOCK',
    'INVENTORY_OUT_OF_STOCK',
    'INVENTORY_COMPENSATION',
    'INVENTORY_RESOLVED',
];
exports.notificationPageDefaultLimit = 20;
exports.notificationPageMaxLimit = 100;
exports.notificationPresetCacheTtlSeconds = 120;
exports.notificationPageCacheTtlSeconds = 30;
exports.notificationPagePollIntervalSeconds = 15;
exports.notificationContractRestRoutes = {
    list: '/notifications',
    page: '/notifications/page',
    unreadCount: '/notifications/unread-count',
    unreadFacets: '/notifications/unread-facets',
    presets: '/notifications/presets',
    contract: '/notifications/contract',
    inventoryAlertPreferences: '/notifications/inventory-alert-preferences',
    bulkInventoryAlertMarkRead: '/notifications/inventory-alerts/mark-read',
    markReadTemplate: '/notifications/:notificationId/read',
};
exports.notificationContractQueryExamples = {
    page: {
        limit: exports.notificationPageDefaultLimit,
        preset: 'INVENTORY_OPEN',
    },
    history: {
        type: client_1.NotificationType.SYSTEM_ALERT,
        inventoryAlertStatus: 'RESOLVED',
        inventoryAlertKind: 'ATTENTION',
    },
};
//# sourceMappingURL=notification-contract.constants.js.map
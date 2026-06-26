"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminInventoryAlertNotificationUserEntity = exports.adminInventoryAlertNotificationInclude = void 0;
exports.readAdminInventoryAlertMetadata = readAdminInventoryAlertMetadata;
const client_1 = require("@prisma/client");
exports.adminInventoryAlertNotificationInclude = client_1.Prisma.validator()({
    user: {
        select: {
            id: true,
            role: true,
            phone: true,
        },
    },
});
function readAdminInventoryAlertMetadata(record) {
    if (record.type !== client_1.NotificationType.SYSTEM_ALERT) {
        return null;
    }
    if (record.metadataJson === null ||
        typeof record.metadataJson !== 'object' ||
        Array.isArray(record.metadataJson)) {
        return null;
    }
    const metadata = record.metadataJson;
    const alertKind = metadata.alertKind === 'COMPENSATION' ? 'COMPENSATION' : 'ATTENTION';
    const resourceType = metadata.resourceType;
    const resourceId = metadata.resourceId;
    const resourceLabel = metadata.resourceLabel;
    const attentionLevel = metadata.attentionLevel;
    const restoredQuantity = readOptionalNumber(metadata.restoredQuantity);
    if ((resourceType !== 'MENU_ITEM' && resourceType !== 'ITEM_OPTION') ||
        typeof resourceId !== 'string' ||
        resourceId.trim().length === 0 ||
        typeof resourceLabel !== 'string' ||
        resourceLabel.trim().length === 0) {
        return null;
    }
    if (alertKind === 'ATTENTION' &&
        attentionLevel !== 'LOW_STOCK' &&
        attentionLevel !== 'OUT_OF_STOCK') {
        return null;
    }
    if (alertKind === 'COMPENSATION' &&
        (restoredQuantity === null || restoredQuantity <= 0)) {
        return null;
    }
    return {
        alertKind,
        branchId: readOptionalString(metadata.branchId),
        branchName: readOptionalString(metadata.branchName),
        resourceType,
        resourceId: resourceId.trim(),
        resourceLabel: resourceLabel.trim(),
        menuItemName: readOptionalString(metadata.menuItemName),
        attentionLevel: alertKind === 'ATTENTION'
            ? attentionLevel
            : null,
        stockQuantity: readOptionalNumber(metadata.stockQuantity),
        lowStockThreshold: readOptionalNumber(metadata.lowStockThreshold),
        restoredQuantity,
        orderId: readOptionalString(metadata.orderId),
        orderCode: readOptionalString(metadata.orderCode),
        reasonCode: readOptionalString(metadata.reasonCode),
    };
}
function readOptionalString(value) {
    if (typeof value !== 'string') {
        return null;
    }
    const normalized = value.trim();
    return normalized.length === 0 ? null : normalized;
}
function readOptionalNumber(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
class AdminInventoryAlertNotificationUserEntity {
}
exports.AdminInventoryAlertNotificationUserEntity = AdminInventoryAlertNotificationUserEntity;
//# sourceMappingURL=admin-inventory-alert-notification.entity.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantInventoryAlertPreferenceEntity = exports.merchantInventoryAlertPreferenceSelect = void 0;
exports.buildMerchantInventoryAlertPreferenceEntity = buildMerchantInventoryAlertPreferenceEntity;
const client_1 = require("@prisma/client");
exports.merchantInventoryAlertPreferenceSelect = client_1.Prisma.validator()({
    id: true,
    userId: true,
    inventoryAlertPushEnabled: true,
    inventoryAlertQuietHoursEnabled: true,
    inventoryAlertQuietHoursStartLocalTime: true,
    inventoryAlertQuietHoursEndLocalTime: true,
    inventoryAlertQuietHoursTimezone: true,
    createdAt: true,
    updatedAt: true,
});
class MerchantInventoryAlertPreferenceEntity {
}
exports.MerchantInventoryAlertPreferenceEntity = MerchantInventoryAlertPreferenceEntity;
function buildMerchantInventoryAlertPreferenceEntity(input) {
    return {
        userId: input.userId,
        inventoryAlertPushEnabled: input.preference?.inventoryAlertPushEnabled ?? true,
        inventoryAlertQuietHoursEnabled: input.preference?.inventoryAlertQuietHoursEnabled ?? false,
        inventoryAlertQuietHoursStartLocalTime: input.preference?.inventoryAlertQuietHoursStartLocalTime ?? null,
        inventoryAlertQuietHoursEndLocalTime: input.preference?.inventoryAlertQuietHoursEndLocalTime ?? null,
        inventoryAlertQuietHoursTimezone: input.preference?.inventoryAlertQuietHoursTimezone ?? null,
    };
}
//# sourceMappingURL=merchant-inventory-alert-preference.entity.js.map
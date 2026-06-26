import { Prisma } from '@prisma/client';
export declare const merchantInventoryAlertPreferenceSelect: {
    id: true;
    userId: true;
    inventoryAlertPushEnabled: true;
    inventoryAlertQuietHoursEnabled: true;
    inventoryAlertQuietHoursStartLocalTime: true;
    inventoryAlertQuietHoursEndLocalTime: true;
    inventoryAlertQuietHoursTimezone: true;
    createdAt: true;
    updatedAt: true;
};
export type MerchantInventoryAlertPreferenceRecord = Prisma.NotificationPreferenceGetPayload<{
    select: typeof merchantInventoryAlertPreferenceSelect;
}>;
export declare class MerchantInventoryAlertPreferenceEntity {
    userId: string;
    inventoryAlertPushEnabled: boolean;
    inventoryAlertQuietHoursEnabled: boolean;
    inventoryAlertQuietHoursStartLocalTime: string | null;
    inventoryAlertQuietHoursEndLocalTime: string | null;
    inventoryAlertQuietHoursTimezone: string | null;
}
export declare function buildMerchantInventoryAlertPreferenceEntity(input: {
    userId: string;
    preference?: MerchantInventoryAlertPreferenceRecord | null;
}): MerchantInventoryAlertPreferenceEntity;

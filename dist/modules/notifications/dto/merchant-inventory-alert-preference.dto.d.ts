import { MerchantInventoryAlertPreferenceEntity } from '../entities/merchant-inventory-alert-preference.entity';
export declare class MerchantInventoryAlertDeliveryLaneDto {
    channel: 'IN_APP' | 'PUSH';
    enabled: boolean;
    active: boolean;
    suppressionReason: 'PUSH_DISABLED' | 'QUIET_HOURS_MUTED' | null;
}
export declare class MerchantInventoryAlertPreferenceDto {
    userId: string;
    inventoryAlertPushEnabled: boolean;
    inventoryAlertQuietHoursEnabled: boolean;
    inventoryAlertQuietHoursStartLocalTime: string | null;
    inventoryAlertQuietHoursEndLocalTime: string | null;
    inventoryAlertQuietHoursTimezone: string | null;
    inventoryAlertPushCurrentlyMuted: boolean;
    deliveryLanes: MerchantInventoryAlertDeliveryLaneDto[];
    activeDeliveryChannels: Array<'IN_APP' | 'PUSH'>;
    inventoryAlertPushSuppressedReason: 'PUSH_DISABLED' | 'QUIET_HOURS_MUTED' | null;
}
export declare function toMerchantInventoryAlertPreferenceDto(input: {
    preference: MerchantInventoryAlertPreferenceEntity;
    inventoryAlertPushCurrentlyMuted: boolean;
}): MerchantInventoryAlertPreferenceDto;

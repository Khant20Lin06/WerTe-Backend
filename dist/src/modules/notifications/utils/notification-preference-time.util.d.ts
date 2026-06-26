import { MerchantInventoryAlertPreferenceEntity } from '../entities/merchant-inventory-alert-preference.entity';
export declare function parseLocalMinuteOfDay(value: string): number;
export declare function resolveLocalMinuteOfDay(at: Date, timeZone: string): number;
export declare function resolveLocalSecondOfDay(at: Date, timeZone: string): number;
export declare function isInventoryAlertPushMutedNow(preference: MerchantInventoryAlertPreferenceEntity, at?: Date): boolean;
export declare function resolveNextQuietHoursBoundaryAt(preference: MerchantInventoryAlertPreferenceEntity, from?: Date): Date | null;

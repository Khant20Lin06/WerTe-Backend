import { Prisma } from '@prisma/client';

export const merchantInventoryAlertPreferenceSelect =
  Prisma.validator<Prisma.NotificationPreferenceSelect>()({
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

export type MerchantInventoryAlertPreferenceRecord =
  Prisma.NotificationPreferenceGetPayload<{
    select: typeof merchantInventoryAlertPreferenceSelect;
  }>;

export class MerchantInventoryAlertPreferenceEntity {
  userId!: string;
  inventoryAlertPushEnabled!: boolean;
  inventoryAlertQuietHoursEnabled!: boolean;
  inventoryAlertQuietHoursStartLocalTime!: string | null;
  inventoryAlertQuietHoursEndLocalTime!: string | null;
  inventoryAlertQuietHoursTimezone!: string | null;
}

export function buildMerchantInventoryAlertPreferenceEntity(input: {
  userId: string;
  preference?: MerchantInventoryAlertPreferenceRecord | null;
}): MerchantInventoryAlertPreferenceEntity {
  return {
    userId: input.userId,
    inventoryAlertPushEnabled:
      input.preference?.inventoryAlertPushEnabled ?? true,
    inventoryAlertQuietHoursEnabled:
      input.preference?.inventoryAlertQuietHoursEnabled ?? false,
    inventoryAlertQuietHoursStartLocalTime:
      input.preference?.inventoryAlertQuietHoursStartLocalTime ?? null,
    inventoryAlertQuietHoursEndLocalTime:
      input.preference?.inventoryAlertQuietHoursEndLocalTime ?? null,
    inventoryAlertQuietHoursTimezone:
      input.preference?.inventoryAlertQuietHoursTimezone ?? null,
  };
}

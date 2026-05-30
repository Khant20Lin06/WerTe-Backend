import { ApiProperty } from '@nestjs/swagger';

import { MerchantInventoryAlertPreferenceEntity } from '../entities/merchant-inventory-alert-preference.entity';

export class MerchantInventoryAlertDeliveryLaneDto {
  @ApiProperty({
    example: 'IN_APP',
    enum: ['IN_APP', 'PUSH'],
    description: 'Delivery lane identifier for merchant inventory alerts.',
  })
  channel!: 'IN_APP' | 'PUSH';

  @ApiProperty({
    example: true,
    description: 'When true, the delivery lane is configured to be available.',
  })
  enabled!: boolean;

  @ApiProperty({
    example: true,
    description: 'When true, the delivery lane is active right now.',
  })
  active!: boolean;

  @ApiProperty({
    example: null,
    nullable: true,
    enum: ['PUSH_DISABLED', 'QUIET_HOURS_MUTED', null],
    description:
      'Optional reason why the delivery lane is not currently active.',
  })
  suppressionReason!: 'PUSH_DISABLED' | 'QUIET_HOURS_MUTED' | null;
}

export class MerchantInventoryAlertPreferenceDto {
  @ApiProperty({
    example: 'usr_merchant_1',
    description: 'Merchant user identifier that owns these inventory alert preferences.',
  })
  userId!: string;

  @ApiProperty({
    example: true,
    description: 'When true, merchant inventory alerts can enqueue push delivery attempts.',
  })
  inventoryAlertPushEnabled!: boolean;

  @ApiProperty({
    example: false,
    description: 'When true, quiet hours mute merchant inventory alert push delivery attempts.',
  })
  inventoryAlertQuietHoursEnabled!: boolean;

  @ApiProperty({
    example: '22:00',
    nullable: true,
    description: 'Quiet-hours local start time in HH:mm format when enabled.',
  })
  inventoryAlertQuietHoursStartLocalTime!: string | null;

  @ApiProperty({
    example: '06:00',
    nullable: true,
    description: 'Quiet-hours local end time in HH:mm format when enabled.',
  })
  inventoryAlertQuietHoursEndLocalTime!: string | null;

  @ApiProperty({
    example: 'Asia/Bangkok',
    nullable: true,
    description: 'IANA timezone used to evaluate the quiet-hours local window.',
  })
  inventoryAlertQuietHoursTimezone!: string | null;

  @ApiProperty({
    example: false,
    description: 'Computed flag showing whether merchant inventory alert push delivery is muted right now.',
  })
  inventoryAlertPushCurrentlyMuted!: boolean;

  @ApiProperty({
    type: [MerchantInventoryAlertDeliveryLaneDto],
    description:
      'Computed delivery-lane state snapshot for in-app and push merchant inventory alerts.',
  })
  deliveryLanes!: MerchantInventoryAlertDeliveryLaneDto[];

  @ApiProperty({
    example: ['IN_APP', 'PUSH'],
    isArray: true,
    enum: ['IN_APP', 'PUSH'],
    description: 'Computed list of delivery channels that are active right now.',
  })
  activeDeliveryChannels!: Array<'IN_APP' | 'PUSH'>;

  @ApiProperty({
    example: null,
    nullable: true,
    enum: ['PUSH_DISABLED', 'QUIET_HOURS_MUTED', null],
    description:
      'Optional push-lane suppression reason when merchant inventory alert push is not active.',
  })
  inventoryAlertPushSuppressedReason!: 'PUSH_DISABLED' | 'QUIET_HOURS_MUTED' | null;
}

export function toMerchantInventoryAlertPreferenceDto(input: {
  preference: MerchantInventoryAlertPreferenceEntity;
  inventoryAlertPushCurrentlyMuted: boolean;
}): MerchantInventoryAlertPreferenceDto {
  return {
    userId: input.preference.userId,
    inventoryAlertPushEnabled: input.preference.inventoryAlertPushEnabled,
    inventoryAlertQuietHoursEnabled:
      input.preference.inventoryAlertQuietHoursEnabled,
    inventoryAlertQuietHoursStartLocalTime:
      input.preference.inventoryAlertQuietHoursStartLocalTime,
    inventoryAlertQuietHoursEndLocalTime:
      input.preference.inventoryAlertQuietHoursEndLocalTime,
    inventoryAlertQuietHoursTimezone:
      input.preference.inventoryAlertQuietHoursTimezone,
    inventoryAlertPushCurrentlyMuted: input.inventoryAlertPushCurrentlyMuted,
    deliveryLanes: [
      {
        channel: 'IN_APP',
        enabled: true,
        active: true,
        suppressionReason: null,
      },
      {
        channel: 'PUSH',
        enabled: input.preference.inventoryAlertPushEnabled,
        active:
          input.preference.inventoryAlertPushEnabled &&
          !input.inventoryAlertPushCurrentlyMuted,
        suppressionReason: !input.preference.inventoryAlertPushEnabled
          ? 'PUSH_DISABLED'
          : input.inventoryAlertPushCurrentlyMuted
            ? 'QUIET_HOURS_MUTED'
            : null,
      },
    ],
    activeDeliveryChannels:
      input.preference.inventoryAlertPushEnabled &&
      !input.inventoryAlertPushCurrentlyMuted
        ? ['IN_APP', 'PUSH']
        : ['IN_APP'],
    inventoryAlertPushSuppressedReason: !input.preference.inventoryAlertPushEnabled
      ? 'PUSH_DISABLED'
      : input.inventoryAlertPushCurrentlyMuted
        ? 'QUIET_HOURS_MUTED'
        : null,
  };
}

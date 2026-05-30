import { NotificationType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  notificationInventoryAlertAttentionLevelFilters,
  notificationInventoryAlertKindFilters,
  notificationInventoryAlertStatusFilters,
  notificationInventoryResourceTypeFilters,
  notificationPageMaxLimit,
  notificationPresetFilters,
} from '../constants/notification-contract.constants';
import type {
  NotificationInventoryAlertKindFilter,
  NotificationInventoryAlertStatusFilter,
  NotificationInventoryResourceTypeFilter,
  NotificationInventoryAttentionLevelFilter,
  NotificationPresetFilter,
} from '../constants/notification-contract.constants';

export type {
  NotificationInventoryAlertKindFilter,
  NotificationInventoryAlertStatusFilter,
  NotificationInventoryResourceTypeFilter,
  NotificationInventoryAttentionLevelFilter,
  NotificationPresetFilter,
} from '../constants/notification-contract.constants';

function transformOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }
  }

  return undefined;
}

export class ListNotificationsQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of notifications to return.',
    example: 20,
    minimum: 1,
    maximum: notificationPageMaxLimit,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(notificationPageMaxLimit)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Opaque pagination cursor from a previous notification page.',
    example: 'notification_1',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Optional notification type filter.',
    enum: NotificationType,
    example: NotificationType.SYSTEM_ALERT,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    description:
      'Optional preset shortcut for common notification center tabs.',
    enum: notificationPresetFilters,
    example: 'INVENTORY_OPEN',
  })
  @IsOptional()
  @IsIn(notificationPresetFilters)
  preset?: NotificationPresetFilter;

  @ApiPropertyOptional({
    description: 'When true, returns unread notifications only.',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => transformOptionalBoolean(value))
  @IsBoolean()
  unreadOnly?: boolean;

  @ApiPropertyOptional({
    description:
      'Optional keyword filter across notification content and inventory alert labels.',
    example: 'mohinga',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description:
      'Optional inventory alert kind filter for merchant inventory notification history.',
    enum: notificationInventoryAlertKindFilters,
    example: 'ATTENTION',
  })
  @IsOptional()
  @IsIn(notificationInventoryAlertKindFilters)
  inventoryAlertKind?: NotificationInventoryAlertKindFilter;

  @ApiPropertyOptional({
    description:
      'Optional inventory alert status filter for open or resolved history views.',
    enum: notificationInventoryAlertStatusFilters,
    example: 'RESOLVED',
  })
  @IsOptional()
  @IsIn(notificationInventoryAlertStatusFilters)
  inventoryAlertStatus?: NotificationInventoryAlertStatusFilter;

  @ApiPropertyOptional({
    description: 'Optional inventory resource type filter.',
    enum: notificationInventoryResourceTypeFilters,
    example: 'ITEM_OPTION',
  })
  @IsOptional()
  @IsIn(notificationInventoryResourceTypeFilters)
  inventoryResourceType?: NotificationInventoryResourceTypeFilter;

  @ApiPropertyOptional({
    description: 'Optional inventory attention level filter.',
    enum: notificationInventoryAlertAttentionLevelFilters,
    example: 'LOW_STOCK',
  })
  @IsOptional()
  @IsIn(notificationInventoryAlertAttentionLevelFilters)
  inventoryAttentionLevel?: NotificationInventoryAttentionLevelFilter;

  @ApiPropertyOptional({
    description: 'Optional branch filter for inventory alert notifications.',
    example: 'branch_1',
  })
  @IsOptional()
  @IsString()
  branchId?: string;
}

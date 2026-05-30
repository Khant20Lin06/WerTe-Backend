import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

import {
  NotificationInventoryAlertKindFilter,
  NotificationInventoryAlertStatusFilter,
  NotificationInventoryAttentionLevelFilter,
  NotificationInventoryResourceTypeFilter,
} from './list-notifications-query.dto';

const inventoryAlertKindFilters = ['ALL', 'ATTENTION', 'COMPENSATION'] as const;
const inventoryAlertStatusFilters = [
  'ALL',
  'OPEN',
  'ACKNOWLEDGED',
  'RESOLVED',
  'DISMISSED',
] as const;
const inventoryResourceTypeFilters = ['ALL', 'MENU_ITEM', 'ITEM_OPTION'] as const;
const inventoryAttentionLevelFilters = [
  'ALL',
  'LOW_STOCK',
  'OUT_OF_STOCK',
] as const;

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

export class BulkMarkInventoryAlertsReadDto {
  @ApiPropertyOptional({
    description:
      'Specific inventory alert notification identifiers to mark as read.',
    example: ['notification_1', 'notification_2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  notificationIds?: string[];

  @ApiPropertyOptional({
    description:
      'When true, marks all unread inventory alerts matching the filters below.',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => transformOptionalBoolean(value))
  @IsBoolean()
  markAllMatching?: boolean;

  @ApiPropertyOptional({
    description:
      'Maximum number of unread filtered inventory alerts to mark when markAllMatching is enabled.',
    example: 100,
    minimum: 1,
    maximum: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;

  @ApiPropertyOptional({
    description:
      'Optional keyword filter across inventory alert title, body, branch, and item labels.',
    example: 'mohinga',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Optional inventory alert kind filter.',
    enum: inventoryAlertKindFilters,
    example: 'ATTENTION',
  })
  @IsOptional()
  @IsIn(inventoryAlertKindFilters)
  inventoryAlertKind?: NotificationInventoryAlertKindFilter;

  @ApiPropertyOptional({
    description: 'Optional inventory alert status filter.',
    enum: inventoryAlertStatusFilters,
    example: 'OPEN',
  })
  @IsOptional()
  @IsIn(inventoryAlertStatusFilters)
  inventoryAlertStatus?: NotificationInventoryAlertStatusFilter;

  @ApiPropertyOptional({
    description: 'Optional inventory resource type filter.',
    enum: inventoryResourceTypeFilters,
    example: 'MENU_ITEM',
  })
  @IsOptional()
  @IsIn(inventoryResourceTypeFilters)
  inventoryResourceType?: NotificationInventoryResourceTypeFilter;

  @ApiPropertyOptional({
    description: 'Optional inventory attention level filter.',
    enum: inventoryAttentionLevelFilters,
    example: 'LOW_STOCK',
  })
  @IsOptional()
  @IsIn(inventoryAttentionLevelFilters)
  inventoryAttentionLevel?: NotificationInventoryAttentionLevelFilter;

  @ApiPropertyOptional({
    description: 'Optional branch filter for inventory alert notifications.',
    example: 'branch_1',
  })
  @IsOptional()
  @IsString()
  branchId?: string;
}

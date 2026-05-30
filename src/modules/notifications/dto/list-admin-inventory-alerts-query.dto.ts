import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import {
  AdminInventoryAlertKind,
  AdminInventoryAlertStatus,
} from './admin-inventory-alert.dto';

export class ListAdminInventoryAlertsQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of admin inventory alerts to return.',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Optional branch filter for inventory alerts.',
    example: 'branch_1',
  })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Administrative acknowledgement status filter.',
    enum: [...Object.values(AdminInventoryAlertStatus), 'ALL'],
    example: AdminInventoryAlertStatus.OPEN,
  })
  @IsOptional()
  @IsEnum({
    ...AdminInventoryAlertStatus,
    ALL: 'ALL',
  })
  status?: AdminInventoryAlertStatus | 'ALL';

  @ApiPropertyOptional({
    description: 'Optional merchant user filter for inventory alerts.',
    example: 'usr_merchant_1',
  })
  @IsOptional()
  @IsString()
  merchantUserId?: string;

  @ApiPropertyOptional({
    description: 'Alert kind filter.',
    enum: [...Object.values(AdminInventoryAlertKind), 'ALL'],
    example: AdminInventoryAlertKind.ATTENTION,
  })
  @IsOptional()
  @IsEnum({
    ...AdminInventoryAlertKind,
    ALL: 'ALL',
  })
  alertKind?: AdminInventoryAlertKind | 'ALL';

  @ApiPropertyOptional({
    description: 'Inventory resource type filter.',
    enum: ['MENU_ITEM', 'ITEM_OPTION', 'ALL'],
    example: 'MENU_ITEM',
  })
  @IsOptional()
  @IsEnum({
    MENU_ITEM: 'MENU_ITEM',
    ITEM_OPTION: 'ITEM_OPTION',
    ALL: 'ALL',
  })
  resourceType?: 'MENU_ITEM' | 'ITEM_OPTION' | 'ALL';

  @ApiPropertyOptional({
    description: 'Attention level filter for shortage alerts.',
    enum: ['LOW_STOCK', 'OUT_OF_STOCK', 'ALL'],
    example: 'LOW_STOCK',
  })
  @IsOptional()
  @IsEnum({
    LOW_STOCK: 'LOW_STOCK',
    OUT_OF_STOCK: 'OUT_OF_STOCK',
    ALL: 'ALL',
  })
  attentionLevel?: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ALL';

  @ApiPropertyOptional({
    description:
      'Case-insensitive keyword search across alert title, resource label, branch, order code, and merchant phone.',
    example: 'mohinga',
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}

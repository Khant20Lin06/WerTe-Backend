import { ApiProperty } from '@nestjs/swagger';

export class NotificationListPresetQueryEntity {
  @ApiProperty({ example: 'INVENTORY_OPEN' })
  preset!: string;

  @ApiProperty({ example: false, nullable: true })
  unreadOnly!: boolean | null;

  @ApiProperty({ example: 'SYSTEM_ALERT', nullable: true })
  type!: string | null;

  @ApiProperty({ example: 'ATTENTION', nullable: true })
  inventoryAlertKind!: string | null;

  @ApiProperty({ example: 'OPEN', nullable: true })
  inventoryAlertStatus!: string | null;

  @ApiProperty({ example: 'MENU_ITEM', nullable: true })
  inventoryResourceType!: string | null;

  @ApiProperty({ example: 'LOW_STOCK', nullable: true })
  inventoryAttentionLevel!: string | null;

  @ApiProperty({ example: 'branch_1', nullable: true })
  branchId!: string | null;
}

export class NotificationListPresetEntity {
  @ApiProperty({ example: 'INVENTORY_OPEN' })
  key!: string;

  @ApiProperty({ example: 'Open inventory alerts' })
  label!: string;

  @ApiProperty({ example: 2 })
  sortOrder!: number;

  @ApiProperty({ example: false })
  isDefault!: boolean;

  @ApiProperty({ example: 120 })
  cacheTtlSeconds!: number;

  @ApiProperty({ example: 3 })
  unreadCount!: number;

  @ApiProperty({ type: NotificationListPresetQueryEntity })
  query!: NotificationListPresetQueryEntity;
}

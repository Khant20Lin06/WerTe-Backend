import { ApiProperty } from '@nestjs/swagger';

export class NotificationUnreadFacetsEntity {
  @ApiProperty({ example: 5 })
  totalUnreadCount!: number;

  @ApiProperty({ example: 3 })
  inventoryAlertUnreadCount!: number;

  @ApiProperty({ example: 2 })
  unreadAttentionAlertCount!: number;

  @ApiProperty({ example: 1 })
  unreadCompensationAlertCount!: number;

  @ApiProperty({ example: 2 })
  unreadOpenInventoryAlertCount!: number;

  @ApiProperty({ example: 0 })
  unreadAcknowledgedInventoryAlertCount!: number;

  @ApiProperty({ example: 1 })
  unreadResolvedInventoryAlertCount!: number;

  @ApiProperty({ example: 0 })
  unreadDismissedInventoryAlertCount!: number;

  @ApiProperty({ example: 1 })
  unreadLowStockAlertCount!: number;

  @ApiProperty({ example: 1 })
  unreadOutOfStockAlertCount!: number;
}

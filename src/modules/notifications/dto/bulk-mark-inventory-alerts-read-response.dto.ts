import { ApiProperty } from '@nestjs/swagger';

import { NotificationCenterEntity } from '../entities/notification-center.entity';

export class BulkMarkInventoryAlertsReadResponseDto {
  @ApiProperty({
    description:
      'Number of inventory alert notifications newly marked as read by this bulk request.',
    example: 2,
  })
  markedCount!: number;

  @ApiProperty({
    description:
      'Resolved inventory alert notification snapshots after applying read state.',
    type: NotificationCenterEntity,
    isArray: true,
  })
  notifications!: NotificationCenterEntity[];
}

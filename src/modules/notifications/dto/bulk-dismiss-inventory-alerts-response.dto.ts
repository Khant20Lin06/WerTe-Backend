import { ApiProperty } from '@nestjs/swagger';

import { AdminInventoryAlertDto } from './admin-inventory-alert.dto';

export class BulkDismissInventoryAlertsResponseDto {
  @ApiProperty({
    description: 'Number of alerts dismissed by this bulk request.',
    example: 2,
  })
  dismissedCount!: number;

  @ApiProperty({
    description:
      'Resolved inventory alerts after applying dismissal state.',
    type: AdminInventoryAlertDto,
    isArray: true,
  })
  alerts!: AdminInventoryAlertDto[];
}

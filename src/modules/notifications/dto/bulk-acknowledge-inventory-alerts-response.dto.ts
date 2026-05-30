import { ApiProperty } from '@nestjs/swagger';

import { AdminInventoryAlertDto } from './admin-inventory-alert.dto';

export class BulkAcknowledgeInventoryAlertsResponseDto {
  @ApiProperty({
    description: 'Number of alerts acknowledged by this bulk request.',
    example: 2,
  })
  acknowledgedCount!: number;

  @ApiProperty({
    description:
      'Resolved inventory alerts after applying acknowledgement state.',
    type: AdminInventoryAlertDto,
    isArray: true,
  })
  alerts!: AdminInventoryAlertDto[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class BulkAcknowledgeInventoryAlertsDto {
  @ApiProperty({
    description: 'Inventory alert notification identifiers to acknowledge.',
    example: ['notification_1', 'notification_2'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  notificationIds!: string[];

  @ApiPropertyOptional({
    description: 'Optional acknowledgement note applied to newly acknowledged alerts.',
    example: 'Ops team reviewed these alerts with the merchant.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

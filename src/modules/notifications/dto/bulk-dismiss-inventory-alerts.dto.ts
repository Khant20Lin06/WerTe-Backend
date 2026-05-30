import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class BulkDismissInventoryAlertsDto {
  @ApiProperty({
    description: 'Inventory alert notification identifiers to dismiss.',
    example: ['notification_1', 'notification_2'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  notificationIds!: string[];

  @ApiPropertyOptional({
    description: 'Optional dismissal note applied to newly dismissed alerts.',
    example: 'Noise-only alerts; no further ops follow-up required.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

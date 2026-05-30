import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class AssignRiderDto {
  @ApiProperty({
    description: 'Rider identifier to assign to the order.',
    example: 'rider_1',
  })
  @IsString()
  @MaxLength(100)
  riderId!: string;

  @ApiPropertyOptional({
    description: 'Optional delivery ETA in minutes attached at assignment time.',
    example: 18,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  etaMinutes?: number;

  @ApiPropertyOptional({
    description:
      'Optional structured reason code supplied by the dispatch assignment flow.',
    example: 'admin_assigned_rider_manual_dispatch',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reasonCode?: string;

  @ApiPropertyOptional({
    description: 'Optional dispatch note attached to the assignment action.',
    example: 'Dispatcher manually assigned the nearest rider.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

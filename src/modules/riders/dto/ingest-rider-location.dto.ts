import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class IngestRiderLocationDto {
  @ApiProperty({
    description: 'Latitude captured from the rider device.',
    example: 16.834,
  })
  @Type(() => Number)
  @IsNumber()
  latitude!: number;

  @ApiProperty({
    description: 'Longitude captured from the rider device.',
    example: 96.176,
  })
  @Type(() => Number)
  @IsNumber()
  longitude!: number;

  @ApiPropertyOptional({
    description: 'Optional heading in degrees from the rider device.',
    example: 90,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  heading?: number;

  @ApiPropertyOptional({
    description: 'Optional current speed captured from the rider device.',
    example: 14.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  speed?: number;

  @ApiPropertyOptional({
    description: 'Optional location accuracy in meters.',
    example: 5.2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  accuracyMeters?: number;

  @ApiProperty({
    description: 'Timestamp when the location was recorded on device.',
    example: '2026-04-19T10:12:00.000Z',
  })
  @IsDateString()
  recordedAt!: string;
}

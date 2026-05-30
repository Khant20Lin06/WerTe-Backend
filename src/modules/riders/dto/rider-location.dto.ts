import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RiderLocationDto {
  @ApiProperty({ example: 'rider_1' })
  riderId!: string;

  @ApiPropertyOptional({ example: 'delivery_1' })
  deliveryId!: string | null;

  @ApiProperty({ example: '16.834' })
  latitude!: string;

  @ApiProperty({ example: '96.176' })
  longitude!: string;

  @ApiPropertyOptional({ example: '90' })
  heading!: string | null;

  @ApiPropertyOptional({ example: '14.5' })
  speed!: string | null;

  @ApiPropertyOptional({ example: '5.2' })
  accuracyMeters!: string | null;

  @ApiProperty({ example: '2026-04-19T10:12:00.000Z' })
  recordedAt!: string;

  @ApiProperty({
    description: 'Whether the request matched the current stored snapshot and skipped writes.',
    example: false,
  })
  duplicate!: boolean;
}

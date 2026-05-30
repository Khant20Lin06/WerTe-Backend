import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ZoneStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateZoneDto {
  @ApiProperty({
    description: 'Short unique zone code used across admin and dispatch workflows.',
    example: 'YGN-DT',
    maxLength: 32,
  })
  @IsString()
  @MaxLength(32)
  @Matches(/^[A-Z0-9-]+$/)
  code!: string;

  @ApiProperty({
    description: 'Human-readable zone name.',
    example: 'Downtown',
    maxLength: 120,
  })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional zone description.',
    example: 'Central Yangon delivery zone',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: 'Initial zone status.',
    enum: ZoneStatus,
    example: ZoneStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ZoneStatus)
  status?: ZoneStatus;
}

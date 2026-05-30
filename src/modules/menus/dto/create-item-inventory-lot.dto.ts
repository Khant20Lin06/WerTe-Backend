import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateItemInventoryLotDto {
  @ApiProperty({
    description: 'Supplier or warehouse batch number for this inventory lot.',
    example: 'BATCH-2026-001',
  })
  @IsString()
  @MaxLength(120)
  batchNo!: string;

  @ApiPropertyOptional({
    description: 'Optional expiry timestamp for FEFO lot allocation.',
    example: '2026-05-30T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'When this lot was received. Defaults to now when omitted.',
    example: '2026-05-02T09:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  receivedAt?: string;

  @ApiProperty({
    description: 'Initial received quantity for the lot.',
    example: 24,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Optional merchant note for the lot.',
    example: 'Initial pharmacy delivery',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

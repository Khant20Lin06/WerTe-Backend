import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateItemInventoryLotDto {
  @ApiPropertyOptional({
    description: 'Supplier or warehouse batch number for this inventory lot.',
    example: 'BATCH-2026-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  batchNo?: string;

  @ApiPropertyOptional({
    description: 'Optional expiry timestamp for FEFO lot allocation.',
    example: '2026-05-30T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Optional received timestamp override for the lot.',
    example: '2026-05-02T09:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  receivedAt?: string;

  @ApiPropertyOptional({
    description: 'Optional merchant note for the lot.',
    example: 'Initial pharmacy delivery',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

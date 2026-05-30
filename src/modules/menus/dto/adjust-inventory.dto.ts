import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, NotEquals } from 'class-validator';

export class AdjustInventoryDto {
  @ApiProperty({
    description:
      'Signed stock delta. Use a positive number to restock and a negative number to deduct or write off stock.',
    example: 5,
  })
  @Type(() => Number)
  @IsInt()
  @NotEquals(0)
  delta!: number;

  @ApiProperty({
    description: 'Structured reason code for the adjustment event.',
    example: 'manual_restock_after_return',
  })
  @IsString()
  @MaxLength(100)
  reasonCode!: string;

  @ApiPropertyOptional({
    description: 'Optional note that explains the stock correction.',
    example: 'Returned unopened pack added back to inventory.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

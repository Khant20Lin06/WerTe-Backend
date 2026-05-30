import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMerchantProfileDto {
  @ApiPropertyOptional({
    description: 'Merchant business display name.',
    example: 'Tea House',
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({
    description: 'Merchant support phone number.',
    example: '0942000000',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  supportPhone?: string;

  @ApiPropertyOptional({
    description:
      'Primary dynamic store type code used as the default for new branches.',
    example: 'restaurant',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  storeType?: string;
}

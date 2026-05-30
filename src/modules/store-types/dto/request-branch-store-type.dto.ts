import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class RequestBranchStoreTypeDto {
  @ApiProperty({
    description: 'Store type identifier the merchant wants to request for the branch.',
    example: 'store_type_grocery',
  })
  @IsString()
  @MaxLength(191)
  storeTypeId!: string;

  @ApiPropertyOptional({
    description: 'Optional desired sort order once approved.',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Optional merchant note explaining the request.',
    example: 'This branch is launching a grocery aisle next week.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

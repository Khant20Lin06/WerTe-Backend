import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GetCustomerStoreCatalogQueryDto {
  @ApiPropertyOptional({
    description:
      'Optional approved store type code that selects a specific customer-facing catalog entry for the branch.',
    example: 'pharmacy',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  storeTypeCode?: string;
}

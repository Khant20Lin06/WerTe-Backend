import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GetCustomerBranchCatalogQueryDto {
  @ApiPropertyOptional({
    description:
      'Optional approved store type code that scopes the customer-visible catalog to a specific branch store-type entry.',
    example: 'pharmacy',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  storeTypeCode?: string;
}

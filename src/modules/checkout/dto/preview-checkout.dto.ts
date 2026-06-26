import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class PreviewCheckoutDto {
  @ApiProperty({
    description: 'Branch identifier used to resolve the active cart for checkout preview.',
    example: 'branch_1',
  })
  @IsString()
  @MaxLength(191)
  branchId!: string;

  @ApiPropertyOptional({
    description:
      'Optional customer-owned delivery address identifier. When omitted, the default address is used.',
    example: 'addr_1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  addressId?: string;

  @ApiPropertyOptional({
    description: 'Delivery type for the preview. PICKUP orders have zero delivery fee and no address.',
    example: 'DELIVERY',
    enum: ['DELIVERY', 'PICKUP'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['DELIVERY', 'PICKUP'])
  deliveryType?: 'DELIVERY' | 'PICKUP';

  @ApiPropertyOptional({
    description:
      'Optional branch-scoped promotion code evaluated during checkout preview.',
    example: 'SAVE10',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  promotionCode?: string;
}

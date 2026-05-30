import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MerchantOrderActionDto {
  @ApiPropertyOptional({
    description:
      'Optional structured reason code supplied by the merchant order handling flow.',
    example: 'merchant_rejected_out_of_stock',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reasonCode?: string;

  @ApiPropertyOptional({
    description: 'Optional merchant note attached to the order status transition.',
    example: 'Item is out of stock at this branch.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

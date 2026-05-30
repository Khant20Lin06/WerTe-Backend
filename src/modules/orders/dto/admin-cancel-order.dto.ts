import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminCancelOrderDto {
  @ApiPropertyOptional({
    description:
      'Optional structured reason code supplied by the administrative cancel flow.',
    example: 'admin_cancelled_duplicate_order',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reasonCode?: string;

  @ApiPropertyOptional({
    description: 'Optional administrative note attached to the cancellation.',
    example: 'Customer contacted support to stop fulfillment.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

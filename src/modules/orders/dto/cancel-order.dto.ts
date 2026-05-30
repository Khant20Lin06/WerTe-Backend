import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelOrderDto {
  @ApiPropertyOptional({
    description:
      'Optional structured reason code supplied by the customer cancellation flow.',
    example: 'customer_changed_mind',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reasonCode?: string;

  @ApiPropertyOptional({
    description: 'Optional customer note explaining the cancellation request.',
    example: 'I entered the wrong delivery address.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

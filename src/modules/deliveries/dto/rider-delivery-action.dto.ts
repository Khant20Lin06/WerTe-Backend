import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RiderDeliveryActionDto {
  @ApiPropertyOptional({
    description:
      'Optional structured reason code supplied by the rider delivery workflow.',
    example: 'rider_rejected_assignment',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reasonCode?: string;

  @ApiPropertyOptional({
    description: 'Optional rider note attached to the delivery action.',
    example: 'Traffic conditions make this assignment unreachable.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

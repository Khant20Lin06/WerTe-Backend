import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RiderFailedDeliveryDto {
  @ApiProperty({
    description:
      'Required structured reason code explaining why the delivery failed.',
    example: 'customer_unreachable',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  reasonCode!: string;

  @ApiPropertyOptional({
    description: 'Optional rider note attached to the failed delivery action.',
    example: 'The customer phone was unreachable after multiple attempts.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

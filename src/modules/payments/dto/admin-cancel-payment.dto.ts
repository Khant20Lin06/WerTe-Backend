import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminCancelPaymentDto {
  @ApiPropertyOptional({
    description: 'Optional provider-side payment intent or transaction reference.',
    example: 'pi_123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  providerReference?: string;

  @ApiPropertyOptional({
    description: 'Optional structured reason code attached to the cancel event.',
    example: 'customer_cancelled_payment',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reasonCode?: string;

  @ApiPropertyOptional({
    description: 'Optional administrative note attached to the payment cancellation.',
    example: 'Customer requested cancellation before capture.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

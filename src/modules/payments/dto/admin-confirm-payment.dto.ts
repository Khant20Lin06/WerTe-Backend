import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminConfirmPaymentDto {
  @ApiPropertyOptional({
    description: 'Optional provider-side payment intent or transaction reference.',
    example: 'pi_123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  providerReference?: string;

  @ApiPropertyOptional({
    description: 'Optional provider-side receipt identifier.',
    example: 'receipt_123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  providerReceiptId?: string;

  @ApiPropertyOptional({
    description: 'Optional structured reason code attached to the confirmation event.',
    example: 'provider_webhook_confirmed',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reasonCode?: string;

  @ApiPropertyOptional({
    description: 'Optional administrative note attached to the payment confirmation.',
    example: 'Provider callback confirmed the charge.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

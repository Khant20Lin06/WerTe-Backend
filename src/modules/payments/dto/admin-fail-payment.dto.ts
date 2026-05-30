import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminFailPaymentDto {
  @ApiPropertyOptional({
    description: 'Optional provider-side payment intent or transaction reference.',
    example: 'pi_123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  providerReference?: string;

  @ApiPropertyOptional({
    description: 'Optional structured reason code attached to the failure event.',
    example: 'provider_declined',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reasonCode?: string;

  @ApiPropertyOptional({
    description: 'Optional failure code returned by the provider.',
    example: 'card_declined',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  failureCode?: string;

  @ApiPropertyOptional({
    description: 'Optional failure message returned by the provider.',
    example: 'Card was declined.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  failureMessage?: string;

  @ApiPropertyOptional({
    description: 'Optional note attached to the failure transition.',
    example: 'Customer should retry with another payment method.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

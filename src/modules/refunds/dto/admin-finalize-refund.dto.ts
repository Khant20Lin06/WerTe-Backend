import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminFinalizeRefundDto {
  @ApiPropertyOptional({
    description: 'Optional provider-side refund reference.',
    example: 'refund_ref_1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  providerReference?: string;

  @ApiPropertyOptional({
    description: 'Optional structured reason code attached to the refund lifecycle event.',
    example: 'provider_refund_completed',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reasonCode?: string;

  @ApiPropertyOptional({
    description: 'Optional failure code returned by the provider.',
    example: 'provider_timeout',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  failureCode?: string;

  @ApiPropertyOptional({
    description: 'Optional failure message returned by the provider.',
    example: 'Provider timeout',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  failureMessage?: string;

  @ApiPropertyOptional({
    description: 'Optional administrative note attached to the refund lifecycle event.',
    example: 'Provider acknowledged the refund request.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

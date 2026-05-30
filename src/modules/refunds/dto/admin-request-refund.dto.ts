import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminRequestRefundDto {
  @ApiProperty({
    description: 'Refund amount expressed in the order currency as a string decimal.',
    example: '1500',
  })
  @IsString()
  @MaxLength(50)
  amount!: string;

  @ApiPropertyOptional({
    description: 'Optional idempotency key used to replay the same refund request safely.',
    example: 'refund-idem-1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  idempotencyKey?: string;

  @ApiPropertyOptional({
    description: 'Optional provider-side refund reference.',
    example: 'refund_ref_1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  providerReference?: string;

  @ApiPropertyOptional({
    description: 'Optional structured reason code attached to the refund request.',
    example: 'customer_support',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reasonCode?: string;

  @ApiPropertyOptional({
    description: 'Optional administrative note attached to the refund request.',
    example: 'Goodwill refund approved by support.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

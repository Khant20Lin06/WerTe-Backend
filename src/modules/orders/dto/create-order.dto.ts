import { PaymentMethod, PaymentProvider } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Branch receiving the submitted checkout request.',
    example: 'branch_1',
  })
  @IsString()
  @MaxLength(191)
  branchId!: string;

  @ApiPropertyOptional({
    description:
      'Optional customer-owned delivery address identifier. When omitted, the default address is used.',
    example: 'addr_1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  addressId?: string;

  @ApiProperty({
    description:
      'Client-generated idempotency key used to safely retry checkout submission.',
    example: 'checkout-usr_1-20260419-001',
  })
  @IsString()
  @MaxLength(191)
  idempotencyKey!: string;

  @ApiPropertyOptional({
    description:
      'Optional payment method used to initialize the checkout payment intent. Defaults to CASH_ON_DELIVERY.',
    enum: PaymentMethod,
    example: PaymentMethod.CASH_ON_DELIVERY,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description:
      'Optional payment provider hint for non-COD checkout payment intents.',
    enum: PaymentProvider,
    example: PaymentProvider.WAVE_PAY,
  })
  @IsOptional()
  @IsEnum(PaymentProvider)
  paymentProvider?: PaymentProvider;

  @ApiPropertyOptional({
    description:
      'Optional promotion code applied to the submitted checkout when valid for the branch.',
    example: 'SAVE10',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  promotionCode?: string;
}

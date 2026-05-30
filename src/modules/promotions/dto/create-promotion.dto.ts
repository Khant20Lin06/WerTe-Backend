import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PromotionDiscountType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({
    description: 'Branch-scoped promotion code entered by customers at checkout.',
    example: 'SAVE10',
    maxLength: 40,
  })
  @IsString()
  @MaxLength(40)
  code!: string;

  @ApiProperty({
    description: 'Merchant-facing promotion name.',
    example: 'Save 10 percent',
    maxLength: 160,
  })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional merchant-facing description.',
    example: 'Weekend grocery campaign.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Discount rule type applied when the code is valid.',
    enum: PromotionDiscountType,
    example: PromotionDiscountType.PERCENTAGE,
  })
  @IsEnum(PromotionDiscountType)
  discountType!: PromotionDiscountType;

  @ApiProperty({
    description:
      'Discount value for the selected rule type. Percentage values use whole percentages.',
    example: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  discountValue!: number;

  @ApiPropertyOptional({
    description: 'Optional minimum cart subtotal required before the promotion can apply.',
    example: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumSubtotalAmount?: number;

  @ApiPropertyOptional({
    description: 'Optional discount cap for percentage-based promotions.',
    example: 2500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  maximumDiscountAmount?: number;

  @ApiPropertyOptional({
    description: 'Optional activation start timestamp.',
    example: '2026-05-03T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({
    description: 'Optional activation end timestamp.',
    example: '2026-05-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({
    description: 'Whether the promotion is currently active.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}

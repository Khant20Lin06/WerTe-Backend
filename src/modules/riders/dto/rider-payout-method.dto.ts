import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RiderPayoutMethod, RiderPayoutMethodType } from '@prisma/client';
import {
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateRiderPayoutMethodDto {
  @ApiProperty({ enum: RiderPayoutMethodType })
  @IsEnum(RiderPayoutMethodType)
  type!: RiderPayoutMethodType;

  @ApiProperty({ description: 'Name on the bank account or wallet.', example: 'Ko Aung' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  accountName!: string;

  @ApiProperty({
    description: 'Bank account number, or wallet phone number for mobile wallets.',
    example: '09977777777',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(40)
  accountNumber!: string;

  @ApiPropertyOptional({
    description: 'Bank name. Required when type is BANK_ACCOUNT.',
    example: 'KBZ Bank',
  })
  @ValidateIf((o: UpdateRiderPayoutMethodDto) => o.type === RiderPayoutMethodType.BANK_ACCOUNT)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  bankName?: string;
}

export class RiderPayoutMethodDto {
  @ApiProperty({ enum: RiderPayoutMethodType })
  type!: RiderPayoutMethodType;

  @ApiProperty()
  accountName!: string;

  @ApiProperty()
  accountNumber!: string;

  @ApiPropertyOptional({ nullable: true })
  bankName?: string | null;

  @ApiProperty()
  updatedAt!: string;
}

export function toRiderPayoutMethodDto(
  method: RiderPayoutMethod,
): RiderPayoutMethodDto {
  return {
    type: method.type,
    accountName: method.accountName,
    accountNumber: method.accountNumber,
    bankName: method.bankName,
    updatedAt: method.updatedAt.toISOString(),
  };
}

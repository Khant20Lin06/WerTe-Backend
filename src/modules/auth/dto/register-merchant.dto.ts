import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export const VALID_STORE_TYPE_CODES = [
  'restaurant',
  'grocery',
  'pharmacy',
  'beauty',
  'fashion',
] as const;

export type StoreTypeCode = (typeof VALID_STORE_TYPE_CODES)[number];

export class RegisterMerchantDto {
  @ApiProperty({
    description: 'Merchant owner phone number used for authentication.',
    example: '+959123456780',
  })
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message:
      'phone must be a valid phone number (7-15 digits, optional + prefix)',
  })
  @MaxLength(16)
  phone!: string;

  @ApiProperty({
    description: 'Password credential for the merchant owner account.',
    example: 'Merchant@1234',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password!: string;

  @ApiProperty({
    description: 'Merchant business display name.',
    example: 'Tea House',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    description: 'Merchant support phone number.',
    example: '+95942000000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  supportPhone?: string;

  @ApiPropertyOptional({
    description: 'Requested primary store type code.',
    enum: VALID_STORE_TYPE_CODES,
    example: 'restaurant',
    default: 'restaurant',
  })
  @IsOptional()
  @IsIn([...VALID_STORE_TYPE_CODES], {
    message: `storeType must be one of: ${VALID_STORE_TYPE_CODES.join(', ')}`,
  })
  storeType?: StoreTypeCode;
}

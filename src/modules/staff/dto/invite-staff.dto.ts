import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MerchantStaffRole } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class InviteStaffDto {
  @ApiProperty({ example: '09420000001' })
  @Matches(/^\+?[0-9]{7,15}$/)
  phone!: string;

  @ApiProperty({ example: 'Ko Aung' })
  @IsString()
  @MinLength(1)
  displayName!: string;

  @ApiProperty({ enum: MerchantStaffRole, example: MerchantStaffRole.CASHIER })
  @IsEnum(MerchantStaffRole)
  role!: MerchantStaffRole;

  @ApiProperty({ example: 'Temp@1234' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ type: [String], example: ['branch_1'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  branchIds?: string[];
}

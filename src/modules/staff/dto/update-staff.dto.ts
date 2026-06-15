import { ApiPropertyOptional } from '@nestjs/swagger';
import { MerchantStaffRole, StaffStatus } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateStaffDto {
  @ApiPropertyOptional({ enum: MerchantStaffRole })
  @IsEnum(MerchantStaffRole)
  @IsOptional()
  role?: MerchantStaffRole;

  @ApiPropertyOptional({ enum: StaffStatus })
  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  branchIds?: string[];
}

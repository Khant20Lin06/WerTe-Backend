import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AdminCustomerListQueryDto {
  @ApiPropertyOptional({
    description: 'Filter customers by account status.',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Search by phone number or full name.',
    example: '09',
  })
  @IsString()
  @IsOptional()
  search?: string;
}

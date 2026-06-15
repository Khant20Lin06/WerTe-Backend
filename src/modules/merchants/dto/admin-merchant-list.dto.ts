import { ApiPropertyOptional } from '@nestjs/swagger';
import { MerchantStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class AdminMerchantListQueryDto {
  @ApiPropertyOptional({
    description: 'Filter merchants by status.',
    enum: MerchantStatus,
    example: MerchantStatus.PENDING,
  })
  @IsEnum(MerchantStatus)
  @IsOptional()
  status?: MerchantStatus;
}

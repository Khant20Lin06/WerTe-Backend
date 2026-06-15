import { ApiPropertyOptional } from '@nestjs/swagger';
import { RiderStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class AdminRiderListQueryDto {
  @ApiPropertyOptional({
    description: 'Filter riders by status.',
    enum: RiderStatus,
    example: RiderStatus.PENDING,
  })
  @IsEnum(RiderStatus)
  @IsOptional()
  status?: RiderStatus;
}

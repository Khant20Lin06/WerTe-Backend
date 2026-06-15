import { ApiProperty } from '@nestjs/swagger';
import { RiderStatus } from '@prisma/client';
import { IsEnum, IsNotIn } from 'class-validator';

export class AdminUpdateRiderStatusDto {
  @ApiProperty({
    description: 'New rider status. PENDING cannot be set by admin.',
    enum: [RiderStatus.ACTIVE, RiderStatus.SUSPENDED],
    example: RiderStatus.ACTIVE,
  })
  @IsEnum(RiderStatus)
  @IsNotIn([RiderStatus.PENDING], {
    message: 'Cannot set status back to PENDING.',
  })
  status!: Exclude<RiderStatus, 'PENDING'>;
}

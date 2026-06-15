import { ApiProperty } from '@nestjs/swagger';
import { MerchantStatus } from '@prisma/client';
import { IsEnum, IsNotIn } from 'class-validator';

export class AdminUpdateMerchantStatusDto {
  @ApiProperty({
    description: 'New merchant status. PENDING cannot be set by admin.',
    enum: [MerchantStatus.ACTIVE, MerchantStatus.SUSPENDED],
    example: MerchantStatus.ACTIVE,
  })
  @IsEnum(MerchantStatus)
  @IsNotIn([MerchantStatus.PENDING], {
    message: 'Cannot set status back to PENDING.',
  })
  status!: Exclude<MerchantStatus, 'PENDING'>;
}

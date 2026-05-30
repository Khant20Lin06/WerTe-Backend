import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class ActorContextDto {
  @ApiProperty({
    description: 'Authenticated user identifier.',
    example: 'usr_1',
  })
  userId!: string;

  @ApiProperty({
    description: 'Primary phone number for the authenticated actor.',
    example: '09123456789',
  })
  phone!: string;

  @ApiProperty({
    description: 'Resolved role for the authenticated actor.',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'Current account status for the authenticated actor.',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @ApiPropertyOptional({
    description: 'Customer profile identifier when the actor is a customer.',
    example: 'cust_prof_1',
  })
  customerProfileId?: string;

  @ApiPropertyOptional({
    description: 'Rider identifier when the actor is a rider.',
    example: 'rider_1',
  })
  riderId?: string;

  @ApiPropertyOptional({
    description: 'Merchant identifier when the actor is a merchant user.',
    example: 'merchant_1',
  })
  merchantId?: string;
}

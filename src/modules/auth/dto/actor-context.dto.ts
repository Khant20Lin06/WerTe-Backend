import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MerchantStaffRole, MerchantStatus, RiderStatus, StaffStatus, UserRole, UserStatus } from '@prisma/client';

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
    description: 'Rider onboarding status. Present only for RIDER actors.',
    enum: RiderStatus,
    example: RiderStatus.PENDING,
  })
  riderStatus?: RiderStatus;

  @ApiPropertyOptional({
    description: 'Merchant identifier when the actor is a merchant user.',
    example: 'merchant_1',
  })
  merchantId?: string;

  @ApiPropertyOptional({
    description: 'Merchant onboarding status. Present only for MERCHANT actors.',
    enum: MerchantStatus,
    example: MerchantStatus.PENDING,
  })
  merchantStatus?: MerchantStatus;

  @ApiPropertyOptional({
    description: 'Staff member identifier. Present only for MERCHANT_STAFF actors.',
    example: 'staff_1',
  })
  staffMemberId?: string;

  @ApiPropertyOptional({
    description: 'Staff role. Present only for MERCHANT_STAFF actors.',
    enum: MerchantStaffRole,
    example: MerchantStaffRole.CASHIER,
  })
  staffRole?: MerchantStaffRole;

  @ApiPropertyOptional({
    description: 'Staff account status. Present only for MERCHANT_STAFF actors.',
    enum: StaffStatus,
    example: StaffStatus.ACTIVE,
  })
  staffStatus?: StaffStatus;

  @ApiPropertyOptional({
    description: 'Branch IDs this staff member is assigned to.',
    type: [String],
    example: ['branch_1', 'branch_2'],
  })
  staffBranchIds?: string[];

  @ApiPropertyOptional({
    description: 'Merchant identifier for staff members.',
    example: 'merchant_1',
  })
  staffMerchantId?: string;
}

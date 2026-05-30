import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

import { CustomerProfileOwnershipRecord } from '../entities/customer-profile-ownership.entity';

export class CustomerProfileDto {
  @ApiProperty({
    description: 'Customer profile identifier.',
    example: 'cust_prof_1',
  })
  id!: string;

  @ApiProperty({
    description: 'Primary customer phone number.',
    example: '09123456789',
  })
  phone!: string;

  @ApiPropertyOptional({
    description: 'Customer display name.',
    example: 'Mg Mg',
  })
  fullName?: string | null;

  @ApiPropertyOptional({
    description: 'Customer avatar URL.',
    example: 'https://cdn.example.com/avatar/customer-1.png',
  })
  avatarUrl?: string | null;

  @ApiProperty({
    description: 'Current account status of the customer.',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @ApiProperty({
    description: 'Profile creation timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Profile last update timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  updatedAt!: string;
}

export function toCustomerProfileDto(
  profile: CustomerProfileOwnershipRecord,
): CustomerProfileDto {
  return {
    id: profile.id,
    phone: profile.user.phone,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    status: profile.user.status,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

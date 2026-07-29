import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RiderStatus, UserStatus } from '@prisma/client';

import { RiderOwnershipRecord } from '../entities/rider-ownership.entity';

export type RiderRatingSummary = {
  averageRating: number | null;
  reviewCount: number;
};

export class RiderProfileDto {
  @ApiProperty({
    description: 'Rider identifier.',
    example: 'rider_1',
  })
  id!: string;

  @ApiProperty({
    description: 'Primary rider account phone number.',
    example: '0977777777',
  })
  phone!: string;

  @ApiProperty({
    description: 'Rider display name.',
    example: 'Ko Aung',
  })
  displayName!: string;

  @ApiProperty({
    description: 'Vehicle type used by the rider.',
    example: 'bike',
  })
  vehicleType!: string;

  @ApiPropertyOptional({
    description: 'Vehicle plate number.',
    example: '5J-1234',
    nullable: true,
  })
  plateNumber?: string | null;

  @ApiPropertyOptional({
    description: 'Current operating township for the rider.',
    example: 'Kamaryut',
  })
  currentTownship?: string | null;

  @ApiProperty({
    description: 'Rider operational status.',
    enum: RiderStatus,
    example: RiderStatus.ACTIVE,
  })
  status!: RiderStatus;

  @ApiProperty({
    description: 'Underlying account status for the rider user.',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  accountStatus!: UserStatus;

  @ApiProperty({
    description: 'Rider profile creation timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Rider profile last update timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  updatedAt!: string;

  @ApiProperty({
    description: 'Whether the rider is currently online and accepting deliveries.',
    example: false,
  })
  isOnline!: boolean;

  @ApiPropertyOptional({
    description: 'Average customer rating score for the rider (1-5). Null when no ratings exist.',
    example: 4.8,
    nullable: true,
  })
  averageRating!: number | null;

  @ApiProperty({
    description: 'Total number of ratings submitted for the rider.',
    example: 23,
  })
  reviewCount!: number;
}

export function toRiderProfileDto(
  rider: RiderOwnershipRecord,
  rating?: RiderRatingSummary,
): RiderProfileDto {
  return {
    id: rider.id,
    phone: rider.user.phone,
    displayName: rider.displayName,
    vehicleType: rider.vehicleType,
    plateNumber: rider.plateNumber,
    currentTownship: rider.currentTownship,
    status: rider.status,
    accountStatus: rider.user.status,
    createdAt: rider.createdAt.toISOString(),
    updatedAt: rider.updatedAt.toISOString(),
    isOnline: rider.availability?.isOnline ?? false,
    averageRating: rating?.averageRating ?? null,
    reviewCount: rating?.reviewCount ?? 0,
  };
}

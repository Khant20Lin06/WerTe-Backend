import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RiderStatus, UserStatus } from '@prisma/client';

import { RiderOwnershipRecord } from '../entities/rider-ownership.entity';

export class RiderAvailabilityDto {
  @ApiProperty({
    description: 'Rider identifier.',
    example: 'rider_1',
  })
  riderId!: string;

  @ApiProperty({
    description: 'Rider operational status.',
    enum: RiderStatus,
    example: RiderStatus.ACTIVE,
  })
  status!: RiderStatus;

  @ApiProperty({
    description: 'Underlying account status of the rider.',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  accountStatus!: UserStatus;

  @ApiPropertyOptional({
    description: 'Current operating township for rider dispatch context.',
    example: 'Kamaryut',
  })
  currentTownship?: string | null;

  @ApiProperty({
    description: 'Whether the rider is currently online.',
    example: true,
  })
  isOnline!: boolean;

  @ApiProperty({
    description: 'Whether the rider is currently marked available for dispatch.',
    example: true,
  })
  isAvailable!: boolean;

  @ApiProperty({
    description: 'Whether the rider can currently receive dispatch work.',
    example: true,
  })
  isDispatchEligible!: boolean;

  @ApiPropertyOptional({
    description: 'Last time the rider availability state changed.',
    example: '2026-04-19T08:10:00.000Z',
  })
  lastStatusChangedAt!: string | null;

  @ApiProperty({
    description: 'Last time the current availability snapshot was updated.',
    example: '2026-04-19T08:10:00.000Z',
  })
  updatedAt!: string;
}

export function isRiderDispatchEligible(rider: RiderOwnershipRecord): boolean {
  return (
    rider.status === RiderStatus.ACTIVE &&
    rider.user.status === UserStatus.ACTIVE &&
    rider.availability?.isOnline === true &&
    rider.availability?.isAvailable === true
  );
}

export function toRiderAvailabilityDto(
  rider: RiderOwnershipRecord,
): RiderAvailabilityDto {
  return {
    riderId: rider.id,
    status: rider.status,
    accountStatus: rider.user.status,
    currentTownship: rider.currentTownship,
    isOnline: rider.availability?.isOnline ?? false,
    isAvailable: rider.availability?.isAvailable ?? false,
    isDispatchEligible: isRiderDispatchEligible(rider),
    lastStatusChangedAt:
      rider.availability?.lastStatusChangedAt.toISOString() ?? null,
    updatedAt:
      rider.availability?.updatedAt.toISOString() ?? rider.updatedAt.toISOString(),
  };
}

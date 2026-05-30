import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RiderStatus, UserStatus } from '@prisma/client';

import { RiderOwnershipRecord } from '../entities/rider-ownership.entity';
import {
  isRiderDispatchEligible,
} from './rider-availability.dto';

export class RiderOperationalSummaryDto {
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

  @ApiProperty({
    description: 'Vehicle type used by the rider.',
    example: 'bike',
  })
  vehicleType!: string;

  @ApiPropertyOptional({
    description: 'Current operating township used for dispatch context.',
    example: 'Kamaryut',
  })
  currentTownship?: string | null;

  @ApiProperty({
    description: 'Whether the rider is currently eligible for later dispatch workflows.',
    example: true,
  })
  isDispatchEligible!: boolean;

  @ApiProperty({
    description: 'Whether the rider is currently online.',
    example: true,
  })
  isOnline!: boolean;

  @ApiProperty({
    description: 'Whether the rider is currently available for dispatch work.',
    example: true,
  })
  isAvailable!: boolean;

  @ApiPropertyOptional({
    description: 'Last time the availability state changed.',
    example: '2026-04-19T08:10:00.000Z',
  })
  lastStatusChangedAt!: string | null;

  @ApiProperty({
    description: 'Snapshot timestamp based on the rider record update time.',
    example: '2026-04-19T08:00:00.000Z',
  })
  updatedAt!: string;
}

export function toRiderOperationalSummaryDto(
  rider: RiderOwnershipRecord,
): RiderOperationalSummaryDto {
  return {
    riderId: rider.id,
    status: rider.status,
    accountStatus: rider.user.status,
    vehicleType: rider.vehicleType,
    currentTownship: rider.currentTownship,
    isDispatchEligible: isRiderDispatchEligible(rider),
    isOnline: rider.availability?.isOnline ?? false,
    isAvailable: rider.availability?.isAvailable ?? false,
    lastStatusChangedAt:
      rider.availability?.lastStatusChangedAt.toISOString() ?? null,
    updatedAt:
      rider.availability?.updatedAt.toISOString() ?? rider.updatedAt.toISOString(),
  };
}

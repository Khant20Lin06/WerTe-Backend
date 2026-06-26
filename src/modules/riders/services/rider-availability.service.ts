import { HttpStatus, Injectable } from '@nestjs/common';
import { RiderStatus, UserStatus } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { QueueJobNames, QueueNames } from '../../../infrastructure/queue/queue.constants';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { RiderOwnershipRecord } from '../entities/rider-ownership.entity';
import {
  RiderAvailabilityDto,
  toRiderAvailabilityDto,
} from '../dto/rider-availability.dto';
import { RidersRepository } from '../repositories/riders.repository';
import { RiderAccountService } from './rider-account.service';

@Injectable()
export class RiderAvailabilityService {
  constructor(
    private readonly riderAccountService: RiderAccountService,
    private readonly ridersRepository: RidersRepository,
    private readonly queueService: QueueService,
  ) {}

  async getCurrentAvailability(
    currentUser: AuthenticatedUserEntity,
  ): Promise<RiderAvailabilityDto> {
    const rider = await this.riderAccountService.resolveOwnedRider(currentUser);

    return toRiderAvailabilityDto(rider);
  }

  async markCurrentRiderOnline(
    currentUser: AuthenticatedUserEntity,
  ): Promise<RiderAvailabilityDto> {
    const rider = await this.riderAccountService.resolveOwnedRider(currentUser);

    this.assertCanGoOnline(rider);

    if (
      rider.availability?.isOnline === true &&
      rider.availability?.isAvailable === true
    ) {
      return toRiderAvailabilityDto(rider);
    }

    const updatedRider = await this.ridersRepository.upsertAvailability(rider.id, {
      isOnline: true,
      isAvailable: true,
      lastStatusChangedAt: new Date(),
    });

    // Trigger auto-dispatch scan for any pending READY orders.
    await this.queueService.add(
      QueueNames.dispatch,
      QueueJobNames.dispatch.autoDispatchPendingForRider,
      { riderId: rider.id, township: rider.currentTownship ?? null },
      { delayMs: 500 },
    );

    return toRiderAvailabilityDto(updatedRider);
  }

  async markCurrentRiderOffline(
    currentUser: AuthenticatedUserEntity,
  ): Promise<RiderAvailabilityDto> {
    const rider = await this.riderAccountService.resolveOwnedRider(currentUser);

    if (
      rider.availability?.isOnline === false &&
      rider.availability?.isAvailable === false
    ) {
      return toRiderAvailabilityDto(rider);
    }

    const updatedRider = await this.ridersRepository.upsertAvailability(rider.id, {
      isOnline: false,
      isAvailable: false,
      lastStatusChangedAt: new Date(),
    });

    return toRiderAvailabilityDto(updatedRider);
  }

  private assertCanGoOnline(rider: RiderOwnershipRecord): void {
    if (rider.user.status !== UserStatus.ACTIVE || rider.status !== RiderStatus.ACTIVE) {
      throw new AppException(
        'Only active rider accounts can go online for dispatch.',
        HttpStatus.CONFLICT,
        {
          code: ErrorCodes.conflict,
        },
      );
    }
  }
}

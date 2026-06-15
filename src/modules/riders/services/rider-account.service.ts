import { HttpStatus, Injectable } from '@nestjs/common';
import { RiderStatus } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { RiderOwnershipRecord } from '../entities/rider-ownership.entity';
import {
  RiderOperationalSummaryDto,
  toRiderOperationalSummaryDto,
} from '../dto/rider-operational-summary.dto';
import { RiderProfileDto, toRiderProfileDto } from '../dto/rider-profile.dto';
import { UpdateRiderProfileDto } from '../dto/update-rider-profile.dto';
import { RiderPolicyService } from '../policies/rider-policy.service';
import { RidersRepository } from '../repositories/riders.repository';
import { RidersService } from './riders.service';

@Injectable()
export class RiderAccountService {
  constructor(
    private readonly ridersService: RidersService,
    private readonly ridersRepository: RidersRepository,
    private readonly riderPolicyService: RiderPolicyService,
  ) {}

  async getCurrentRiderProfile(
    currentUser: AuthenticatedUserEntity,
  ): Promise<RiderProfileDto> {
    const rider = await this.resolveOwnedRider(currentUser);

    return toRiderProfileDto(rider);
  }

  async updateCurrentRiderProfile(
    currentUser: AuthenticatedUserEntity,
    payload: UpdateRiderProfileDto,
  ): Promise<RiderProfileDto> {
    const rider = await this.resolveOwnedRider(currentUser);
    const updatedRider = await this.ridersRepository.update(rider.id, {
      ...(payload.displayName !== undefined
        ? { displayName: payload.displayName }
        : {}),
      ...(payload.vehicleType !== undefined
        ? { vehicleType: payload.vehicleType }
        : {}),
      ...(payload.currentTownship !== undefined
        ? { currentTownship: payload.currentTownship }
        : {}),
    });

    return toRiderProfileDto(updatedRider);
  }

  async getOperationalSummary(
    currentUser: AuthenticatedUserEntity,
  ): Promise<RiderOperationalSummaryDto> {
    const rider = await this.resolveOwnedRider(currentUser);

    return toRiderOperationalSummaryDto(rider);
  }

  async resolveOwnedRider(
    currentUser: AuthenticatedUserEntity,
  ): Promise<RiderOwnershipRecord> {
    const actorRiderId = currentUser.actorContext.riderId;
    const rider =
      actorRiderId !== undefined
        ? await this.ridersService.findOwnedByUserId(
            currentUser.userId,
            actorRiderId,
          )
        : await this.ridersService.findByUserId(currentUser.userId);

    if (rider === null) {
      throw new AppException(
        'Rider profile was not found for the authenticated user.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    if (rider.status === RiderStatus.PENDING) {
      throw new AppException(
        'Your rider account is pending admin approval.',
        HttpStatus.FORBIDDEN,
        { code: ErrorCodes.accountPending },
      );
    }

    if (rider.status === RiderStatus.SUSPENDED) {
      throw new AppException(
        'Your rider account has been suspended.',
        HttpStatus.FORBIDDEN,
        { code: ErrorCodes.accountSuspended },
      );
    }

    if (!this.riderPolicyService.canAccessRider(currentUser, rider)) {
      throw new AppException(
        'You are not allowed to access this rider profile.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return rider;
  }
}

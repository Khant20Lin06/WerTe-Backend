import { HttpStatus, Injectable } from '@nestjs/common';
import {
  Prisma,
  RatingTargetType,
  RiderDocumentType,
  RiderStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { RatingsService } from '../../ratings/ratings.service';
import { RiderOwnershipRecord } from '../entities/rider-ownership.entity';
import {
  RiderOperationalSummaryDto,
  toRiderOperationalSummaryDto,
} from '../dto/rider-operational-summary.dto';
import {
  RiderProfileDto,
  RiderRatingSummary,
  toRiderProfileDto,
} from '../dto/rider-profile.dto';
import { UpdateRiderProfileDto } from '../dto/update-rider-profile.dto';
import {
  RiderWeeklyScheduleDto,
  UpdateRiderWeeklyScheduleDto,
  toRiderWeeklyScheduleDto,
} from '../dto/rider-weekly-schedule.dto';
import { RiderDocumentDto, toRiderDocumentDto } from '../dto/rider-document.dto';
import {
  RiderPayoutMethodDto,
  UpdateRiderPayoutMethodDto,
  toRiderPayoutMethodDto,
} from '../dto/rider-payout-method.dto';
import { RiderPolicyService } from '../policies/rider-policy.service';
import { RidersRepository } from '../repositories/riders.repository';
import { UploadsService } from '../../uploads/services/uploads.service';
import { RidersService } from './riders.service';

@Injectable()
export class RiderAccountService {
  constructor(
    private readonly ridersService: RidersService,
    private readonly ridersRepository: RidersRepository,
    private readonly riderPolicyService: RiderPolicyService,
    private readonly ratingsService: RatingsService,
    private readonly uploadsService: UploadsService,
  ) {}

  async getCurrentRiderProfile(
    currentUser: AuthenticatedUserEntity,
  ): Promise<RiderProfileDto> {
    const rider = await this.resolveOwnedRider(currentUser);
    const rating = await this.fetchRiderRating(rider.id);

    return toRiderProfileDto(rider, rating);
  }

  private async fetchRiderRating(riderId: string): Promise<RiderRatingSummary> {
    const { average, count } = await this.ratingsService.getTargetRatings(
      RatingTargetType.RIDER,
      riderId,
    );
    return {
      averageRating: count > 0 ? Math.round(average * 10) / 10 : null,
      reviewCount: count,
    };
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
      ...(payload.plateNumber !== undefined
        ? { plateNumber: payload.plateNumber }
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

  async getCurrentRiderWeeklySchedule(
    currentUser: AuthenticatedUserEntity,
  ): Promise<RiderWeeklyScheduleDto> {
    const rider = await this.resolveOwnedRider(currentUser);
    return toRiderWeeklyScheduleDto(rider.weeklySchedule);
  }

  async updateCurrentRiderWeeklySchedule(
    currentUser: AuthenticatedUserEntity,
    payload: UpdateRiderWeeklyScheduleDto,
  ): Promise<RiderWeeklyScheduleDto> {
    const rider = await this.resolveOwnedRider(currentUser);
    const updatedRider = await this.ridersRepository.update(rider.id, {
      weeklySchedule: payload as unknown as Prisma.InputJsonValue,
    });
    return toRiderWeeklyScheduleDto(updatedRider.weeklySchedule);
  }

  async getCurrentRiderDocuments(
    currentUser: AuthenticatedUserEntity,
  ): Promise<RiderDocumentDto[]> {
    const rider = await this.resolveOwnedRiderForDocuments(currentUser);
    const documents = await this.ridersRepository.findDocumentsByRiderId(
      rider.id,
    );
    return documents.map(toRiderDocumentDto);
  }

  async uploadCurrentRiderDocument(
    currentUser: AuthenticatedUserEntity,
    type: RiderDocumentType,
    file: Express.Multer.File,
  ): Promise<RiderDocumentDto> {
    const rider = await this.resolveOwnedRiderForDocuments(currentUser);
    const uploaded = await this.uploadsService.uploadFile(
      file,
      'rider-documents',
      rider.id,
    );
    const document = await this.ridersRepository.replaceDocument(rider.id, type, {
      fileKey: uploaded.key,
      fileUrl: uploaded.url,
    });
    return toRiderDocumentDto(document);
  }

  async getCurrentRiderPayoutMethod(
    currentUser: AuthenticatedUserEntity,
  ): Promise<RiderPayoutMethodDto | null> {
    const rider = await this.resolveOwnedRiderForDocuments(currentUser);
    const method = await this.ridersRepository.findPayoutMethodByRiderId(
      rider.id,
    );
    return method === null ? null : toRiderPayoutMethodDto(method);
  }

  async updateCurrentRiderPayoutMethod(
    currentUser: AuthenticatedUserEntity,
    payload: UpdateRiderPayoutMethodDto,
  ): Promise<RiderPayoutMethodDto> {
    const rider = await this.resolveOwnedRiderForDocuments(currentUser);
    const method = await this.ridersRepository.upsertPayoutMethod(rider.id, {
      type: payload.type,
      accountName: payload.accountName,
      accountNumber: payload.accountNumber,
      bankName: payload.bankName ?? null,
    });
    return toRiderPayoutMethodDto(method);
  }

  /**
   * Documents must be uploadable while the rider account is still PENDING
   * admin approval (that is the whole point of verification), so this skips
   * the PENDING gate in resolveOwnedRider while still blocking SUSPENDED
   * riders and enforcing ownership/policy checks.
   */
  private async resolveOwnedRiderForDocuments(
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
        { code: ErrorCodes.notFound },
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
        { code: ErrorCodes.forbidden },
      );
    }

    return rider;
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

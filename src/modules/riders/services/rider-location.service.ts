import { HttpStatus, Injectable } from '@nestjs/common';
import { RiderStatus, UserStatus } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { DeliveriesRepository } from '../../deliveries/repositories/deliveries.repository';
import { IngestRiderLocationDto } from '../dto/ingest-rider-location.dto';
import { RiderLocationDto } from '../dto/rider-location.dto';
import { RiderCurrentLocation } from '../entities/rider-ownership.entity';
import { RidersRepository } from '../repositories/riders.repository';
import {
  canIngestRiderLocation,
  isDuplicateRiderLocation,
} from '../policies/rider-location-policy.helper';
import { RiderAccountService } from './rider-account.service';

@Injectable()
export class RiderLocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly riderAccountService: RiderAccountService,
    private readonly ridersRepository: RidersRepository,
    private readonly deliveriesRepository: DeliveriesRepository,
  ) {}

  async ingestCurrentRiderLocation(
    currentUser: AuthenticatedUserEntity,
    payload: IngestRiderLocationDto,
  ): Promise<RiderLocationDto> {
    const rider = await this.riderAccountService.resolveOwnedRider(currentUser);
    const activeDelivery = await this.deliveriesRepository.findRiderActiveDelivery(
      rider.id,
    );

    if (!canIngestRiderLocation(rider, activeDelivery !== null)) {
      throw new AppException(
        'Rider location updates require an active rider account that is online or actively delivering an order.',
        HttpStatus.CONFLICT,
        {
          code: ErrorCodes.conflict,
        },
      );
    }

    const currentLocation =
      await this.ridersRepository.findCurrentLocationByRiderId(rider.id);
    const locationPayload = {
      deliveryId: activeDelivery?.id ?? null,
      latitude: payload.latitude,
      longitude: payload.longitude,
      heading: payload.heading ?? null,
      speed: payload.speed ?? null,
      accuracyMeters: payload.accuracyMeters ?? null,
      recordedAt: new Date(payload.recordedAt),
    };

    if (isDuplicateRiderLocation(currentLocation, locationPayload)) {
      return this.toRiderLocationDto(rider.id, currentLocation, true);
    }

    const snapshot = await this.prisma.runInTransaction(async (tx) => {
      const updatedCurrentLocation = await this.ridersRepository.upsertCurrentLocation(
        rider.id,
        locationPayload,
        tx,
      );

      await this.ridersRepository.createLocationHistory(
        rider.id,
        locationPayload,
        tx,
      );

      return updatedCurrentLocation;
    });

    return this.toRiderLocationDto(rider.id, snapshot, false);
  }

  private toRiderLocationDto(
    riderId: string,
    location: RiderCurrentLocation,
    duplicate: boolean,
  ): RiderLocationDto {
    return {
      riderId,
      deliveryId: location.deliveryId,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      heading: location.heading?.toString() ?? null,
      speed: location.speed?.toString() ?? null,
      accuracyMeters: location.accuracyMeters?.toString() ?? null,
      recordedAt: location.recordedAt.toISOString(),
      duplicate,
    };
  }
}

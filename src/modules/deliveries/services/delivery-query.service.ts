import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import {
  buildDeliveryDetail,
  DeliveryDetailEntity,
  DeliveryDetailRecord,
} from '../entities/delivery-detail.entity';
import { DeliveriesRepository } from '../repositories/deliveries.repository';

@Injectable()
export class DeliveryQueryService {
  constructor(private readonly deliveriesRepository: DeliveriesRepository) {}

  buildDeliveryDetail(delivery: DeliveryDetailRecord): DeliveryDetailEntity {
    return buildDeliveryDetail(delivery);
  }

  async getDeliveryDetail(deliveryId: string): Promise<DeliveryDetailEntity> {
    const delivery = await this.deliveriesRepository.findById(deliveryId);

    return this.mapRequiredDelivery(delivery);
  }

  async getOrderDeliveryDetail(orderId: string): Promise<DeliveryDetailEntity> {
    const delivery = await this.deliveriesRepository.findByOrderId(orderId);

    return this.mapRequiredDelivery(delivery);
  }

  async getRiderActiveDelivery(
    currentUser: AuthenticatedUserEntity,
  ): Promise<DeliveryDetailEntity | null> {
    const riderId = this.requireRiderId(currentUser);
    const delivery = await this.deliveriesRepository.findRiderActiveDelivery(
      riderId,
    );

    return delivery === null ? null : this.buildDeliveryDetail(delivery);
  }

  async getRiderDeliveryDetail(
    currentUser: AuthenticatedUserEntity,
    deliveryId: string,
  ): Promise<DeliveryDetailEntity> {
    const riderId = this.requireRiderId(currentUser);
    const delivery = await this.deliveriesRepository.findRiderDeliveryById(
      deliveryId,
      riderId,
    );

    return this.mapRequiredDelivery(delivery);
  }

  private mapRequiredDelivery(
    delivery: DeliveryDetailRecord | null,
  ): DeliveryDetailEntity {
    if (delivery === null) {
      throw new AppException('Delivery was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    return this.buildDeliveryDetail(delivery);
  }

  private requireRiderId(currentUser: AuthenticatedUserEntity): string {
    const riderId = currentUser.actorContext.riderId;

    if (riderId === undefined) {
      throw new AppException(
        'The authenticated actor does not have a rider scope.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return riderId;
  }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import {
  DeliveryStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  SystemMessageCode,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { QueueJobNames, QueueNames } from '../../../infrastructure/queue/queue.constants';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import {
  DeliveryDetailEntity,
  DeliveryDetailRecord,
} from '../entities/delivery-detail.entity';
import {
  canRiderAcceptDeliveryRequest,
  canRiderMarkDeliveryDelivered,
  canRiderMarkDeliveryFailed,
  canRiderMarkDeliveryOnTheWay,
  canRiderMarkDeliveryPickedUp,
  canRiderRejectDeliveryRequest,
} from '../policies/rider-delivery-policy.helper';
import { DeliveriesRepository } from '../repositories/deliveries.repository';
import { DeliveryQueryService } from './delivery-query.service';

type RiderDeliveryActionInput = {
  deliveryId: string;
  reasonCode?: string;
  note?: string;
};

type RiderDeliveryTransitionConfig = {
  targetOrderStatus: OrderStatus;
  targetDeliveryStatus: DeliveryStatus;
  defaultReasonCode?: string;
  conflictMessage: string;
  reloadUnscoped?: boolean;
  requireReasonCode?: boolean;
  systemMessageCode: SystemMessageCode;
  canTransition: (
    currentUser: AuthenticatedUserEntity,
    delivery: DeliveryDetailRecord,
  ) => boolean;
  buildDeliveryUpdate: (input: {
    delivery: DeliveryDetailRecord;
    now: Date;
    reasonCode: string | null;
    note: string | null;
  }) => Prisma.DeliveryUpdateInput;
};

@Injectable()
export class RiderDeliveryActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deliveriesRepository: DeliveriesRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly deliveryQueryService: DeliveryQueryService,
    private readonly systemMessageService: SystemMessageService,
    private readonly queueService: QueueService,
  ) {}

  acceptCurrentRiderDeliveryRequest(
    currentUser: AuthenticatedUserEntity,
    input: RiderDeliveryActionInput,
  ): Promise<DeliveryDetailEntity> {
    return this.handleTransition(currentUser, input, {
      targetOrderStatus: OrderStatus.RIDER_ACCEPTED,
      targetDeliveryStatus: DeliveryStatus.ACCEPTED,
      defaultReasonCode: 'rider_accepted_assignment',
      conflictMessage: 'This delivery request can no longer be accepted.',
      systemMessageCode: 'RIDER_ACCEPTED',
      canTransition: canRiderAcceptDeliveryRequest,
      buildDeliveryUpdate: ({ now }) => ({
        status: DeliveryStatus.ACCEPTED,
        acceptedAt: now,
      }),
    });
  }

  async rejectCurrentRiderDeliveryRequest(
    currentUser: AuthenticatedUserEntity,
    input: RiderDeliveryActionInput,
  ): Promise<DeliveryDetailEntity> {
    const result = await this.handleTransition(currentUser, input, {
      targetOrderStatus: OrderStatus.MERCHANT_ACCEPTED,
      targetDeliveryStatus: DeliveryStatus.PENDING_ASSIGNMENT,
      defaultReasonCode: 'rider_rejected_assignment',
      conflictMessage: 'This delivery request can no longer be rejected.',
      systemMessageCode: 'RIDER_REJECTED_ASSIGNMENT',
      reloadUnscoped: true,
      canTransition: canRiderRejectDeliveryRequest,
      buildDeliveryUpdate: () => ({
        riderId: null,
        status: DeliveryStatus.PENDING_ASSIGNMENT,
        etaMinutes: null,
        acceptedAt: null,
        pickedUpAt: null,
        onTheWayAt: null,
        deliveredAt: null,
        failedAt: null,
        cancelledAt: null,
        failureReasonCode: null,
        failureNote: null,
      }),
    });

    // Re-dispatch after rider rejection so another rider can be assigned.
    await this.queueService.add(
      QueueNames.dispatch,
      QueueJobNames.dispatch.autoDispatchOrder,
      { orderId: result.orderId },
      { delayMs: 500 },
    );

    return result;
  }

  markCurrentRiderPickedUp(
    currentUser: AuthenticatedUserEntity,
    input: RiderDeliveryActionInput,
  ): Promise<DeliveryDetailEntity> {
    return this.handleTransition(currentUser, input, {
      targetOrderStatus: OrderStatus.PICKED_UP,
      targetDeliveryStatus: DeliveryStatus.PICKED_UP,
      defaultReasonCode: 'rider_picked_up_order',
      conflictMessage: 'This delivery can no longer be marked as picked up.',
      systemMessageCode: 'ORDER_PICKED_UP',
      canTransition: canRiderMarkDeliveryPickedUp,
      buildDeliveryUpdate: ({ now }) => ({
        status: DeliveryStatus.PICKED_UP,
        pickedUpAt: now,
      }),
    });
  }

  markCurrentRiderOnTheWay(
    currentUser: AuthenticatedUserEntity,
    input: RiderDeliveryActionInput,
  ): Promise<DeliveryDetailEntity> {
    return this.handleTransition(currentUser, input, {
      targetOrderStatus: OrderStatus.ON_THE_WAY,
      targetDeliveryStatus: DeliveryStatus.ON_THE_WAY,
      defaultReasonCode: 'rider_on_the_way',
      conflictMessage: 'This delivery can no longer be marked as on the way.',
      systemMessageCode: 'ORDER_ON_THE_WAY',
      canTransition: canRiderMarkDeliveryOnTheWay,
      buildDeliveryUpdate: ({ now }) => ({
        status: DeliveryStatus.ON_THE_WAY,
        onTheWayAt: now,
      }),
    });
  }

  markCurrentRiderDelivered(
    currentUser: AuthenticatedUserEntity,
    input: RiderDeliveryActionInput,
  ): Promise<DeliveryDetailEntity> {
    return this.handleTransition(currentUser, input, {
      targetOrderStatus: OrderStatus.DELIVERED,
      targetDeliveryStatus: DeliveryStatus.DELIVERED,
      defaultReasonCode: 'rider_delivered_order',
      conflictMessage: 'This delivery can no longer be marked as delivered.',
      systemMessageCode: 'ORDER_DELIVERED',
      canTransition: canRiderMarkDeliveryDelivered,
      buildDeliveryUpdate: ({ now }) => ({
        status: DeliveryStatus.DELIVERED,
        deliveredAt: now,
      }),
    });
  }

  failCurrentRiderDelivery(
    currentUser: AuthenticatedUserEntity,
    input: RiderDeliveryActionInput,
  ): Promise<DeliveryDetailEntity> {
    return this.handleTransition(currentUser, input, {
      targetOrderStatus: OrderStatus.FAILED_DELIVERY,
      targetDeliveryStatus: DeliveryStatus.FAILED,
      conflictMessage: 'This delivery can no longer be marked as failed.',
      systemMessageCode: 'FAILED_DELIVERY',
      requireReasonCode: true,
      canTransition: canRiderMarkDeliveryFailed,
      buildDeliveryUpdate: ({ now, reasonCode, note }) => ({
        status: DeliveryStatus.FAILED,
        failedAt: now,
        failureReasonCode: reasonCode,
        failureNote: note,
      }),
    });
  }

  private async handleTransition(
    currentUser: AuthenticatedUserEntity,
    input: RiderDeliveryActionInput,
    config: RiderDeliveryTransitionConfig,
  ): Promise<DeliveryDetailEntity> {
    const riderId = this.requireRiderId(currentUser);
    const delivery = await this.deliveriesRepository.findRiderDeliveryById(
      input.deliveryId,
      riderId,
    );

    if (delivery === null) {
      throw new AppException('Delivery was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (
      delivery.order.status === config.targetOrderStatus &&
      delivery.status === config.targetDeliveryStatus
    ) {
      return this.deliveryQueryService.buildDeliveryDetail(delivery);
    }

    if (!config.canTransition(currentUser, delivery)) {
      throw new AppException(config.conflictMessage, HttpStatus.CONFLICT, {
        code: ErrorCodes.conflict,
      });
    }

    const reasonCode = config.requireReasonCode
      ? this.requireReasonCode(input.reasonCode)
      : this.normalizeOptionalString(input.reasonCode) ??
        config.defaultReasonCode ??
        null;
    const note = this.normalizeOptionalString(input.note);
    const now = new Date();

    await this.prisma.runInTransaction(async (tx) => {
      await this.deliveriesRepository.updateById(
        delivery.id,
        config.buildDeliveryUpdate({
          delivery,
          now,
          reasonCode,
          note,
        }),
        tx,
      );

      await this.ordersRepository.updateOrderStatus(
        delivery.orderId,
        {
          status: config.targetOrderStatus,
          fromStatus: delivery.order.status,
          changedByUserId: currentUser.userId,
          reasonCode: reasonCode ?? undefined,
          note,
        },
        tx,
      );

      // Auto-settle COD payment when rider marks order as delivered.
      if (config.targetOrderStatus === OrderStatus.DELIVERED) {
        await tx.payment.updateMany({
          where: {
            orderId: delivery.orderId,
            method: PaymentMethod.CASH_ON_DELIVERY,
            status: PaymentStatus.PENDING,
          },
          data: {
            status: PaymentStatus.SUCCEEDED,
            succeededAt: now,
          },
        });
      }
    });

    const updatedDelivery = config.reloadUnscoped
      ? await this.deliveriesRepository.findById(input.deliveryId)
      : await this.deliveriesRepository.findRiderDeliveryById(
          input.deliveryId,
          riderId,
        );

    if (updatedDelivery === null) {
      throw new AppException('Delivery was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    await this.systemMessageService.publishOrderEvent(currentUser, {
      orderId: delivery.orderId,
      code: config.systemMessageCode,
      metadata: {
        actorUserId: currentUser.userId,
        deliveryId: delivery.id,
        reasonCode,
        note,
        targetOrderStatus: config.targetOrderStatus,
        targetDeliveryStatus: config.targetDeliveryStatus,
      },
      templateVariables: {
        reasonCode,
        note,
      },
    });

    return this.deliveryQueryService.buildDeliveryDetail(updatedDelivery);
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

  private requireReasonCode(reasonCode: string | undefined): string {
    const normalizedReasonCode = this.normalizeOptionalString(reasonCode);

    if (normalizedReasonCode === null) {
      throw new AppException(
        'A reason code is required for failed deliveries.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    return normalizedReasonCode;
  }

  private normalizeOptionalString(value: string | undefined | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalized = value.trim();

    return normalized.length === 0 ? null : normalized;
  }
}

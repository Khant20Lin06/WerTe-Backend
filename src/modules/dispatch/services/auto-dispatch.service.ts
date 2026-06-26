import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { AppLogger } from '../../../infrastructure/logging/app.logger';
import { QueueJobNames, QueueNames } from '../../../infrastructure/queue/queue.constants';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { createSystemAuthenticatedActor } from '../../auth/entities/system-authenticated-actor.helper';
import { DeliveriesRepository } from '../../deliveries/repositories/deliveries.repository';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { RidersService } from '../../riders/services/riders.service';
import { RiderOwnershipRecord } from '../../riders/entities/rider-ownership.entity';
import { DispatchRepository } from '../repositories/dispatch.repository';
import { isDispatchEligibleRider } from '../policies/dispatch-assignment-policy.helper';

type AutoDispatchOrderPayload = { orderId: string };
type AutoDispatchForRiderPayload = { riderId: string; township: string | null };

@Injectable()
export class AutoDispatchService {
  constructor(
    private readonly logger: AppLogger,
    private readonly queueService: QueueService,
    private readonly prisma: PrismaService,
    private readonly dispatchRepository: DispatchRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly deliveriesRepository: DeliveriesRepository,
    private readonly ridersService: RidersService,
    private readonly systemMessageService: SystemMessageService,
  ) {}

  // ── Queue helpers ─────────────────────────────────────────────────────────

  enqueueForOrder(orderId: string): Promise<unknown> {
    return this.queueService.add(
      QueueNames.dispatch,
      QueueJobNames.dispatch.autoDispatchOrder,
      { orderId } satisfies AutoDispatchOrderPayload,
      { delayMs: 500 },
    );
  }

  enqueueForRider(riderId: string, township: string | null): Promise<unknown> {
    return this.queueService.add(
      QueueNames.dispatch,
      QueueJobNames.dispatch.autoDispatchPendingForRider,
      { riderId, township } satisfies AutoDispatchForRiderPayload,
      { delayMs: 500 },
    );
  }

  // ── Job handler registration (called from module init) ────────────────────

  registerHandlers(): void {
    this.queueService.registerHandler(
      QueueNames.dispatch,
      QueueJobNames.dispatch.autoDispatchOrder,
      async (payload) => {
        const { orderId } = payload as AutoDispatchOrderPayload;
        await this.handleAutoDispatchOrder(orderId);
      },
    );

    this.queueService.registerHandler(
      QueueNames.dispatch,
      QueueJobNames.dispatch.autoDispatchPendingForRider,
      async (payload) => {
        const { riderId, township } = payload as AutoDispatchForRiderPayload;
        await this.handleAutoDispatchForRider(riderId, township);
      },
    );
  }

  // ── Core logic ────────────────────────────────────────────────────────────

  private async handleAutoDispatchOrder(orderId: string): Promise<void> {
    // Verify order is still MERCHANT_ACCEPTED, has no delivery, and is a DELIVERY (not PICKUP) order.
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        status: OrderStatus.MERCHANT_ACCEPTED,
        delivery: { is: null },
        deliveryType: 'DELIVERY',
      },
      select: { id: true, deliveryTownship: true },
    });

    if (order === null) {
      this.logger.debugEvent(
        'Auto-dispatch skipped: order not MERCHANT_ACCEPTED or already has delivery.',
        { orderId },
        'AutoDispatchService',
      );
      return;
    }

    const township = order.deliveryTownship ?? null;
    const rider = await this.pickEligibleRider(township);

    if (rider === null) {
      this.logger.debugEvent(
        'Auto-dispatch deferred: no eligible rider found for order.',
        { orderId, township },
        'AutoDispatchService',
      );
      return;
    }

    await this.assignAndNotify(orderId, rider);
  }

  private async handleAutoDispatchForRider(
    riderId: string,
    township: string | null,
  ): Promise<void> {
    const rider = await this.ridersService.findById(riderId);

    if (rider === null || !isDispatchEligibleRider(rider)) {
      this.logger.debugEvent(
        'Auto-dispatch-for-rider skipped: rider not eligible.',
        { riderId },
        'AutoDispatchService',
      );
      return;
    }

    // Try township-matched first, then any READY order.
    const orders = await this.dispatchRepository.findReadyOrdersWithoutRider({
      township,
      limit: 1,
    });

    if (orders.length === 0) {
      // No township match — try without township filter.
      const fallback = await this.dispatchRepository.findReadyOrdersWithoutRider({
        limit: 1,
      });
      if (fallback.length === 0) {
        this.logger.debugEvent(
          'Auto-dispatch-for-rider: no pending READY orders.',
          { riderId, township },
          'AutoDispatchService',
        );
        return;
      }
      await this.assignAndNotify(fallback[0].id, rider);
      return;
    }

    await this.assignAndNotify(orders[0].id, rider);
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  private async pickEligibleRider(
    township: string | null,
  ): Promise<RiderOwnershipRecord | null> {
    if (township !== null) {
      const matched = await this.ridersService.findEligibleRiders({ township });
      if (matched.length > 0) return matched[0];
    }
    const any = await this.ridersService.findEligibleRiders();
    return any.length > 0 ? any[0] : null;
  }

  private async assignAndNotify(
    orderId: string,
    rider: RiderOwnershipRecord,
  ): Promise<void> {
    const systemActor = createSystemAuthenticatedActor('auto-dispatch');
    const assignedAt = new Date();

    try {
      await this.prisma.runInTransaction(async (tx) => {
        await this.deliveriesRepository.upsertAssignedDelivery(
          orderId,
          { riderId: rider.id, etaMinutes: null, assignedAt },
          tx,
        );

        await this.ordersRepository.updateOrderStatus(
          orderId,
          {
            status: OrderStatus.RIDER_ASSIGNED,
            fromStatus: OrderStatus.MERCHANT_ACCEPTED,
            changedByUserId: systemActor.userId,
            reasonCode: 'auto_dispatched',
            note: null,
          },
          tx,
        );
      });

      this.logger.debugEvent(
        'Auto-dispatch: rider assigned.',
        { orderId, riderId: rider.id },
        'AutoDispatchService',
      );
    } catch (err) {
      this.logger.errorEvent(
        'Auto-dispatch: assignment transaction failed.',
        { orderId, riderId: rider.id, error: String(err) },
        'AutoDispatchService',
      );
      return;
    }

    await this.systemMessageService.publishOrderEvent(systemActor, {
      orderId,
      code: 'RIDER_ASSIGNED',
      metadata: {
        actorUserId: systemActor.userId,
        riderId: rider.id,
        etaMinutes: null,
        reasonCode: 'auto_dispatched',
        note: null,
      },
      templateVariables: {
        riderName: rider.displayName,
        reasonCode: 'auto_dispatched',
        note: null,
      },
    });
  }
}

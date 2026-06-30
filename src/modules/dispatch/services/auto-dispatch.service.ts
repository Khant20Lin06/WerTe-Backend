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
import { OrderCancellationService } from '../../orders/services/order-cancellation.service';
import { RidersService } from '../../riders/services/riders.service';
import { RiderOwnershipRecord } from '../../riders/entities/rider-ownership.entity';
import { DispatchRepository } from '../repositories/dispatch.repository';
import { isDispatchEligibleRider } from '../policies/dispatch-assignment-policy.helper';

type AutoDispatchOrderPayload = { orderId: string };
type AutoDispatchForRiderPayload = { riderId: string; township: string | null };
type RiderDispatchTimeoutPayload = { orderId: string; attemptId: string };

const MAX_FAILED_ATTEMPTS = 3;
const RIDER_ACCEPT_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const SYSTEM_ACTOR_ID = createSystemAuthenticatedActor('auto-dispatch').userId;

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
    private readonly orderCancellationService: OrderCancellationService,
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

    this.queueService.registerHandler(
      QueueNames.dispatch,
      QueueJobNames.dispatch.riderDispatchTimeout,
      async (payload) => {
        const { orderId, attemptId } = payload as RiderDispatchTimeoutPayload;
        await this.handleRiderDispatchTimeout(orderId, attemptId);
      },
    );
  }

  // ── Core logic ────────────────────────────────────────────────────────────

  private async handleAutoDispatchOrder(orderId: string): Promise<void> {
    // A Delivery row persists across rejections/cancellations (reset to
    // PENDING_ASSIGNMENT with riderId: null) — only `riderId: null` means
    // the order genuinely needs a rider. Checking `delivery: { is: null }`
    // would wrongly skip every order that already had a rejected attempt.
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        status: OrderStatus.MERCHANT_ACCEPTED,
        deliveryType: 'DELIVERY',
        OR: [{ delivery: { is: null } }, { delivery: { is: { riderId: null } } }],
      },
      select: { id: true, deliveryTownship: true },
    });

    if (order === null) {
      this.logger.debugEvent(
        'Auto-dispatch skipped: order not MERCHANT_ACCEPTED or already has a rider assigned.',
        { orderId },
        'AutoDispatchService',
      );
      return;
    }

    // Check if the order has already exhausted the max dispatch attempts (from prior rejections).
    const failedCount = await this.prisma.orderDispatchAttempt.count({
      where: {
        orderId,
        outcomeCode: { in: ['timeout', 'rejected'] },
      },
    });

    if (failedCount >= MAX_FAILED_ATTEMPTS) {
      await this.cancelOrderNoRider(orderId);
      return;
    }

    const township = order.deliveryTownship ?? null;
    const triedRiderIds = await this.getTriedRiderIds(orderId);
    const rider = await this.pickEligibleRider(township, triedRiderIds);

    if (rider === null) {
      this.logger.debugEvent(
        'Auto-dispatch deferred: no eligible rider found for order.',
        { orderId, township, triedRiderIds },
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

    const orders = await this.dispatchRepository.findReadyOrdersWithoutRider({
      township,
      limit: 1,
    });

    if (orders.length === 0) {
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

  // Fired 15 min after a rider was assigned. If rider hasn't accepted, try next rider or cancel.
  private async handleRiderDispatchTimeout(
    orderId: string,
    attemptId: string,
  ): Promise<void> {
    const attempt = await this.prisma.orderDispatchAttempt.findUnique({
      where: { id: attemptId },
    });

    if (attempt === null || attempt.outcomeCode !== 'pending') {
      this.logger.debugEvent(
        'Rider dispatch timeout: attempt already resolved, skipping.',
        { orderId, attemptId, outcome: attempt?.outcomeCode },
        'AutoDispatchService',
      );
      return;
    }

    await this.prisma.orderDispatchAttempt.update({
      where: { id: attemptId },
      data: { outcomeCode: 'timeout', resolvedAt: new Date() },
    });

    // The delivery must still be ASSIGNED (rider hasn't acted). Reset it.
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        status: OrderStatus.RIDER_ASSIGNED,
        delivery: { is: { status: 'ASSIGNED' } },
      },
      include: {
        delivery: true,
      },
    });

    if (order === null) {
      this.logger.debugEvent(
        'Rider dispatch timeout: order no longer RIDER_ASSIGNED+ASSIGNED, skipping.',
        { orderId },
        'AutoDispatchService',
      );
      return;
    }

    await this.prisma.runInTransaction(async (tx) => {
      await tx.delivery.update({
        where: { id: order.delivery!.id },
        data: {
          riderId: null,
          status: 'PENDING_ASSIGNMENT',
          etaMinutes: null,
          acceptedAt: null,
        },
      });

      await this.ordersRepository.updateOrderStatus(
        orderId,
        {
          status: OrderStatus.MERCHANT_ACCEPTED,
          fromStatus: OrderStatus.RIDER_ASSIGNED,
          changedByUserId: SYSTEM_ACTOR_ID,
          reasonCode: 'rider_dispatch_timeout',
          note: null,
        },
        tx,
      );
    });

    const failedCount = await this.prisma.orderDispatchAttempt.count({
      where: {
        orderId,
        outcomeCode: { in: ['timeout', 'rejected'] },
      },
    });

    this.logger.debugEvent(
      'Rider dispatch timeout: failed attempt count.',
      { orderId, failedCount },
      'AutoDispatchService',
    );

    if (failedCount >= MAX_FAILED_ATTEMPTS) {
      await this.cancelOrderNoRider(orderId);
      return;
    }

    const triedRiderIds = await this.getTriedRiderIds(orderId);
    const township = order.deliveryTownship ?? null;
    const nextRider = await this.pickEligibleRider(township, triedRiderIds);

    if (nextRider === null) {
      this.logger.debugEvent(
        'Rider dispatch timeout: no more eligible riders, waiting for availability.',
        { orderId, township, triedRiderIds },
        'AutoDispatchService',
      );
      return;
    }

    await this.assignAndNotify(orderId, nextRider);
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  private async getTriedRiderIds(orderId: string): Promise<string[]> {
    const attempts = await this.prisma.orderDispatchAttempt.findMany({
      where: { orderId },
      select: { riderId: true },
    });
    return attempts.map((a) => a.riderId);
  }

  private async pickEligibleRider(
    township: string | null,
    excludeRiderIds: string[] = [],
  ): Promise<RiderOwnershipRecord | null> {
    if (township !== null) {
      const matched = await this.ridersService.findEligibleRiders({ township });
      const filtered = matched.filter((r) => !excludeRiderIds.includes(r.id));
      if (filtered.length > 0) return filtered[0];
    }
    const any = await this.ridersService.findEligibleRiders();
    const filtered = any.filter((r) => !excludeRiderIds.includes(r.id));
    return filtered.length > 0 ? filtered[0] : null;
  }

  private async assignAndNotify(
    orderId: string,
    rider: RiderOwnershipRecord,
  ): Promise<void> {
    const systemActor = createSystemAuthenticatedActor('auto-dispatch');
    const assignedAt = new Date();

    const attempt = await this.prisma.orderDispatchAttempt.create({
      data: {
        id: `dsp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        orderId,
        riderId: rider.id,
        outcomeCode: 'pending',
        attemptedAt: assignedAt,
      },
    });

    try {
      await this.prisma.runInTransaction(async (tx) => {
        // pg_advisory_xact_lock serializes concurrent assignAndNotify calls for
        // the same rider within this transaction only (safe under PgBouncer's
        // transaction pooling, unlike session-level advisory locks). Without
        // this, two orders dispatched in the same batch can both read the
        // rider as free before either commits, double-booking them.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${rider.id}))`;

        const activeDeliveries = await tx.delivery.count({
          where: {
            riderId: rider.id,
            status: { in: ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'ON_THE_WAY'] },
          },
        });
        if (activeDeliveries > 0) {
          throw new Error('Rider already has an active delivery (concurrent assignment).');
        }

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
        { orderId, riderId: rider.id, attemptId: attempt.id },
        'AutoDispatchService',
      );
    } catch (err) {
      await this.prisma.orderDispatchAttempt
        .update({
          where: { id: attempt.id },
          data: { outcomeCode: 'failed', resolvedAt: new Date() },
        })
        .catch(() => undefined);

      this.logger.errorEvent(
        'Auto-dispatch: assignment transaction failed.',
        { orderId, riderId: rider.id, error: String(err) },
        'AutoDispatchService',
      );
      // Don't count this as a failed dispatch attempt against the order (it's
      // not a rejection) — just retry shortly with a fresh rider lookup.
      await this.enqueueForOrder(orderId);
      return;
    }

    await this.queueService.add(
      QueueNames.dispatch,
      QueueJobNames.dispatch.riderDispatchTimeout,
      { orderId, attemptId: attempt.id } satisfies RiderDispatchTimeoutPayload,
      { delayMs: RIDER_ACCEPT_TIMEOUT_MS },
    );

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

  // Resolution on accept/reject is handled by
  // RiderDeliveryActionsService.resolveDispatchAttempt.

  private async cancelOrderNoRider(orderId: string): Promise<void> {
    this.logger.logEvent(
      'Auto-dispatch: max dispatch attempts reached, cancelling order.',
      { orderId },
      'AutoDispatchService',
    );

    // Look up customer info for the notification.
    const minimal = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        orderCode: true,
        customerProfile: { include: { user: { select: { id: true } } } },
      },
    });

    await this.orderCancellationService.cancelOrderForSystem(
      orderId,
      SYSTEM_ACTOR_ID,
      'no_rider_available',
      minimal?.customerProfile?.user?.id !== undefined
        ? {
            customerUserId: minimal.customerProfile.user.id,
            orderCode: minimal.orderCode,
            notificationReasonCode: 'rider_timeout',
          }
        : undefined,
    );
  }
}

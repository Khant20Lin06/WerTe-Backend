import { Injectable, OnModuleInit } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueJobNames, QueueNames } from '../infrastructure/queue/queue.constants';
import { QueueService } from '../infrastructure/queue/queue.service';
import { createSystemAuthenticatedActor } from '../modules/auth/entities/system-authenticated-actor.helper';
import { NotificationEventService } from '../modules/notifications/services/notification-event.service';
import { OrdersRepository } from '../modules/orders/repositories/orders.repository';
import { MenuInventoryLifecycleService } from '../modules/menus/services/menu-inventory-lifecycle.service';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { shouldReleaseInventoryForOrderTransition } from '../modules/orders/policies/order-inventory-lifecycle.helper';

const SYSTEM_ACTOR_ID = createSystemAuthenticatedActor('order-timeout').userId;

type StartTimeoutPayload = { orderId: string };
type RiderTimeoutPayload = { orderId: string };

const TIMEOUT_REASON = {
  merchant: 'merchant_timeout',
  rider: 'rider_timeout',
} as const;

@Injectable()
export class OrderTimeoutJob implements OnModuleInit {
  constructor(
    private readonly queueService: QueueService,
    private readonly ordersRepository: OrdersRepository,
    private readonly notificationEventService: NotificationEventService,
    private readonly menuInventoryLifecycleService: MenuInventoryLifecycleService,
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit(): void {
    this.queueService.registerHandler(
      QueueNames.orderTimeouts,
      QueueJobNames.orderTimeouts.startTimeout,
      (payload) => this.handleMerchantTimeout(payload as StartTimeoutPayload),
    );

    this.queueService.registerHandler(
      QueueNames.orderTimeouts,
      QueueJobNames.orderTimeouts.riderTimeout,
      (payload) => this.handleRiderTimeout(payload as RiderTimeoutPayload),
    );
  }

  // Fired 30 min after order placed. Cancel if still PLACED.
  async handleMerchantTimeout(payload: StartTimeoutPayload): Promise<void> {
    const order = await this.ordersRepository.findOrderDetailById(payload.orderId);

    if (order === null) {
      this.logger.warnEvent(
        'Merchant timeout: order not found.',
        { orderId: payload.orderId },
        'OrderTimeoutJob',
      );
      return;
    }

    if (order.status !== OrderStatus.PLACED) {
      this.logger.debugEvent(
        'Merchant timeout: order already progressed, skipping.',
        { orderId: order.id, status: order.status },
        'OrderTimeoutJob',
      );
      return;
    }

    await this.cancelAndNotify(order, TIMEOUT_REASON.merchant);
  }

  // Fired 30 min after merchant accepts. Cancel if still MERCHANT_ACCEPTED with no rider.
  async handleRiderTimeout(payload: RiderTimeoutPayload): Promise<void> {
    const order = await this.ordersRepository.findOrderDetailById(payload.orderId);

    if (order === null) {
      this.logger.warnEvent(
        'Rider timeout: order not found.',
        { orderId: payload.orderId },
        'OrderTimeoutJob',
      );
      return;
    }

    // A Delivery row persists across rejections (reset to riderId: null) —
    // only an actual rider assignment should stop the auto-cancel safety net.
    const hasAssignedRider = Boolean(order.delivery?.riderId);
    if (order.status !== OrderStatus.MERCHANT_ACCEPTED || hasAssignedRider) {
      this.logger.debugEvent(
        'Rider timeout: order already progressed or rider assigned, skipping.',
        {
          orderId: order.id,
          status: order.status,
          riderId: order.delivery?.riderId ?? null,
        },
        'OrderTimeoutJob',
      );
      return;
    }

    await this.cancelAndNotify(order, TIMEOUT_REASON.rider);
  }

  private async cancelAndNotify(
    order: Awaited<ReturnType<OrdersRepository['findOrderDetailById']>> & object,
    reasonCode: typeof TIMEOUT_REASON[keyof typeof TIMEOUT_REASON],
  ): Promise<void> {
    const fromStatus = order.status;

    await this.prisma.runInTransaction(async (tx) => {
      await this.ordersRepository.updateOrderStatus(
        order.id,
        {
          status: OrderStatus.CANCELLED,
          fromStatus,
          changedByUserId: SYSTEM_ACTOR_ID,
          reasonCode,
          note: null,
        },
        tx,
      );

      if (shouldReleaseInventoryForOrderTransition(fromStatus, OrderStatus.CANCELLED)) {
        await this.menuInventoryLifecycleService.restoreTrackedInventoryForOrder(
          order.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            menuItemStockTrackedSnapshot: item.menuItemStockTrackedSnapshot,
            variantCombinationStockTrackedSnapshot:
              item.variantCombinationStockTrackedSnapshot,
            selectedVariantCombinationId: item.selectedVariantCombinationId ?? null,
            inventoryLotAllocations: (item.inventoryLotAllocations ?? []).map((a) => ({
              inventoryLotId: a.inventoryLotId,
              batchNoSnapshot: a.batchNoSnapshot,
              expiryDateSnapshot: a.expiryDateSnapshot?.toISOString() ?? null,
              quantity: a.quantity,
            })),
            selectedOptions: item.selectedOptions.map((o) => ({
              itemOptionId: o.itemOptionId,
              itemOptionStockTrackedSnapshot: o.itemOptionStockTrackedSnapshot,
            })),
          })),
          tx,
        );
      }
    });

    this.logger.logEvent(
      'Order auto-cancelled due to timeout.',
      { orderId: order.id, orderCode: order.orderCode, reasonCode },
      'OrderTimeoutJob',
    );

    const customerUserId = order.customerProfile?.user?.id;
    if (customerUserId !== undefined) {
      await this.notificationEventService.publishOrderAutoCancelled({
        customerUserId,
        orderId: order.id,
        orderCode: order.orderCode,
        reasonCode,
      });
    }
  }
}

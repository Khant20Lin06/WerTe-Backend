import { HttpStatus, Injectable } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { QueueJobNames, QueueNames } from '../../../infrastructure/queue/queue.constants';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../menus/services/menu-inventory-lifecycle.service';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { MerchantOrderActionDto } from '../dto/merchant-order-action.dto';
import { OrderDetailEntity } from '../entities/order-detail.entity';
import { shouldReleaseInventoryForOrderTransition } from '../policies/order-inventory-lifecycle.helper';
import { OrderPolicyService } from '../policies/order-policy.service';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderQueryService } from './order-query.service';

type MerchantOrderActionInput = {
  orderId: string;
  reasonCode?: string;
  note?: string;
};

type MerchantActionConfig = {
  targetStatus: OrderStatus;
  defaultReasonCode: string;
  canTransition: (
    currentUser: AuthenticatedUserEntity,
    order: OrderDetailEntity,
  ) => boolean;
  conflictMessage: string;
};

@Injectable()
export class MerchantOrderHandlingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersRepository: OrdersRepository,
    private readonly orderPolicyService: OrderPolicyService,
    private readonly orderQueryService: OrderQueryService,
    private readonly systemMessageService: SystemMessageService,
    private readonly menuInventoryLifecycleService: MenuInventoryLifecycleService,
    private readonly notificationEventService: NotificationEventService,
    private readonly queueService: QueueService,
  ) {}

  acceptCurrentMerchantOrder(
    currentUser: AuthenticatedUserEntity,
    input: MerchantOrderActionInput | (MerchantOrderActionDto & { orderId: string }),
  ): Promise<OrderDetailEntity> {
    return this.handleMerchantAction(currentUser, input, {
      targetStatus: OrderStatus.MERCHANT_ACCEPTED,
      defaultReasonCode: 'merchant_accepted',
      canTransition: (user, order) =>
        this.orderPolicyService.canMerchantAccept(user, order),
      conflictMessage: 'This order can no longer be accepted by the merchant.',
    });
  }

  rejectCurrentMerchantOrder(
    currentUser: AuthenticatedUserEntity,
    input: MerchantOrderActionInput | (MerchantOrderActionDto & { orderId: string }),
  ): Promise<OrderDetailEntity> {
    return this.handleMerchantAction(currentUser, input, {
      targetStatus: OrderStatus.MERCHANT_REJECTED,
      defaultReasonCode: 'merchant_rejected',
      canTransition: (user, order) =>
        this.orderPolicyService.canMerchantReject(user, order),
      conflictMessage: 'This order can no longer be rejected by the merchant.',
    });
  }

  markPreparingCurrentMerchantOrder(
    currentUser: AuthenticatedUserEntity,
    input: MerchantOrderActionInput | (MerchantOrderActionDto & { orderId: string }),
  ): Promise<OrderDetailEntity> {
    return this.handleMerchantAction(currentUser, input, {
      targetStatus: OrderStatus.PREPARING,
      defaultReasonCode: 'merchant_preparing',
      canTransition: (user, order) =>
        this.orderPolicyService.canMarkPreparing(user, order),
      conflictMessage:
        'This order cannot be marked as preparing by the merchant.',
    });
  }

  markReadyCurrentMerchantOrder(
    currentUser: AuthenticatedUserEntity,
    input: MerchantOrderActionInput | (MerchantOrderActionDto & { orderId: string }),
  ): Promise<OrderDetailEntity> {
    return this.handleMerchantAction(currentUser, input, {
      targetStatus: OrderStatus.READY,
      defaultReasonCode: 'merchant_ready',
      canTransition: (user, order) =>
        this.orderPolicyService.canMarkReady(user, order),
      conflictMessage: 'This order cannot be marked as ready by the merchant.',
    });
  }

  confirmPickupCurrentMerchantOrder(
    currentUser: AuthenticatedUserEntity,
    input: MerchantOrderActionInput | (MerchantOrderActionDto & { orderId: string }),
  ): Promise<OrderDetailEntity> {
    return this.handleMerchantAction(currentUser, input, {
      targetStatus: OrderStatus.DELIVERED,
      defaultReasonCode: 'customer_pickup_confirmed',
      canTransition: (user, order) =>
        this.orderPolicyService.canMerchantConfirmPickup(user, order),
      conflictMessage: 'This order cannot be confirmed as picked up. It must be a PICKUP order in READY status.',
    });
  }

  private async handleMerchantAction(
    currentUser: AuthenticatedUserEntity,
    input: MerchantOrderActionInput,
    config: MerchantActionConfig,
  ): Promise<OrderDetailEntity> {
    const merchantId = currentUser.actorContext.merchantId;

    if (merchantId === undefined) {
      throw new AppException(
        'The authenticated actor does not have a merchant scope.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    const order = await this.ordersRepository.findMerchantOrderDetail(
      input.orderId,
      merchantId,
    );

    if (order === null) {
      throw new AppException('Order was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    const orderDetail = this.orderQueryService.buildOrderDetail(order);

    if (orderDetail.status === config.targetStatus) {
      return this.orderQueryService.attachAvailableActions(
        currentUser,
        orderDetail,
      );
    }

    if (!config.canTransition(currentUser, orderDetail)) {
      throw new AppException(config.conflictMessage, HttpStatus.CONFLICT, {
        code: ErrorCodes.conflict,
      });
    }

    let restoredInventoryAlerts: Awaited<
      ReturnType<MenuInventoryLifecycleService['collectTrackedInventoryRestorationAlerts']>
    > = [];
    const now = new Date();
    const updatedOrder = await this.prisma.runInTransaction(async (tx) => {
      const nextOrder = await this.ordersRepository.updateOrderStatus(
        input.orderId,
        {
          status: config.targetStatus,
          fromStatus: order.status,
          changedByUserId: currentUser.userId,
          reasonCode: input.reasonCode ?? config.defaultReasonCode,
          note: input.note ?? null,
        },
        tx,
      );

      if (
        shouldReleaseInventoryForOrderTransition(
          order.status,
          config.targetStatus,
        )
      ) {
        await this.menuInventoryLifecycleService.restoreTrackedInventoryForOrder(
          order.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            menuItemStockTrackedSnapshot: item.menuItemStockTrackedSnapshot,
            selectedVariantCombinationId: item.selectedVariantCombinationId,
            variantCombinationStockTrackedSnapshot:
              item.variantCombinationStockTrackedSnapshot,
            inventoryLotAllocations: (item.inventoryLotAllocations ?? []).map(
              (allocation) => ({
                inventoryLotId: allocation.inventoryLotId,
                batchNoSnapshot: allocation.batchNoSnapshot,
                expiryDateSnapshot:
                  allocation.expiryDateSnapshot?.toISOString() ?? null,
                quantity: allocation.quantity,
              }),
            ),
            selectedOptions: item.selectedOptions.map((selectedOption) => ({
              itemOptionId: selectedOption.itemOptionId,
              itemOptionStockTrackedSnapshot:
                selectedOption.itemOptionStockTrackedSnapshot,
            })),
          })),
          tx,
        );
        restoredInventoryAlerts =
          await this.menuInventoryLifecycleService.collectTrackedInventoryRestorationAlerts(
            order.items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              menuItemStockTrackedSnapshot: item.menuItemStockTrackedSnapshot,
              selectedVariantCombinationId: item.selectedVariantCombinationId,
              variantCombinationStockTrackedSnapshot:
                item.variantCombinationStockTrackedSnapshot,
              selectedOptions: item.selectedOptions.map((selectedOption) => ({
                itemOptionId: selectedOption.itemOptionId,
                itemOptionStockTrackedSnapshot:
                  selectedOption.itemOptionStockTrackedSnapshot,
              })),
            })),
            tx,
          );
      }

      // Auto-settle COD payment when order reaches DELIVERED (pickup confirm or rider delivery).
      if (config.targetStatus === OrderStatus.DELIVERED) {
        await tx.payment.updateMany({
          where: {
            orderId: input.orderId,
            method: PaymentMethod.CASH_ON_DELIVERY,
            status: PaymentStatus.PENDING,
          },
          data: {
            status: PaymentStatus.SUCCEEDED,
            succeededAt: now,
          },
        });
      }

      return nextOrder;
    });

    await this.systemMessageService.publishOrderEvent(currentUser, {
      orderId: input.orderId,
      code: this.mapStatusToSystemMessageCode(config.targetStatus),
      metadata: {
        actorUserId: currentUser.userId,
        targetStatus: config.targetStatus,
        reasonCode: input.reasonCode ?? config.defaultReasonCode,
        note: input.note ?? null,
      },
      templateVariables: {
        reasonCode: input.reasonCode ?? config.defaultReasonCode,
        note: input.note ?? null,
      },
    });

    // Trigger auto-dispatch when merchant accepts (rider-first: assign rider before preparing).
    // For PICKUP orders, skip dispatch and auto-advance straight to PREPARING then READY
    // so the merchant sees the "Picked Up" confirm button without extra manual steps.
    if (config.targetStatus === OrderStatus.MERCHANT_ACCEPTED) {
      if (orderDetail.deliveryType === 'PICKUP') {
        await this._autoAdvancePickupToReady(currentUser, input.orderId);
      } else {
        await this.queueService.add(
          QueueNames.dispatch,
          QueueJobNames.dispatch.autoDispatchOrder,
          { orderId: input.orderId },
          { delayMs: 500 },
        );
        // Cancel if no rider is assigned within 30 minutes of acceptance.
        await this.queueService.add(
          QueueNames.orderTimeouts,
          QueueJobNames.orderTimeouts.riderTimeout,
          { orderId: input.orderId },
          { delayMs: 30 * 60 * 1000 },
        );
      }
    }

    await this.publishRestoredInventoryAlerts(
      restoredInventoryAlerts,
      orderDetail.orderId,
      orderDetail.orderCode,
      input.reasonCode ?? config.defaultReasonCode,
      input.note ?? null,
    );

    return this.orderQueryService.attachAvailableActions(
      currentUser,
      this.orderQueryService.buildOrderDetail(updatedOrder),
    );
  }

  private async publishRestoredInventoryAlerts(
    alerts: Awaited<
      ReturnType<MenuInventoryLifecycleService['collectTrackedInventoryRestorationAlerts']>
    >,
    orderId: string,
    orderCode: string,
    reasonCode: string | null,
    note: string | null,
  ): Promise<void> {
    for (const alert of alerts) {
      await this.notificationEventService.publishMerchantInventoryCompensationAlert({
        ...alert,
        orderId,
        orderCode,
        reasonCode,
        note,
      });
    }
  }

  // Advance a PICKUP order from MERCHANT_ACCEPTED → PREPARING → READY automatically,
  // so the merchant sees the "Picked Up" confirm button without extra manual steps.
  private async _autoAdvancePickupToReady(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
  ): Promise<void> {
    const input: MerchantOrderActionInput = { orderId, reasonCode: 'auto_pickup_advance' };

    await this.handleMerchantAction(currentUser, input, {
      targetStatus: OrderStatus.PREPARING,
      defaultReasonCode: 'auto_pickup_advance',
      canTransition: (user, order) =>
        this.orderPolicyService.canMarkPreparing(user, order),
      conflictMessage: 'Auto-advance PREPARING failed for pickup order.',
    });

    await this.handleMerchantAction(currentUser, input, {
      targetStatus: OrderStatus.READY,
      defaultReasonCode: 'auto_pickup_advance',
      canTransition: (user, order) =>
        this.orderPolicyService.canMarkReady(user, order),
      conflictMessage: 'Auto-advance READY failed for pickup order.',
    });
  }

  private mapStatusToSystemMessageCode(targetStatus: OrderStatus) {
    switch (targetStatus) {
      case OrderStatus.MERCHANT_ACCEPTED:
        return 'ORDER_ACCEPTED' as const;
      case OrderStatus.MERCHANT_REJECTED:
        return 'ORDER_REJECTED' as const;
      case OrderStatus.PREPARING:
        return 'ORDER_PREPARING' as const;
      case OrderStatus.READY:
        return 'ORDER_READY' as const;
      case OrderStatus.DELIVERED:
        return 'ORDER_DELIVERED' as const;
      default:
        return 'ADMIN_INTERVENTION' as const;
    }
  }
}

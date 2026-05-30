import { HttpStatus, Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../menus/services/menu-inventory-lifecycle.service';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { CancelOrderDto } from '../dto/cancel-order.dto';
import { OrderDetailEntity } from '../entities/order-detail.entity';
import { shouldReleaseInventoryForOrderTransition } from '../policies/order-inventory-lifecycle.helper';
import { OrderPolicyService } from '../policies/order-policy.service';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderQueryService } from './order-query.service';

type CancelCustomerOrderInput = {
  orderId: string;
  reasonCode?: string;
  note?: string;
};

@Injectable()
export class OrderCancellationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersRepository: OrdersRepository,
    private readonly orderPolicyService: OrderPolicyService,
    private readonly orderQueryService: OrderQueryService,
    private readonly systemMessageService: SystemMessageService,
    private readonly menuInventoryLifecycleService: MenuInventoryLifecycleService,
    private readonly notificationEventService: NotificationEventService,
  ) {}

  async cancelCurrentCustomerOrder(
    currentUser: AuthenticatedUserEntity,
    input: CancelCustomerOrderInput | (CancelOrderDto & { orderId: string }),
  ): Promise<OrderDetailEntity> {
    const customerProfileId = currentUser.actorContext.customerProfileId;

    if (customerProfileId === undefined) {
      throw new AppException(
        'The authenticated actor does not have a customer profile scope.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    const order = await this.ordersRepository.findCustomerOrderDetail(
      input.orderId,
      customerProfileId,
    );

    if (order === null) {
      throw new AppException('Order was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    const orderDetail = this.orderQueryService.buildOrderDetail(order);

    if (orderDetail.status === OrderStatus.CANCELLED) {
      return this.orderQueryService.attachAvailableActions(
        currentUser,
        orderDetail,
      );
    }

    if (
      !this.orderPolicyService.canCancelCustomerOrder(currentUser, orderDetail)
    ) {
      throw new AppException(
        'This order can no longer be cancelled by the customer.',
        HttpStatus.CONFLICT,
        {
          code: ErrorCodes.conflict,
        },
      );
    }

    let restoredInventoryAlerts: Awaited<
      ReturnType<MenuInventoryLifecycleService['collectTrackedInventoryRestorationAlerts']>
    > = [];
    const cancelledOrder = await this.prisma.runInTransaction(async (tx) => {
      const updatedOrder = await this.ordersRepository.updateOrderStatus(
        input.orderId,
        {
          status: OrderStatus.CANCELLED,
          fromStatus: order.status,
          changedByUserId: currentUser.userId,
          reasonCode: input.reasonCode ?? 'customer_cancelled',
          note: input.note ?? null,
        },
        tx,
      );

      if (
        shouldReleaseInventoryForOrderTransition(
          order.status,
          OrderStatus.CANCELLED,
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

      return updatedOrder;
    });

    await this.systemMessageService.publishOrderEvent(currentUser, {
      orderId: input.orderId,
      code: 'ORDER_CANCELLED',
      metadata: {
        actorUserId: currentUser.userId,
        reasonCode: input.reasonCode ?? 'customer_cancelled',
        note: input.note ?? null,
      },
      templateVariables: {
        reasonCode: input.reasonCode ?? 'customer_cancelled',
        note: input.note ?? null,
      },
    });
    await this.publishRestoredInventoryAlerts(
      restoredInventoryAlerts,
      orderDetail.orderId,
      orderDetail.orderCode,
      input.reasonCode ?? 'customer_cancelled',
      input.note ?? null,
    );

    return this.orderQueryService.attachAvailableActions(
      currentUser,
      this.orderQueryService.buildOrderDetail(cancelledOrder),
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
}

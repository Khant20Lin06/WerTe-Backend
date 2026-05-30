import { HttpStatus, Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../menus/services/menu-inventory-lifecycle.service';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { AdminCancelOrderDto } from '../dto/admin-cancel-order.dto';
import { AdminUpdateOrderStatusDto } from '../dto/admin-update-order-status.dto';
import { OrderDetailEntity } from '../entities/order-detail.entity';
import { shouldReleaseInventoryForOrderTransition } from '../policies/order-inventory-lifecycle.helper';
import { OrderPolicyService } from '../policies/order-policy.service';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderQueryService } from './order-query.service';

type AdminCancelOrderInput = {
  orderId: string;
  reasonCode?: string;
  note?: string;
};

type AdminUpdateOrderStatusInput = {
  orderId: string;
  status: OrderStatus;
  reasonCode: string;
  note?: string;
};

@Injectable()
export class AdminOrderOperationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersRepository: OrdersRepository,
    private readonly orderPolicyService: OrderPolicyService,
    private readonly orderQueryService: OrderQueryService,
    private readonly systemMessageService: SystemMessageService,
    private readonly menuInventoryLifecycleService: MenuInventoryLifecycleService,
    private readonly notificationEventService: NotificationEventService,
  ) {}

  async cancelAdminOrder(
    currentUser: AuthenticatedUserEntity,
    input: AdminCancelOrderInput | (AdminCancelOrderDto & { orderId: string }),
  ): Promise<OrderDetailEntity> {
    this.requireAdminAccess(currentUser);

    const order = await this.ordersRepository.findOrderDetailById(input.orderId);

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

    if (!this.orderPolicyService.canAdminCancelOrder(currentUser, orderDetail)) {
      throw new AppException(
        'This order can no longer be cancelled by the admin control plane.',
        HttpStatus.CONFLICT,
        {
          code: ErrorCodes.conflict,
        },
      );
    }

    let restoredInventoryAlerts: Awaited<
      ReturnType<MenuInventoryLifecycleService['collectTrackedInventoryRestorationAlerts']>
    > = [];
    const updatedOrder = await this.prisma.runInTransaction(async (tx) => {
      const nextOrder = await this.ordersRepository.updateOrderStatus(
        input.orderId,
        {
          status: OrderStatus.CANCELLED,
          fromStatus: order.status,
          changedByUserId: currentUser.userId,
          reasonCode:
            this.normalizeOptionalString(input.reasonCode) ?? 'admin_cancelled',
          note: this.normalizeOptionalString(input.note),
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

      return nextOrder;
    });

    await this.systemMessageService.publishOrderEvent(currentUser, {
      orderId: input.orderId,
      code: 'ORDER_CANCELLED',
      metadata: {
        actorUserId: currentUser.userId,
        reasonCode:
          this.normalizeOptionalString(input.reasonCode) ?? 'admin_cancelled',
        note: this.normalizeOptionalString(input.note),
      },
      templateVariables: {
        reasonCode:
          this.normalizeOptionalString(input.reasonCode) ?? 'admin_cancelled',
        note: this.normalizeOptionalString(input.note),
      },
    });
    await this.publishRestoredInventoryAlerts(
      restoredInventoryAlerts,
      orderDetail.orderId,
      orderDetail.orderCode,
      this.normalizeOptionalString(input.reasonCode) ?? 'admin_cancelled',
      this.normalizeOptionalString(input.note),
    );

    return this.orderQueryService.attachAvailableActions(
      currentUser,
      this.orderQueryService.buildOrderDetail(updatedOrder),
    );
  }

  async overrideAdminOrderStatus(
    currentUser: AuthenticatedUserEntity,
    input:
      | AdminUpdateOrderStatusInput
      | (AdminUpdateOrderStatusDto & { orderId: string }),
  ): Promise<OrderDetailEntity> {
    this.requireAdminAccess(currentUser);

    const reasonCode = this.requireReasonCode(input.reasonCode);
    const order = await this.ordersRepository.findOrderDetailById(input.orderId);

    if (order === null) {
      throw new AppException('Order was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    const orderDetail = this.orderQueryService.buildOrderDetail(order);

    if (orderDetail.status === input.status) {
      return this.orderQueryService.attachAvailableActions(
        currentUser,
        orderDetail,
      );
    }

    if (!this.orderPolicyService.canAdminOverrideStatus(currentUser)) {
      throw new AppException(
        'You are not allowed to override order statuses.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    let restoredInventoryAlerts: Awaited<
      ReturnType<MenuInventoryLifecycleService['collectTrackedInventoryRestorationAlerts']>
    > = [];
    const updatedOrder = await this.prisma.runInTransaction(async (tx) => {
      const nextOrder = await this.ordersRepository.updateOrderStatus(
        input.orderId,
        {
          status: input.status,
          fromStatus: order.status,
          changedByUserId: currentUser.userId,
          reasonCode,
          note: this.normalizeOptionalString(input.note),
        },
        tx,
      );

      if (
        shouldReleaseInventoryForOrderTransition(order.status, input.status)
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

      return nextOrder;
    });

    await this.systemMessageService.publishOrderEvent(currentUser, {
      orderId: input.orderId,
      code: 'ADMIN_INTERVENTION',
      metadata: {
        actorUserId: currentUser.userId,
        targetStatus: input.status,
        reasonCode,
        note: this.normalizeOptionalString(input.note),
      },
      templateVariables: {
        reasonCode,
        note: this.normalizeOptionalString(input.note),
      },
    });
    await this.publishRestoredInventoryAlerts(
      restoredInventoryAlerts,
      orderDetail.orderId,
      orderDetail.orderCode,
      reasonCode,
      this.normalizeOptionalString(input.note),
    );

    return this.orderQueryService.attachAvailableActions(
      currentUser,
      this.orderQueryService.buildOrderDetail(updatedOrder),
    );
  }

  private requireAdminAccess(currentUser: AuthenticatedUserEntity): void {
    if (!this.orderPolicyService.canViewAdminOrders(currentUser)) {
      throw new AppException(
        'You are not allowed to perform admin order actions.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }
  }

  private requireReasonCode(reasonCode: string): string {
    const normalizedReasonCode = this.normalizeOptionalString(reasonCode);

    if (normalizedReasonCode === null) {
      throw new AppException(
        'A reason code is required for admin order status overrides.',
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

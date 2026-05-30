import { HttpStatus, Injectable } from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  SystemMessageCode,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../menus/services/menu-inventory-lifecycle.service';
import {
  buildPaymentSummaryEntity,
  PaymentSummaryEntity,
  PaymentSummaryRecord,
} from '../entities/payment-summary.entity';
import { shouldReleaseInventoryForOrderTransition } from '../../orders/policies/order-inventory-lifecycle.helper';
import { requireAdminFinanceAccess } from '../policies/finance-access-policy.helper';
import { PaymentsRepository } from '../repositories/payments.repository';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { NotificationEventService } from '../../notifications/services/notification-event.service';

type PaymentLifecycleInput = {
  paymentId: string;
  providerReference?: string | null;
  providerReceiptId?: string | null;
  reasonCode?: string | null;
  note?: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  metadata?: Prisma.InputJsonValue;
  requestPayloadJson?: Prisma.InputJsonValue;
  responsePayloadJson?: Prisma.InputJsonValue;
};

type PaymentLifecycleConfig = {
  targetStatus: PaymentStatus;
  systemMessageCode: SystemMessageCode;
  conflictMessage: string;
  allowedFrom: Set<PaymentStatus>;
  defaultReasonCode: string;
};

type PaymentLifecycleOptions = {
  skipAdminFinanceAccess?: boolean;
};

const CONFIRMABLE_PAYMENT_STATUSES = new Set<PaymentStatus>([
  PaymentStatus.PENDING,
  PaymentStatus.REQUIRES_ACTION,
  PaymentStatus.PROCESSING,
]);

const FAILABLE_PAYMENT_STATUSES = new Set<PaymentStatus>([
  PaymentStatus.PENDING,
  PaymentStatus.REQUIRES_ACTION,
  PaymentStatus.PROCESSING,
]);

const CANCELLABLE_PAYMENT_STATUSES = new Set<PaymentStatus>([
  PaymentStatus.PENDING,
  PaymentStatus.REQUIRES_ACTION,
  PaymentStatus.PROCESSING,
]);

const EXPIRABLE_PAYMENT_STATUSES = CANCELLABLE_PAYMENT_STATUSES;

@Injectable()
export class PaymentLifecycleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly systemMessageService: SystemMessageService,
    private readonly menuInventoryLifecycleService: MenuInventoryLifecycleService,
    private readonly notificationEventService: NotificationEventService,
  ) {}

  confirmCurrentPayment(
    currentUser: AuthenticatedUserEntity,
    input: PaymentLifecycleInput,
    options?: PaymentLifecycleOptions,
  ): Promise<PaymentSummaryEntity> {
    return this.handleTransition(
      currentUser,
      input,
      {
        targetStatus: PaymentStatus.SUCCEEDED,
        systemMessageCode: SystemMessageCode.PAYMENT_SUCCEEDED,
        conflictMessage: 'This payment can no longer be confirmed.',
        allowedFrom: CONFIRMABLE_PAYMENT_STATUSES,
        defaultReasonCode: 'payment_succeeded',
      },
      options,
    );
  }

  failCurrentPayment(
    currentUser: AuthenticatedUserEntity,
    input: PaymentLifecycleInput,
    options?: PaymentLifecycleOptions,
  ): Promise<PaymentSummaryEntity> {
    return this.handleTransition(
      currentUser,
      input,
      {
        targetStatus: PaymentStatus.FAILED,
        systemMessageCode: SystemMessageCode.PAYMENT_FAILED,
        conflictMessage: 'This payment can no longer be marked as failed.',
        allowedFrom: FAILABLE_PAYMENT_STATUSES,
        defaultReasonCode: 'payment_failed',
      },
      options,
    );
  }

  cancelCurrentPayment(
    currentUser: AuthenticatedUserEntity,
    input: PaymentLifecycleInput,
    options?: PaymentLifecycleOptions,
  ): Promise<PaymentSummaryEntity> {
    return this.handleTransition(
      currentUser,
      input,
      {
        targetStatus: PaymentStatus.CANCELLED,
        systemMessageCode: SystemMessageCode.PAYMENT_CANCELLED,
        conflictMessage: 'This payment can no longer be cancelled.',
        allowedFrom: CANCELLABLE_PAYMENT_STATUSES,
        defaultReasonCode: 'payment_cancelled',
      },
      options,
    );
  }

  expireCurrentPayment(
    currentUser: AuthenticatedUserEntity,
    input: PaymentLifecycleInput,
    options?: PaymentLifecycleOptions,
  ): Promise<PaymentSummaryEntity> {
    return this.handleTransition(
      currentUser,
      input,
      {
        targetStatus: PaymentStatus.EXPIRED,
        systemMessageCode: SystemMessageCode.PAYMENT_CANCELLED,
        conflictMessage: 'This payment can no longer be expired.',
        allowedFrom: EXPIRABLE_PAYMENT_STATUSES,
        defaultReasonCode: 'payment_expired',
      },
      options,
    );
  }

  private async handleTransition(
    currentUser: AuthenticatedUserEntity,
    input: PaymentLifecycleInput,
    config: PaymentLifecycleConfig,
    options: PaymentLifecycleOptions = {},
  ): Promise<PaymentSummaryEntity> {
    if (options.skipAdminFinanceAccess !== true) {
      requireAdminFinanceAccess(currentUser, 'payments');
    }

    const currentPayment = await this.paymentsRepository.findById(input.paymentId);

    if (currentPayment === null) {
      throw new AppException('Payment was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (currentPayment.status === config.targetStatus) {
      return buildPaymentSummaryEntity(currentPayment);
    }

    if (!config.allowedFrom.has(currentPayment.status)) {
      throw new AppException(config.conflictMessage, HttpStatus.CONFLICT, {
        code: ErrorCodes.conflict,
      });
    }

    const occurredAt = new Date();
    const mergedMetadata = this.buildMergedMetadata(
      currentPayment.metadataJson,
      input.metadata,
      {
        actorUserId: currentUser.userId,
        reasonCode: input.reasonCode ?? config.defaultReasonCode,
        note: input.note ?? null,
        targetStatus: config.targetStatus,
        occurredAt,
      },
    );

    const transitionResult = await this.prisma.runInTransaction(async (tx) => {
      const transitionedPayment =
        await this.paymentsRepository.transitionPaymentStatus(
          {
            paymentId: currentPayment.id,
            provider: currentPayment.provider,
            status: config.targetStatus,
            metadataJson: mergedMetadata,
            providerReference:
              input.providerReference ?? currentPayment.providerReference ?? null,
            providerReceiptId:
              input.providerReceiptId ?? currentPayment.providerReceiptId ?? null,
            failureCode: input.failureCode ?? null,
            failureMessage: input.failureMessage ?? null,
            requestPayloadJson: input.requestPayloadJson,
            responsePayloadJson: input.responsePayloadJson,
            occurredAt,
          },
          tx,
        );

      let orderStatusChanged = false;
      let orderReasonCode: string | null = null;
      let restoredInventoryAlerts: Awaited<
        ReturnType<MenuInventoryLifecycleService['collectTrackedInventoryRestorationAlerts']>
      > = [];

      if (this.shouldAutoCancelOrder(transitionedPayment, config.targetStatus)) {
        orderStatusChanged = true;
        orderReasonCode = input.reasonCode ?? config.defaultReasonCode;
        const orderDetail = await this.ordersRepository.findOrderDetailById(
          transitionedPayment.orderId,
          tx,
        );

        await this.ordersRepository.updateOrderStatus(
          transitionedPayment.orderId,
          {
            status: OrderStatus.CANCELLED,
            fromStatus: transitionedPayment.order.status,
            changedByUserId: currentUser.userId,
            reasonCode: orderReasonCode,
            note: input.note ?? null,
          },
          tx,
        );

        if (
          orderDetail !== null &&
          shouldReleaseInventoryForOrderTransition(
            orderDetail.status,
            OrderStatus.CANCELLED,
          )
        ) {
          await this.menuInventoryLifecycleService.restoreTrackedInventoryForOrder(
            orderDetail.items.map((item) => ({
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
              orderDetail.items.map((item) => ({
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
      }

      const finalPayment =
        orderStatusChanged
          ? await this.paymentsRepository.findById(currentPayment.id, tx)
          : transitionedPayment;

      return {
        payment: finalPayment!,
        orderStatusChanged,
        orderReasonCode,
        restoredInventoryAlerts,
      };
    });

    const payment = buildPaymentSummaryEntity(transitionResult.payment);

    await this.publishSystemMessages(currentUser, {
      payment,
      config,
      reasonCode: input.reasonCode ?? config.defaultReasonCode,
      note: input.note ?? input.failureMessage ?? null,
      failureCode: input.failureCode ?? payment.failureCode,
      failureMessage: input.failureMessage ?? payment.failureMessage,
      orderStatusChanged: transitionResult.orderStatusChanged,
      orderReasonCode: transitionResult.orderReasonCode,
    });
    await this.publishRestoredInventoryAlerts(
      transitionResult.restoredInventoryAlerts,
      payment.orderId,
      payment.order.orderCode,
      transitionResult.orderReasonCode,
      input.note ?? input.failureMessage ?? null,
    );

    return payment;
  }

  private shouldAutoCancelOrder(
    payment: PaymentSummaryRecord,
    targetStatus: PaymentStatus,
  ): boolean {
    if (
      targetStatus !== PaymentStatus.FAILED &&
      targetStatus !== PaymentStatus.CANCELLED &&
      targetStatus !== PaymentStatus.EXPIRED
    ) {
      return false;
    }

    if (payment.order.status !== OrderStatus.PLACED) {
      return false;
    }

    return payment.method !== PaymentMethod.CASH_ON_DELIVERY;
  }

  private async publishSystemMessages(
    currentUser: AuthenticatedUserEntity,
    input: {
      payment: PaymentSummaryEntity;
      config: PaymentLifecycleConfig;
      reasonCode: string;
      note: string | null;
      failureCode: string | null;
      failureMessage: string | null;
      orderStatusChanged: boolean;
      orderReasonCode: string | null;
    },
  ): Promise<void> {
    await this.systemMessageService.publishOrderEvent(currentUser, {
      orderId: input.payment.orderId,
      code: input.config.systemMessageCode,
      metadata: {
        paymentId: input.payment.paymentId,
        paymentStatus: input.payment.status,
        paymentMethod: input.payment.method,
        paymentProvider: input.payment.provider,
        providerReference: input.payment.providerReference,
        providerReceiptId: input.payment.providerReceiptId,
        failureCode: input.failureCode,
        failureMessage: input.failureMessage,
        orderStatusChanged: input.orderStatusChanged,
      },
      templateVariables: {
        reasonCode: input.failureCode ?? input.reasonCode,
        note: input.note ?? input.failureMessage ?? null,
      },
    });

    if (!input.orderStatusChanged) {
      return;
    }

    await this.systemMessageService.publishOrderEvent(currentUser, {
      orderId: input.payment.orderId,
      code: SystemMessageCode.ORDER_CANCELLED,
      metadata: {
        paymentId: input.payment.paymentId,
        paymentStatus: input.payment.status,
        reasonCode: input.orderReasonCode,
        note: input.note,
      },
      templateVariables: {
        reasonCode: input.orderReasonCode,
        note: input.note,
      },
    });
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

  private buildMergedMetadata(
    existingMetadata: Prisma.JsonValue | null | undefined,
    nextMetadata: Prisma.InputJsonValue | undefined,
    lifecycleEvent: {
      actorUserId: string;
      reasonCode: string;
      note: string | null;
      targetStatus: PaymentStatus;
      occurredAt: Date;
    },
  ): Prisma.InputJsonValue {
    return {
      ...(this.asJsonObject(existingMetadata) ?? {}),
      ...(this.asJsonObject(nextMetadata) ?? {}),
      lastLifecycleEvent: {
        actorUserId: lifecycleEvent.actorUserId,
        reasonCode: lifecycleEvent.reasonCode,
        note: lifecycleEvent.note,
        targetStatus: lifecycleEvent.targetStatus,
        occurredAt: lifecycleEvent.occurredAt.toISOString(),
      },
    };
  }

  private asJsonObject(
    value: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
  ): Record<string, Prisma.JsonValue | Prisma.InputJsonValue> | null {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as Record<string, Prisma.JsonValue | Prisma.InputJsonValue>;
  }
}

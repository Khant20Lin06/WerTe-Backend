import { HttpStatus, Injectable } from '@nestjs/common';
import {
  CartStatus,
  DeliveryType,
  ItemOptionGroupKind,
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  Prisma,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { runBestEffort } from '../../../common/utils/run-best-effort.util';
import { AppLogger } from '../../../infrastructure/logging/app.logger';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  QueueJobNames,
  QueueNames,
} from '../../../infrastructure/queue/queue.constants';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CartsRepository } from '../../carts/repositories/carts.repository';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../menus/services/menu-inventory-lifecycle.service';
import { MenusService } from '../../menus/services/menus.service';
import { buildVariantCombinationSignature } from '../../menus/utils/item-variant-combination.util';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { CheckoutPaymentIntentService } from '../../payments/services/checkout-payment-intent.service';
import { PromotionsRepository } from '../../promotions/repositories/promotions.repository';
import {
  buildCheckoutSubmission,
  CheckoutSubmissionEntity,
} from '../entities/checkout-submission.entity';
import { CheckoutContextEntity } from '../entities/checkout-context.entity';
import { hasCheckoutCustomerAccess } from '../policies/checkout-customer-access-policy.helper';
import { CheckoutContextService } from './checkout-context.service';
import { CheckoutPricingService } from './checkout-pricing.service';

export type SubmitCheckoutInput = {
  branchId: string;
  addressId?: string;
  deliveryType?: DeliveryType;
  idempotencyKey: string;
  paymentMethod?: PaymentMethod;
  paymentProvider?: PaymentProvider;
  promotionCode?: string;
};

@Injectable()
export class CheckoutSubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checkoutContextService: CheckoutContextService,
    private readonly checkoutPricingService: CheckoutPricingService,
    private readonly ordersRepository: OrdersRepository,
    private readonly cartsRepository: CartsRepository,
    private readonly menusService: MenusService,
    private readonly menuInventoryLifecycleService: MenuInventoryLifecycleService,
    private readonly checkoutPaymentIntentService: CheckoutPaymentIntentService,
    private readonly promotionsRepository: PromotionsRepository,
    private readonly queueService: QueueService,
    private readonly systemMessageService: SystemMessageService,
    private readonly notificationEventService: NotificationEventService,
    private readonly logger: AppLogger,
  ) {}

  async submitCurrentCustomerCheckout(
    currentUser: AuthenticatedUserEntity,
    input: SubmitCheckoutInput,
  ): Promise<CheckoutSubmissionEntity> {
    const isPickup = input.deliveryType === DeliveryType.PICKUP;
    const context =
      await this.checkoutContextService.getValidatedCurrentCustomerCheckoutContext(
        currentUser,
        {
          branchId: input.branchId,
          addressId: input.addressId,
          deliveryType: input.deliveryType,
        },
      );
    const pricing = await this.checkoutPricingService.buildPricingBreakdown(
      context,
      { promotionCode: input.promotionCode },
    );
    let reservedInventoryAlerts: Awaited<
      ReturnType<MenuInventoryLifecycleService['reserveTrackedInventoryForOrder']>
    > = {
      alerts: [],
      inventoryLotAllocationsByLineKey: {},
    };

    try {
      const result = await this.prisma.runInTransaction(async (tx) => {
        const existingOrder = await this.ordersRepository.findByIdempotencyKey(
          input.idempotencyKey,
          tx,
        );

        if (existingOrder !== null) {
          this.assertIdempotentOrderBelongsToCustomer(
            currentUser,
            context,
            existingOrder.customerProfileId,
          );

          const existingPaymentIntent =
            await this.resolveExistingOrCreatePaymentIntent(
              input,
              context,
              existingOrder,
              tx,
            );

          return {
            order: existingOrder,
            paymentIntent: existingPaymentIntent,
            wasCreated: false,
          };
        }

        const orderCartItems = await this.buildOrderCartItems(context);
        reservedInventoryAlerts =
          await this.menuInventoryLifecycleService.reserveTrackedInventoryForOrder(
          orderCartItems,
          tx,
        );

        const effectiveDeliveryFee = isPickup
          ? new Prisma.Decimal(0)
          : pricing.deliveryFee;
        const effectiveTotalAmount = isPickup
          ? pricing.subtotalAmount.minus(pricing.discountAmount)
          : pricing.totalAmount;

        const order = await this.ordersRepository.createCheckoutOrder(
          {
            orderCode: this.buildOrderCode(),
            customerProfileId: context.customer.customerProfileId,
            branchId: context.branch.branchId,
            addressId: context.address?.addressId ?? null,
            cartId: context.cart.cartId!,
            idempotencyKey: input.idempotencyKey,
            deliveryType: input.deliveryType ?? DeliveryType.DELIVERY,
            promotionId: pricing.appliedPromotion?.promotionId ?? null,
            promotionCodeSnapshot: pricing.appliedPromotion?.code ?? null,
            promotionNameSnapshot: pricing.appliedPromotion?.name ?? null,
            promotionDiscountTypeSnapshot:
              pricing.appliedPromotion?.discountType ?? null,
            status: OrderStatus.PLACED,
            currencyCode: context.currencyCode,
            subtotalAmount: pricing.subtotalAmount,
            discountAmount: pricing.discountAmount,
            deliveryFee: effectiveDeliveryFee,
            totalAmount: effectiveTotalAmount,
            deliveryLabel: context.address?.label ?? null,
            deliveryLine1: context.address?.line1 ?? null,
            deliveryLine2: context.address?.line2 ?? null,
            deliveryLandmark: context.address?.landmark ?? null,
            deliveryTownship: context.address?.township ?? null,
            deliveryCity: context.address?.city ?? null,
            deliveryPostalCode: context.address?.postalCode ?? null,
            deliveryInstructions: context.address?.deliveryInstructions ?? null,
            deliveryLatitude: context.address
              ? new Prisma.Decimal(context.address.latitude)
              : null,
            deliveryLongitude: context.address
              ? new Prisma.Decimal(context.address.longitude)
              : null,
            changedByUserId: currentUser.userId,
            cartItems: orderCartItems.map((cartItem) => ({
              ...cartItem,
              inventoryLotAllocations:
                reservedInventoryAlerts.inventoryLotAllocationsByLineKey[
                  cartItem.lineKey
                ] ?? [],
            })),
          },
          tx,
        );

        const paymentIntent =
          await this.checkoutPaymentIntentService.createCheckoutPaymentIntent(
            {
              orderId: order.id,
              orderCode: order.orderCode,
              customerProfileId: context.customer.customerProfileId,
              amount: pricing.totalAmount,
              currencyCode: context.currencyCode,
              idempotencyKey: input.idempotencyKey,
              paymentMethod: input.paymentMethod,
              paymentProvider: input.paymentProvider,
            },
            tx,
          );

        await this.cartsRepository.updateCart(
          context.cart.cartId!,
          { status: CartStatus.CHECKED_OUT },
          tx,
        );

        if (pricing.appliedPromotion?.promotionId) {
          await this.promotionsRepository.createUsage(
            {
              promotionId: pricing.appliedPromotion.promotionId,
              customerProfileId: context.customer.customerProfileId,
              orderId: order.id,
            },
            tx,
          );
        }

        return {
          order,
          paymentIntent,
          wasCreated: true,
        };
      });

      if (result.wasCreated) {
        // The order is already committed at this point — none of these are
        // allowed to turn a successfully placed order into a failed
        // response. Each is best-effort: log and move on rather than
        // throwing, so a Redis/messaging blip doesn't tell the customer
        // their order failed when it didn't. (The order-timeout job in
        // particular is a safety net, not a correctness requirement — an
        // order missing its auto-cancel timer is recoverable, an order the
        // customer thinks never got placed is a support ticket.)
        await runBestEffort(
          'enqueue order timeout job',
          () =>
            this.queueService.add(
              QueueNames.orderTimeouts,
              QueueJobNames.orderTimeouts.startTimeout,
              { orderId: result.order.id },
              { delayMs: 30 * 60 * 1000 },
            ),
          this.logger,
          'CheckoutSubmissionService',
        );
        await runBestEffort(
          'publish order placed event',
          () =>
            this.systemMessageService.publishOrderEvent(currentUser, {
              orderId: result.order.id,
              code: 'ORDER_PLACED',
              metadata: {
                actorUserId: currentUser.userId,
                orderCode: result.order.orderCode,
              },
              templateVariables: {
                orderCode: result.order.orderCode,
              },
            }),
          this.logger,
          'CheckoutSubmissionService',
        );
        await runBestEffort(
          'publish reserved inventory alerts',
          () => this.publishReservedInventoryAlerts(reservedInventoryAlerts.alerts),
          this.logger,
          'CheckoutSubmissionService',
        );
      }

      return buildCheckoutSubmission(result.order, {
        isIdempotentReplay: !result.wasCreated,
        paymentIntent: result.paymentIntent!,
      });
    } catch (error) {
      const replayResult = await this.tryResolveReplayAfterUniqueConstraint(
        error,
        context,
        input.idempotencyKey,
      );

      if (replayResult !== null) {
        return buildCheckoutSubmission(replayResult.order, {
          isIdempotentReplay: true,
          paymentIntent: replayResult.paymentIntent,
        });
      }

      throw error;
    }
  }

  private buildOrderCode(): string {
    const suffix = Date.now().toString().slice(-8);

    return `ORD-${suffix}`;
  }

  private async buildOrderCartItems(context: CheckoutContextEntity) {
    const { branchId } = context.branch;
    const menuItemIds = context.cart.items.map((i) => i.menuItemId);

    // 3 queries regardless of cart size (replaces N×4 per-item queries).
    const [menuItems, allOptions, allVariantCombinations] = await Promise.all([
      this.menusService.listItemsByIds(menuItemIds),
      this.menusService.listOptionsByBranchId(branchId),
      this.menusService.listVariantCombinationsByMenuItemIds(menuItemIds),
    ]);

    const menuItemById = new Map(menuItems.map((m) => [m.id, m]));
    const optionById = new Map(allOptions.map((o) => [o.id, o]));
    const optionGroupKindById = new Map(
      allOptions.map((o) => [o.group.id, o.group.kind]),
    );
    const optionStockTrackedById = new Map(
      allOptions.map((o) => [o.id, o.isStockTracked]),
    );
    // Key: `${menuItemId}:${signature}` → combination record
    const combinationByKey = new Map(
      allVariantCombinations.map((c) => [`${c.menuItemId}:${c.signature}`, c]),
    );

    return context.cart.items.map((item) => {
      const menuItem = menuItemById.get(item.menuItemId);

      const selectedVariantOptionIds = item.selectedOptions
        .map((so) => optionById.get(so.itemOptionId))
        .filter(
          (option): option is NonNullable<typeof option> =>
            option !== undefined &&
            option.group.kind === ItemOptionGroupKind.VARIANT_SELECTOR,
        )
        .map((option) => option.id);

      const signature = buildVariantCombinationSignature(selectedVariantOptionIds);
      const selectedVariantCombination =
        selectedVariantOptionIds.length > 0
          ? (combinationByKey.get(`${item.menuItemId}:${signature}`) ?? null)
          : null;

      if (selectedVariantOptionIds.length > 0 && selectedVariantCombination === null) {
        throw new AppException(
          'The selected variant combination is no longer valid for checkout submission.',
          HttpStatus.CONFLICT,
          {
            code: ErrorCodes.conflict,
            details: { menuItemId: item.menuItemId, selectedVariantOptionIds },
          },
        );
      }

      return {
        lineKey: item.cartItemId,
        menuItemId: item.menuItemId,
        categoryId: item.categoryId ?? null,
        nameSnapshot: item.menuItemName,
        descriptionSnapshot: item.menuItemDescription ?? null,
        imageUrlSnapshot: item.menuItemImageUrl ?? null,
        selectedVariantCombinationId: selectedVariantCombination?.id ?? null,
        selectedVariantCombinationNameSnapshot:
          selectedVariantCombination?.name ?? null,
        menuItemStockTrackedSnapshot: menuItem?.isStockTracked ?? false,
        variantCombinationStockTrackedSnapshot:
          selectedVariantCombination?.isStockTracked ?? false,
        unitBasePriceSnapshot: new Prisma.Decimal(item.menuItemBasePrice),
        unitPriceSnapshot: new Prisma.Decimal(item.unitPriceSnapshot),
        quantity: item.quantity,
        lineTotal: new Prisma.Decimal(item.lineTotal),
        selectedOptions: item.selectedOptions.map((selectedOption) => ({
          itemOptionId: selectedOption.itemOptionId,
          optionGroupId: selectedOption.optionGroupId,
          optionGroupNameSnapshot: selectedOption.optionGroupName,
          optionGroupKindSnapshot:
            optionGroupKindById.get(selectedOption.optionGroupId) ??
            ItemOptionGroupKind.ADD_ON,
          itemOptionStockTrackedSnapshot:
            optionStockTrackedById.get(selectedOption.itemOptionId) ?? false,
          nameSnapshot: selectedOption.nameSnapshot,
          priceDeltaSnapshot: new Prisma.Decimal(selectedOption.priceDeltaSnapshot),
        })),
      };
    });
  }

  private assertIdempotentOrderBelongsToCustomer(
    currentUser: AuthenticatedUserEntity,
    context: CheckoutContextEntity,
    customerProfileId: string,
  ): void {
    if (
      !hasCheckoutCustomerAccess({
        currentUser,
        ownerUserId: context.customer.userId,
        customerProfileId,
      }) ||
      customerProfileId !== context.customer.customerProfileId
    ) {
      throw new AppException(
        'The provided idempotency key is already in use by another checkout request.',
        HttpStatus.CONFLICT,
        {
          code: ErrorCodes.conflict,
        },
      );
    }
  }

  private async tryResolveReplayAfterUniqueConstraint(
    error: unknown,
    context: CheckoutContextEntity,
    idempotencyKey: string,
  ) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== 'P2002'
    ) {
      return null;
    }

    const targets = Array.isArray(error.meta?.target) ? error.meta.target : [];
    if (!targets.includes('idempotencyKey')) {
      return null;
    }

    const existingOrder = await this.ordersRepository.findByIdempotencyKey(
      idempotencyKey,
    );

    if (existingOrder === null) {
      return null;
    }

    this.assertIdempotentOrderBelongsToCustomer(
      {
        userId: context.customer.userId,
        sessionId: 'checkout-submission-replay',
        role: context.customer.role,
        tokenType: 'access',
        actorContext: {
          userId: context.customer.userId,
          phone: context.customer.phone,
          role: context.customer.role,
          status: context.customer.userStatus,
          customerProfileId: context.customer.customerProfileId,
        },
      },
      context,
      existingOrder.customerProfileId,
    );

    const existingPaymentIntent = await this.resolveExistingOrCreatePaymentIntent(
      {
        branchId: context.branch.branchId,
        addressId: context.address?.addressId,
        idempotencyKey,
      },
      context,
      existingOrder,
    );

    return {
      order: existingOrder,
      paymentIntent: existingPaymentIntent,
    };
  }

  private async resolveExistingOrCreatePaymentIntent(
    input: SubmitCheckoutInput,
    context: CheckoutContextEntity,
    existingOrder: {
      id: string;
      orderCode: string;
      customerProfileId: string;
      totalAmount: Prisma.Decimal;
      currencyCode: string;
    },
    client?: Prisma.TransactionClient,
  ) {
    const existingPaymentIntent =
      await this.checkoutPaymentIntentService.findByIdempotencyKey(
        input.idempotencyKey,
        client,
      );

    if (existingPaymentIntent !== null) {
      return existingPaymentIntent;
    }

    return this.checkoutPaymentIntentService.createCheckoutPaymentIntent(
      {
        orderId: existingOrder.id,
        orderCode: existingOrder.orderCode,
        customerProfileId: existingOrder.customerProfileId,
        amount: existingOrder.totalAmount,
        currencyCode: existingOrder.currencyCode,
        idempotencyKey: input.idempotencyKey,
        paymentMethod: input.paymentMethod,
        paymentProvider: input.paymentProvider,
      },
      client,
    );
  }

  private async publishReservedInventoryAlerts(
    alerts: Awaited<
      ReturnType<MenuInventoryLifecycleService['reserveTrackedInventoryForOrder']>
    >['alerts'],
  ): Promise<void> {
    for (const alert of alerts) {
      await this.notificationEventService.publishMerchantInventoryAlert(alert);
    }
  }
}

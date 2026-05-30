import { HttpStatus, Injectable } from '@nestjs/common';
import {
  CartStatus,
  ItemOptionGroupKind,
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  Prisma,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
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
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { CheckoutPaymentIntentService } from '../../payments/services/checkout-payment-intent.service';
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
    private readonly queueService: QueueService,
    private readonly systemMessageService: SystemMessageService,
    private readonly notificationEventService: NotificationEventService,
  ) {}

  async submitCurrentCustomerCheckout(
    currentUser: AuthenticatedUserEntity,
    input: SubmitCheckoutInput,
  ): Promise<CheckoutSubmissionEntity> {
    const context =
      await this.checkoutContextService.getValidatedCurrentCustomerCheckoutContext(
        currentUser,
        {
          branchId: input.branchId,
          addressId: input.addressId,
        },
      );
    const pricing = await this.checkoutPricingService.buildPricingBreakdown(
      context,
      {
        promotionCode: input.promotionCode,
      },
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

        const order = await this.ordersRepository.createCheckoutOrder(
          {
            orderCode: this.buildOrderCode(),
            customerProfileId: context.customer.customerProfileId,
            branchId: context.branch.branchId,
            addressId: context.address.addressId,
            cartId: context.cart.cartId!,
            idempotencyKey: input.idempotencyKey,
            promotionId: pricing.appliedPromotion?.promotionId ?? null,
            promotionCodeSnapshot: pricing.appliedPromotion?.code ?? null,
            promotionNameSnapshot: pricing.appliedPromotion?.name ?? null,
            promotionDiscountTypeSnapshot:
              pricing.appliedPromotion?.discountType ?? null,
            status: OrderStatus.PLACED,
            currencyCode: context.currencyCode,
            subtotalAmount: pricing.subtotalAmount,
            discountAmount: pricing.discountAmount,
            deliveryFee: pricing.deliveryFee,
            totalAmount: pricing.totalAmount,
            deliveryLabel: context.address.label,
            deliveryLine1: context.address.line1,
            deliveryLine2: context.address.line2,
            deliveryLandmark: context.address.landmark,
            deliveryTownship: context.address.township,
            deliveryCity: context.address.city,
            deliveryPostalCode: context.address.postalCode,
            deliveryInstructions: context.address.deliveryInstructions,
            deliveryLatitude: new Prisma.Decimal(context.address.latitude),
            deliveryLongitude: new Prisma.Decimal(context.address.longitude),
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
          {
            status: CartStatus.CHECKED_OUT,
          },
          tx,
        );

        return {
          order,
          paymentIntent,
          wasCreated: true,
        };
      });

      if (result.wasCreated) {
        await this.queueService.add(
          QueueNames.orderTimeouts,
          QueueJobNames.orderTimeouts.startTimeout,
          {
            orderId: result.order.id,
          },
        );
        await this.systemMessageService.publishOrderEvent(currentUser, {
          orderId: result.order.id,
          code: 'ORDER_PLACED',
          metadata: {
            actorUserId: currentUser.userId,
            orderCode: result.order.orderCode,
          },
          templateVariables: {
            orderCode: result.order.orderCode,
          },
        });
        await this.publishReservedInventoryAlerts(reservedInventoryAlerts.alerts);
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
    return Promise.all(
      context.cart.items.map(async (item) => {
        const currentMenuItem = await this.menusService.findItemById(item.menuItemId);
        const optionGroups = await this.menusService.listOptionGroupsByMenuItemId(
          item.menuItemId,
        );
        const optionGroupKindById = new Map(
          optionGroups.map((group) => [group.id, group.kind]),
        );
        const optionRecords = await Promise.all(
          optionGroups.map((group) =>
            this.menusService.listOptionsByOptionGroupId(group.id),
          ),
        );
        const optionStockTrackedById = new Map(
          optionRecords
            .flat()
            .map((option) => [option.id, option.isStockTracked] as const),
        );
        const optionById = new Map(
          optionRecords.flat().map((option) => [option.id, option] as const),
        );
        const selectedVariantOptionIds = item.selectedOptions
          .map((selectedOption) => optionById.get(selectedOption.itemOptionId))
          .filter(
            (option): option is NonNullable<typeof option> =>
              option !== undefined &&
              option.group.kind === ItemOptionGroupKind.VARIANT_SELECTOR,
          )
          .map((option) => option.id);
        const selectedVariantCombination =
          await this.menusService.findActiveVariantCombinationByMenuItemIdAndOptionIds(
            item.menuItemId,
            selectedVariantOptionIds,
          );

        if (
          selectedVariantOptionIds.length > 0 &&
          selectedVariantCombination === null
        ) {
          throw new AppException(
            'The selected variant combination is no longer valid for checkout submission.',
            HttpStatus.CONFLICT,
            {
              code: ErrorCodes.conflict,
              details: {
                menuItemId: item.menuItemId,
                selectedVariantOptionIds,
              },
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
          menuItemStockTrackedSnapshot: currentMenuItem?.isStockTracked ?? false,
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
            priceDeltaSnapshot: new Prisma.Decimal(
              selectedOption.priceDeltaSnapshot,
            ),
          })),
        };
      }),
    );
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
        addressId: context.address.addressId,
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

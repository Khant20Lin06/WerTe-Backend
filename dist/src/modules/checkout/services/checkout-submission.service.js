"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutSubmissionService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const queue_constants_1 = require("../../../infrastructure/queue/queue.constants");
const queue_service_1 = require("../../../infrastructure/queue/queue.service");
const carts_repository_1 = require("../../carts/repositories/carts.repository");
const system_message_service_1 = require("../../messaging/services/system-message.service");
const menu_inventory_lifecycle_service_1 = require("../../menus/services/menu-inventory-lifecycle.service");
const menus_service_1 = require("../../menus/services/menus.service");
const item_variant_combination_util_1 = require("../../menus/utils/item-variant-combination.util");
const notification_event_service_1 = require("../../notifications/services/notification-event.service");
const orders_repository_1 = require("../../orders/repositories/orders.repository");
const checkout_payment_intent_service_1 = require("../../payments/services/checkout-payment-intent.service");
const checkout_submission_entity_1 = require("../entities/checkout-submission.entity");
const checkout_customer_access_policy_helper_1 = require("../policies/checkout-customer-access-policy.helper");
const checkout_context_service_1 = require("./checkout-context.service");
const checkout_pricing_service_1 = require("./checkout-pricing.service");
let CheckoutSubmissionService = class CheckoutSubmissionService {
    constructor(prisma, checkoutContextService, checkoutPricingService, ordersRepository, cartsRepository, menusService, menuInventoryLifecycleService, checkoutPaymentIntentService, queueService, systemMessageService, notificationEventService) {
        this.prisma = prisma;
        this.checkoutContextService = checkoutContextService;
        this.checkoutPricingService = checkoutPricingService;
        this.ordersRepository = ordersRepository;
        this.cartsRepository = cartsRepository;
        this.menusService = menusService;
        this.menuInventoryLifecycleService = menuInventoryLifecycleService;
        this.checkoutPaymentIntentService = checkoutPaymentIntentService;
        this.queueService = queueService;
        this.systemMessageService = systemMessageService;
        this.notificationEventService = notificationEventService;
    }
    async submitCurrentCustomerCheckout(currentUser, input) {
        const isPickup = input.deliveryType === client_1.DeliveryType.PICKUP;
        const context = await this.checkoutContextService.getValidatedCurrentCustomerCheckoutContext(currentUser, {
            branchId: input.branchId,
            addressId: input.addressId,
            deliveryType: input.deliveryType,
        });
        const pricing = await this.checkoutPricingService.buildPricingBreakdown(context, {
            promotionCode: input.promotionCode,
        });
        let reservedInventoryAlerts = {
            alerts: [],
            inventoryLotAllocationsByLineKey: {},
        };
        try {
            const result = await this.prisma.runInTransaction(async (tx) => {
                const existingOrder = await this.ordersRepository.findByIdempotencyKey(input.idempotencyKey, tx);
                if (existingOrder !== null) {
                    this.assertIdempotentOrderBelongsToCustomer(currentUser, context, existingOrder.customerProfileId);
                    const existingPaymentIntent = await this.resolveExistingOrCreatePaymentIntent(input, context, existingOrder, tx);
                    return {
                        order: existingOrder,
                        paymentIntent: existingPaymentIntent,
                        wasCreated: false,
                    };
                }
                const orderCartItems = await this.buildOrderCartItems(context);
                reservedInventoryAlerts =
                    await this.menuInventoryLifecycleService.reserveTrackedInventoryForOrder(orderCartItems, tx);
                const effectiveDeliveryFee = isPickup
                    ? new client_1.Prisma.Decimal(0)
                    : pricing.deliveryFee;
                const effectiveTotalAmount = isPickup
                    ? pricing.subtotalAmount.minus(pricing.discountAmount)
                    : pricing.totalAmount;
                const order = await this.ordersRepository.createCheckoutOrder({
                    orderCode: this.buildOrderCode(),
                    customerProfileId: context.customer.customerProfileId,
                    branchId: context.branch.branchId,
                    addressId: context.address?.addressId ?? null,
                    cartId: context.cart.cartId,
                    idempotencyKey: input.idempotencyKey,
                    deliveryType: input.deliveryType ?? client_1.DeliveryType.DELIVERY,
                    promotionId: pricing.appliedPromotion?.promotionId ?? null,
                    promotionCodeSnapshot: pricing.appliedPromotion?.code ?? null,
                    promotionNameSnapshot: pricing.appliedPromotion?.name ?? null,
                    promotionDiscountTypeSnapshot: pricing.appliedPromotion?.discountType ?? null,
                    status: client_1.OrderStatus.PLACED,
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
                        ? new client_1.Prisma.Decimal(context.address.latitude)
                        : null,
                    deliveryLongitude: context.address
                        ? new client_1.Prisma.Decimal(context.address.longitude)
                        : null,
                    changedByUserId: currentUser.userId,
                    cartItems: orderCartItems.map((cartItem) => ({
                        ...cartItem,
                        inventoryLotAllocations: reservedInventoryAlerts.inventoryLotAllocationsByLineKey[cartItem.lineKey] ?? [],
                    })),
                }, tx);
                const paymentIntent = await this.checkoutPaymentIntentService.createCheckoutPaymentIntent({
                    orderId: order.id,
                    orderCode: order.orderCode,
                    customerProfileId: context.customer.customerProfileId,
                    amount: pricing.totalAmount,
                    currencyCode: context.currencyCode,
                    idempotencyKey: input.idempotencyKey,
                    paymentMethod: input.paymentMethod,
                    paymentProvider: input.paymentProvider,
                }, tx);
                await this.cartsRepository.updateCart(context.cart.cartId, {
                    status: client_1.CartStatus.CHECKED_OUT,
                }, tx);
                return {
                    order,
                    paymentIntent,
                    wasCreated: true,
                };
            });
            if (result.wasCreated) {
                await this.queueService.add(queue_constants_1.QueueNames.orderTimeouts, queue_constants_1.QueueJobNames.orderTimeouts.startTimeout, {
                    orderId: result.order.id,
                });
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
            return (0, checkout_submission_entity_1.buildCheckoutSubmission)(result.order, {
                isIdempotentReplay: !result.wasCreated,
                paymentIntent: result.paymentIntent,
            });
        }
        catch (error) {
            const replayResult = await this.tryResolveReplayAfterUniqueConstraint(error, context, input.idempotencyKey);
            if (replayResult !== null) {
                return (0, checkout_submission_entity_1.buildCheckoutSubmission)(replayResult.order, {
                    isIdempotentReplay: true,
                    paymentIntent: replayResult.paymentIntent,
                });
            }
            throw error;
        }
    }
    buildOrderCode() {
        const suffix = Date.now().toString().slice(-8);
        return `ORD-${suffix}`;
    }
    async buildOrderCartItems(context) {
        const { branchId } = context.branch;
        const menuItemIds = context.cart.items.map((i) => i.menuItemId);
        const [menuItems, allOptions, allVariantCombinations] = await Promise.all([
            this.menusService.listItemsByIds(menuItemIds),
            this.menusService.listOptionsByBranchId(branchId),
            this.menusService.listVariantCombinationsByMenuItemIds(menuItemIds),
        ]);
        const menuItemById = new Map(menuItems.map((m) => [m.id, m]));
        const optionById = new Map(allOptions.map((o) => [o.id, o]));
        const optionGroupKindById = new Map(allOptions.map((o) => [o.group.id, o.group.kind]));
        const optionStockTrackedById = new Map(allOptions.map((o) => [o.id, o.isStockTracked]));
        const combinationByKey = new Map(allVariantCombinations.map((c) => [`${c.menuItemId}:${c.signature}`, c]));
        return context.cart.items.map((item) => {
            const menuItem = menuItemById.get(item.menuItemId);
            const selectedVariantOptionIds = item.selectedOptions
                .map((so) => optionById.get(so.itemOptionId))
                .filter((option) => option !== undefined &&
                option.group.kind === client_1.ItemOptionGroupKind.VARIANT_SELECTOR)
                .map((option) => option.id);
            const signature = (0, item_variant_combination_util_1.buildVariantCombinationSignature)(selectedVariantOptionIds);
            const selectedVariantCombination = selectedVariantOptionIds.length > 0
                ? (combinationByKey.get(`${item.menuItemId}:${signature}`) ?? null)
                : null;
            if (selectedVariantOptionIds.length > 0 && selectedVariantCombination === null) {
                throw new app_exception_1.AppException('The selected variant combination is no longer valid for checkout submission.', common_1.HttpStatus.CONFLICT, {
                    code: error_codes_1.ErrorCodes.conflict,
                    details: { menuItemId: item.menuItemId, selectedVariantOptionIds },
                });
            }
            return {
                lineKey: item.cartItemId,
                menuItemId: item.menuItemId,
                categoryId: item.categoryId ?? null,
                nameSnapshot: item.menuItemName,
                descriptionSnapshot: item.menuItemDescription ?? null,
                imageUrlSnapshot: item.menuItemImageUrl ?? null,
                selectedVariantCombinationId: selectedVariantCombination?.id ?? null,
                selectedVariantCombinationNameSnapshot: selectedVariantCombination?.name ?? null,
                menuItemStockTrackedSnapshot: menuItem?.isStockTracked ?? false,
                variantCombinationStockTrackedSnapshot: selectedVariantCombination?.isStockTracked ?? false,
                unitBasePriceSnapshot: new client_1.Prisma.Decimal(item.menuItemBasePrice),
                unitPriceSnapshot: new client_1.Prisma.Decimal(item.unitPriceSnapshot),
                quantity: item.quantity,
                lineTotal: new client_1.Prisma.Decimal(item.lineTotal),
                selectedOptions: item.selectedOptions.map((selectedOption) => ({
                    itemOptionId: selectedOption.itemOptionId,
                    optionGroupId: selectedOption.optionGroupId,
                    optionGroupNameSnapshot: selectedOption.optionGroupName,
                    optionGroupKindSnapshot: optionGroupKindById.get(selectedOption.optionGroupId) ??
                        client_1.ItemOptionGroupKind.ADD_ON,
                    itemOptionStockTrackedSnapshot: optionStockTrackedById.get(selectedOption.itemOptionId) ?? false,
                    nameSnapshot: selectedOption.nameSnapshot,
                    priceDeltaSnapshot: new client_1.Prisma.Decimal(selectedOption.priceDeltaSnapshot),
                })),
            };
        });
    }
    assertIdempotentOrderBelongsToCustomer(currentUser, context, customerProfileId) {
        if (!(0, checkout_customer_access_policy_helper_1.hasCheckoutCustomerAccess)({
            currentUser,
            ownerUserId: context.customer.userId,
            customerProfileId,
        }) ||
            customerProfileId !== context.customer.customerProfileId) {
            throw new app_exception_1.AppException('The provided idempotency key is already in use by another checkout request.', common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
    }
    async tryResolveReplayAfterUniqueConstraint(error, context, idempotencyKey) {
        if (!(error instanceof client_1.Prisma.PrismaClientKnownRequestError) ||
            error.code !== 'P2002') {
            return null;
        }
        const targets = Array.isArray(error.meta?.target) ? error.meta.target : [];
        if (!targets.includes('idempotencyKey')) {
            return null;
        }
        const existingOrder = await this.ordersRepository.findByIdempotencyKey(idempotencyKey);
        if (existingOrder === null) {
            return null;
        }
        this.assertIdempotentOrderBelongsToCustomer({
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
        }, context, existingOrder.customerProfileId);
        const existingPaymentIntent = await this.resolveExistingOrCreatePaymentIntent({
            branchId: context.branch.branchId,
            addressId: context.address?.addressId,
            idempotencyKey,
        }, context, existingOrder);
        return {
            order: existingOrder,
            paymentIntent: existingPaymentIntent,
        };
    }
    async resolveExistingOrCreatePaymentIntent(input, context, existingOrder, client) {
        const existingPaymentIntent = await this.checkoutPaymentIntentService.findByIdempotencyKey(input.idempotencyKey, client);
        if (existingPaymentIntent !== null) {
            return existingPaymentIntent;
        }
        return this.checkoutPaymentIntentService.createCheckoutPaymentIntent({
            orderId: existingOrder.id,
            orderCode: existingOrder.orderCode,
            customerProfileId: existingOrder.customerProfileId,
            amount: existingOrder.totalAmount,
            currencyCode: existingOrder.currencyCode,
            idempotencyKey: input.idempotencyKey,
            paymentMethod: input.paymentMethod,
            paymentProvider: input.paymentProvider,
        }, client);
    }
    async publishReservedInventoryAlerts(alerts) {
        for (const alert of alerts) {
            await this.notificationEventService.publishMerchantInventoryAlert(alert);
        }
    }
};
exports.CheckoutSubmissionService = CheckoutSubmissionService;
exports.CheckoutSubmissionService = CheckoutSubmissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        checkout_context_service_1.CheckoutContextService,
        checkout_pricing_service_1.CheckoutPricingService,
        orders_repository_1.OrdersRepository,
        carts_repository_1.CartsRepository,
        menus_service_1.MenusService,
        menu_inventory_lifecycle_service_1.MenuInventoryLifecycleService,
        checkout_payment_intent_service_1.CheckoutPaymentIntentService,
        queue_service_1.QueueService,
        system_message_service_1.SystemMessageService,
        notification_event_service_1.NotificationEventService])
], CheckoutSubmissionService);
//# sourceMappingURL=checkout-submission.service.js.map
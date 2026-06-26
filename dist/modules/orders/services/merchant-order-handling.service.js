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
exports.MerchantOrderHandlingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const queue_constants_1 = require("../../../infrastructure/queue/queue.constants");
const queue_service_1 = require("../../../infrastructure/queue/queue.service");
const system_message_service_1 = require("../../messaging/services/system-message.service");
const menu_inventory_lifecycle_service_1 = require("../../menus/services/menu-inventory-lifecycle.service");
const notification_event_service_1 = require("../../notifications/services/notification-event.service");
const order_inventory_lifecycle_helper_1 = require("../policies/order-inventory-lifecycle.helper");
const order_policy_service_1 = require("../policies/order-policy.service");
const orders_repository_1 = require("../repositories/orders.repository");
const order_query_service_1 = require("./order-query.service");
let MerchantOrderHandlingService = class MerchantOrderHandlingService {
    constructor(prisma, ordersRepository, orderPolicyService, orderQueryService, systemMessageService, menuInventoryLifecycleService, notificationEventService, queueService) {
        this.prisma = prisma;
        this.ordersRepository = ordersRepository;
        this.orderPolicyService = orderPolicyService;
        this.orderQueryService = orderQueryService;
        this.systemMessageService = systemMessageService;
        this.menuInventoryLifecycleService = menuInventoryLifecycleService;
        this.notificationEventService = notificationEventService;
        this.queueService = queueService;
    }
    acceptCurrentMerchantOrder(currentUser, input) {
        return this.handleMerchantAction(currentUser, input, {
            targetStatus: client_1.OrderStatus.MERCHANT_ACCEPTED,
            defaultReasonCode: 'merchant_accepted',
            canTransition: (user, order) => this.orderPolicyService.canMerchantAccept(user, order),
            conflictMessage: 'This order can no longer be accepted by the merchant.',
        });
    }
    rejectCurrentMerchantOrder(currentUser, input) {
        return this.handleMerchantAction(currentUser, input, {
            targetStatus: client_1.OrderStatus.MERCHANT_REJECTED,
            defaultReasonCode: 'merchant_rejected',
            canTransition: (user, order) => this.orderPolicyService.canMerchantReject(user, order),
            conflictMessage: 'This order can no longer be rejected by the merchant.',
        });
    }
    markPreparingCurrentMerchantOrder(currentUser, input) {
        return this.handleMerchantAction(currentUser, input, {
            targetStatus: client_1.OrderStatus.PREPARING,
            defaultReasonCode: 'merchant_preparing',
            canTransition: (user, order) => this.orderPolicyService.canMarkPreparing(user, order),
            conflictMessage: 'This order cannot be marked as preparing by the merchant.',
        });
    }
    markReadyCurrentMerchantOrder(currentUser, input) {
        return this.handleMerchantAction(currentUser, input, {
            targetStatus: client_1.OrderStatus.READY,
            defaultReasonCode: 'merchant_ready',
            canTransition: (user, order) => this.orderPolicyService.canMarkReady(user, order),
            conflictMessage: 'This order cannot be marked as ready by the merchant.',
        });
    }
    confirmPickupCurrentMerchantOrder(currentUser, input) {
        return this.handleMerchantAction(currentUser, input, {
            targetStatus: client_1.OrderStatus.DELIVERED,
            defaultReasonCode: 'customer_pickup_confirmed',
            canTransition: (user, order) => this.orderPolicyService.canMerchantConfirmPickup(user, order),
            conflictMessage: 'This order cannot be confirmed as picked up. It must be a PICKUP order in READY status.',
        });
    }
    async handleMerchantAction(currentUser, input, config) {
        const merchantId = currentUser.actorContext.merchantId;
        if (merchantId === undefined) {
            throw new app_exception_1.AppException('The authenticated actor does not have a merchant scope.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        const order = await this.ordersRepository.findMerchantOrderDetail(input.orderId, merchantId);
        if (order === null) {
            throw new app_exception_1.AppException('Order was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        const orderDetail = this.orderQueryService.buildOrderDetail(order);
        if (orderDetail.status === config.targetStatus) {
            return this.orderQueryService.attachAvailableActions(currentUser, orderDetail);
        }
        if (!config.canTransition(currentUser, orderDetail)) {
            throw new app_exception_1.AppException(config.conflictMessage, common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
        let restoredInventoryAlerts = [];
        const now = new Date();
        const updatedOrder = await this.prisma.runInTransaction(async (tx) => {
            const nextOrder = await this.ordersRepository.updateOrderStatus(input.orderId, {
                status: config.targetStatus,
                fromStatus: order.status,
                changedByUserId: currentUser.userId,
                reasonCode: input.reasonCode ?? config.defaultReasonCode,
                note: input.note ?? null,
            }, tx);
            if ((0, order_inventory_lifecycle_helper_1.shouldReleaseInventoryForOrderTransition)(order.status, config.targetStatus)) {
                await this.menuInventoryLifecycleService.restoreTrackedInventoryForOrder(order.items.map((item) => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    menuItemStockTrackedSnapshot: item.menuItemStockTrackedSnapshot,
                    selectedVariantCombinationId: item.selectedVariantCombinationId,
                    variantCombinationStockTrackedSnapshot: item.variantCombinationStockTrackedSnapshot,
                    inventoryLotAllocations: (item.inventoryLotAllocations ?? []).map((allocation) => ({
                        inventoryLotId: allocation.inventoryLotId,
                        batchNoSnapshot: allocation.batchNoSnapshot,
                        expiryDateSnapshot: allocation.expiryDateSnapshot?.toISOString() ?? null,
                        quantity: allocation.quantity,
                    })),
                    selectedOptions: item.selectedOptions.map((selectedOption) => ({
                        itemOptionId: selectedOption.itemOptionId,
                        itemOptionStockTrackedSnapshot: selectedOption.itemOptionStockTrackedSnapshot,
                    })),
                })), tx);
                restoredInventoryAlerts =
                    await this.menuInventoryLifecycleService.collectTrackedInventoryRestorationAlerts(order.items.map((item) => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        menuItemStockTrackedSnapshot: item.menuItemStockTrackedSnapshot,
                        selectedVariantCombinationId: item.selectedVariantCombinationId,
                        variantCombinationStockTrackedSnapshot: item.variantCombinationStockTrackedSnapshot,
                        selectedOptions: item.selectedOptions.map((selectedOption) => ({
                            itemOptionId: selectedOption.itemOptionId,
                            itemOptionStockTrackedSnapshot: selectedOption.itemOptionStockTrackedSnapshot,
                        })),
                    })), tx);
            }
            if (config.targetStatus === client_1.OrderStatus.DELIVERED) {
                await tx.payment.updateMany({
                    where: {
                        orderId: input.orderId,
                        method: client_1.PaymentMethod.CASH_ON_DELIVERY,
                        status: client_1.PaymentStatus.PENDING,
                    },
                    data: {
                        status: client_1.PaymentStatus.SUCCEEDED,
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
        if (config.targetStatus === client_1.OrderStatus.MERCHANT_ACCEPTED) {
            if (orderDetail.deliveryType === 'PICKUP') {
                await this._autoAdvancePickupToReady(currentUser, input.orderId);
            }
            else {
                await this.queueService.add(queue_constants_1.QueueNames.dispatch, queue_constants_1.QueueJobNames.dispatch.autoDispatchOrder, { orderId: input.orderId }, { delayMs: 500 });
            }
        }
        await this.publishRestoredInventoryAlerts(restoredInventoryAlerts, orderDetail.orderId, orderDetail.orderCode, input.reasonCode ?? config.defaultReasonCode, input.note ?? null);
        return this.orderQueryService.attachAvailableActions(currentUser, this.orderQueryService.buildOrderDetail(updatedOrder));
    }
    async publishRestoredInventoryAlerts(alerts, orderId, orderCode, reasonCode, note) {
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
    async _autoAdvancePickupToReady(currentUser, orderId) {
        const input = { orderId, reasonCode: 'auto_pickup_advance' };
        await this.handleMerchantAction(currentUser, input, {
            targetStatus: client_1.OrderStatus.PREPARING,
            defaultReasonCode: 'auto_pickup_advance',
            canTransition: (user, order) => this.orderPolicyService.canMarkPreparing(user, order),
            conflictMessage: 'Auto-advance PREPARING failed for pickup order.',
        });
        await this.handleMerchantAction(currentUser, input, {
            targetStatus: client_1.OrderStatus.READY,
            defaultReasonCode: 'auto_pickup_advance',
            canTransition: (user, order) => this.orderPolicyService.canMarkReady(user, order),
            conflictMessage: 'Auto-advance READY failed for pickup order.',
        });
    }
    mapStatusToSystemMessageCode(targetStatus) {
        switch (targetStatus) {
            case client_1.OrderStatus.MERCHANT_ACCEPTED:
                return 'ORDER_ACCEPTED';
            case client_1.OrderStatus.MERCHANT_REJECTED:
                return 'ORDER_REJECTED';
            case client_1.OrderStatus.PREPARING:
                return 'ORDER_PREPARING';
            case client_1.OrderStatus.READY:
                return 'ORDER_READY';
            case client_1.OrderStatus.DELIVERED:
                return 'ORDER_DELIVERED';
            default:
                return 'ADMIN_INTERVENTION';
        }
    }
};
exports.MerchantOrderHandlingService = MerchantOrderHandlingService;
exports.MerchantOrderHandlingService = MerchantOrderHandlingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_repository_1.OrdersRepository,
        order_policy_service_1.OrderPolicyService,
        order_query_service_1.OrderQueryService,
        system_message_service_1.SystemMessageService,
        menu_inventory_lifecycle_service_1.MenuInventoryLifecycleService,
        notification_event_service_1.NotificationEventService,
        queue_service_1.QueueService])
], MerchantOrderHandlingService);
//# sourceMappingURL=merchant-order-handling.service.js.map
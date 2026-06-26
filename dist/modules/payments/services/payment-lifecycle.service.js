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
exports.PaymentLifecycleService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_json_util_1 = require("../../../common/utils/prisma-json.util");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const system_message_service_1 = require("../../messaging/services/system-message.service");
const menu_inventory_lifecycle_service_1 = require("../../menus/services/menu-inventory-lifecycle.service");
const payment_summary_entity_1 = require("../entities/payment-summary.entity");
const order_inventory_lifecycle_helper_1 = require("../../orders/policies/order-inventory-lifecycle.helper");
const finance_access_policy_helper_1 = require("../policies/finance-access-policy.helper");
const payments_repository_1 = require("../repositories/payments.repository");
const orders_repository_1 = require("../../orders/repositories/orders.repository");
const notification_event_service_1 = require("../../notifications/services/notification-event.service");
const IN_PROGRESS_PAYMENT_STATUSES = new Set([
    client_1.PaymentStatus.PENDING,
    client_1.PaymentStatus.REQUIRES_ACTION,
    client_1.PaymentStatus.PROCESSING,
]);
let PaymentLifecycleService = class PaymentLifecycleService {
    constructor(prisma, paymentsRepository, ordersRepository, systemMessageService, menuInventoryLifecycleService, notificationEventService) {
        this.prisma = prisma;
        this.paymentsRepository = paymentsRepository;
        this.ordersRepository = ordersRepository;
        this.systemMessageService = systemMessageService;
        this.menuInventoryLifecycleService = menuInventoryLifecycleService;
        this.notificationEventService = notificationEventService;
    }
    confirmCurrentPayment(currentUser, input, options) {
        return this.handleTransition(currentUser, input, {
            targetStatus: client_1.PaymentStatus.SUCCEEDED,
            systemMessageCode: client_1.SystemMessageCode.PAYMENT_SUCCEEDED,
            conflictMessage: 'This payment can no longer be confirmed.',
            allowedFrom: IN_PROGRESS_PAYMENT_STATUSES,
            defaultReasonCode: 'payment_succeeded',
        }, options);
    }
    failCurrentPayment(currentUser, input, options) {
        return this.handleTransition(currentUser, input, {
            targetStatus: client_1.PaymentStatus.FAILED,
            systemMessageCode: client_1.SystemMessageCode.PAYMENT_FAILED,
            conflictMessage: 'This payment can no longer be marked as failed.',
            allowedFrom: IN_PROGRESS_PAYMENT_STATUSES,
            defaultReasonCode: 'payment_failed',
        }, options);
    }
    cancelCurrentPayment(currentUser, input, options) {
        return this.handleTransition(currentUser, input, {
            targetStatus: client_1.PaymentStatus.CANCELLED,
            systemMessageCode: client_1.SystemMessageCode.PAYMENT_CANCELLED,
            conflictMessage: 'This payment can no longer be cancelled.',
            allowedFrom: IN_PROGRESS_PAYMENT_STATUSES,
            defaultReasonCode: 'payment_cancelled',
        }, options);
    }
    expireCurrentPayment(currentUser, input, options) {
        return this.handleTransition(currentUser, input, {
            targetStatus: client_1.PaymentStatus.EXPIRED,
            systemMessageCode: client_1.SystemMessageCode.PAYMENT_CANCELLED,
            conflictMessage: 'This payment can no longer be expired.',
            allowedFrom: IN_PROGRESS_PAYMENT_STATUSES,
            defaultReasonCode: 'payment_expired',
        }, options);
    }
    async handleTransition(currentUser, input, config, options = {}) {
        if (options.skipAdminFinanceAccess !== true) {
            (0, finance_access_policy_helper_1.requireAdminFinanceAccess)(currentUser, 'payments');
        }
        const currentPayment = await this.paymentsRepository.findById(input.paymentId);
        if (currentPayment === null) {
            throw new app_exception_1.AppException('Payment was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (currentPayment.status === config.targetStatus) {
            return (0, payment_summary_entity_1.buildPaymentSummaryEntity)(currentPayment);
        }
        if (!config.allowedFrom.has(currentPayment.status)) {
            throw new app_exception_1.AppException(config.conflictMessage, common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
        const occurredAt = new Date();
        const mergedMetadata = this.buildMergedMetadata(currentPayment.metadataJson, input.metadata, {
            actorUserId: currentUser.userId,
            reasonCode: input.reasonCode ?? config.defaultReasonCode,
            note: input.note ?? null,
            targetStatus: config.targetStatus,
            occurredAt,
        });
        const transitionResult = await this.prisma.runInTransaction(async (tx) => {
            const transitionedPayment = await this.paymentsRepository.transitionPaymentStatus({
                paymentId: currentPayment.id,
                provider: currentPayment.provider,
                status: config.targetStatus,
                metadataJson: mergedMetadata,
                providerReference: input.providerReference ?? currentPayment.providerReference ?? null,
                providerReceiptId: input.providerReceiptId ?? currentPayment.providerReceiptId ?? null,
                failureCode: input.failureCode ?? null,
                failureMessage: input.failureMessage ?? null,
                requestPayloadJson: input.requestPayloadJson,
                responsePayloadJson: input.responsePayloadJson,
                occurredAt,
            }, tx);
            let orderStatusChanged = false;
            let orderReasonCode = null;
            let restoredInventoryAlerts = [];
            if (this.shouldAutoCancelOrder(transitionedPayment, config.targetStatus)) {
                orderStatusChanged = true;
                orderReasonCode = input.reasonCode ?? config.defaultReasonCode;
                const orderDetail = await this.ordersRepository.findOrderDetailById(transitionedPayment.orderId, tx);
                await this.ordersRepository.updateOrderStatus(transitionedPayment.orderId, {
                    status: client_1.OrderStatus.CANCELLED,
                    fromStatus: transitionedPayment.order.status,
                    changedByUserId: currentUser.userId,
                    reasonCode: orderReasonCode,
                    note: input.note ?? null,
                }, tx);
                if (orderDetail !== null &&
                    (0, order_inventory_lifecycle_helper_1.shouldReleaseInventoryForOrderTransition)(orderDetail.status, client_1.OrderStatus.CANCELLED)) {
                    await this.menuInventoryLifecycleService.restoreTrackedInventoryForOrder(orderDetail.items.map((item) => ({
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
                        await this.menuInventoryLifecycleService.collectTrackedInventoryRestorationAlerts(orderDetail.items.map((item) => ({
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
            }
            const finalPayment = orderStatusChanged
                ? await this.paymentsRepository.findById(currentPayment.id, tx)
                : transitionedPayment;
            return {
                payment: finalPayment,
                orderStatusChanged,
                orderReasonCode,
                restoredInventoryAlerts,
            };
        });
        const payment = (0, payment_summary_entity_1.buildPaymentSummaryEntity)(transitionResult.payment);
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
        await this.publishRestoredInventoryAlerts(transitionResult.restoredInventoryAlerts, payment.orderId, payment.order.orderCode, transitionResult.orderReasonCode, input.note ?? input.failureMessage ?? null);
        return payment;
    }
    shouldAutoCancelOrder(payment, targetStatus) {
        if (targetStatus !== client_1.PaymentStatus.FAILED &&
            targetStatus !== client_1.PaymentStatus.CANCELLED &&
            targetStatus !== client_1.PaymentStatus.EXPIRED) {
            return false;
        }
        if (payment.order.status !== client_1.OrderStatus.PLACED) {
            return false;
        }
        return payment.method !== client_1.PaymentMethod.CASH_ON_DELIVERY;
    }
    async publishSystemMessages(currentUser, input) {
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
            code: client_1.SystemMessageCode.ORDER_CANCELLED,
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
    buildMergedMetadata(existingMetadata, nextMetadata, lifecycleEvent) {
        return {
            ...((0, prisma_json_util_1.asJsonObject)(existingMetadata) ?? {}),
            ...((0, prisma_json_util_1.asJsonObject)(nextMetadata) ?? {}),
            lastLifecycleEvent: {
                actorUserId: lifecycleEvent.actorUserId,
                reasonCode: lifecycleEvent.reasonCode,
                note: lifecycleEvent.note,
                targetStatus: lifecycleEvent.targetStatus,
                occurredAt: lifecycleEvent.occurredAt.toISOString(),
            },
        };
    }
};
exports.PaymentLifecycleService = PaymentLifecycleService;
exports.PaymentLifecycleService = PaymentLifecycleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payments_repository_1.PaymentsRepository,
        orders_repository_1.OrdersRepository,
        system_message_service_1.SystemMessageService,
        menu_inventory_lifecycle_service_1.MenuInventoryLifecycleService,
        notification_event_service_1.NotificationEventService])
], PaymentLifecycleService);
//# sourceMappingURL=payment-lifecycle.service.js.map
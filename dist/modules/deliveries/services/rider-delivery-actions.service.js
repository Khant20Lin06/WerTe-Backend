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
exports.RiderDeliveryActionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const queue_constants_1 = require("../../../infrastructure/queue/queue.constants");
const queue_service_1 = require("../../../infrastructure/queue/queue.service");
const system_message_service_1 = require("../../messaging/services/system-message.service");
const orders_repository_1 = require("../../orders/repositories/orders.repository");
const rider_delivery_policy_helper_1 = require("../policies/rider-delivery-policy.helper");
const deliveries_repository_1 = require("../repositories/deliveries.repository");
const delivery_query_service_1 = require("./delivery-query.service");
let RiderDeliveryActionsService = class RiderDeliveryActionsService {
    constructor(prisma, deliveriesRepository, ordersRepository, deliveryQueryService, systemMessageService, queueService) {
        this.prisma = prisma;
        this.deliveriesRepository = deliveriesRepository;
        this.ordersRepository = ordersRepository;
        this.deliveryQueryService = deliveryQueryService;
        this.systemMessageService = systemMessageService;
        this.queueService = queueService;
    }
    acceptCurrentRiderDeliveryRequest(currentUser, input) {
        return this.handleTransition(currentUser, input, {
            targetOrderStatus: client_1.OrderStatus.RIDER_ACCEPTED,
            targetDeliveryStatus: client_1.DeliveryStatus.ACCEPTED,
            defaultReasonCode: 'rider_accepted_assignment',
            conflictMessage: 'This delivery request can no longer be accepted.',
            systemMessageCode: 'RIDER_ACCEPTED',
            canTransition: rider_delivery_policy_helper_1.canRiderAcceptDeliveryRequest,
            buildDeliveryUpdate: ({ now }) => ({
                status: client_1.DeliveryStatus.ACCEPTED,
                acceptedAt: now,
            }),
        });
    }
    async rejectCurrentRiderDeliveryRequest(currentUser, input) {
        const result = await this.handleTransition(currentUser, input, {
            targetOrderStatus: client_1.OrderStatus.MERCHANT_ACCEPTED,
            targetDeliveryStatus: client_1.DeliveryStatus.PENDING_ASSIGNMENT,
            defaultReasonCode: 'rider_rejected_assignment',
            conflictMessage: 'This delivery request can no longer be rejected.',
            systemMessageCode: 'RIDER_REJECTED_ASSIGNMENT',
            reloadUnscoped: true,
            canTransition: rider_delivery_policy_helper_1.canRiderRejectDeliveryRequest,
            buildDeliveryUpdate: () => ({
                riderId: null,
                status: client_1.DeliveryStatus.PENDING_ASSIGNMENT,
                etaMinutes: null,
                acceptedAt: null,
                pickedUpAt: null,
                onTheWayAt: null,
                deliveredAt: null,
                failedAt: null,
                cancelledAt: null,
                failureReasonCode: null,
                failureNote: null,
            }),
        });
        await this.queueService.add(queue_constants_1.QueueNames.dispatch, queue_constants_1.QueueJobNames.dispatch.autoDispatchOrder, { orderId: result.orderId }, { delayMs: 500 });
        return result;
    }
    markCurrentRiderPickedUp(currentUser, input) {
        return this.handleTransition(currentUser, input, {
            targetOrderStatus: client_1.OrderStatus.PICKED_UP,
            targetDeliveryStatus: client_1.DeliveryStatus.PICKED_UP,
            defaultReasonCode: 'rider_picked_up_order',
            conflictMessage: 'This delivery can no longer be marked as picked up.',
            systemMessageCode: 'ORDER_PICKED_UP',
            canTransition: rider_delivery_policy_helper_1.canRiderMarkDeliveryPickedUp,
            buildDeliveryUpdate: ({ now }) => ({
                status: client_1.DeliveryStatus.PICKED_UP,
                pickedUpAt: now,
            }),
        });
    }
    markCurrentRiderOnTheWay(currentUser, input) {
        return this.handleTransition(currentUser, input, {
            targetOrderStatus: client_1.OrderStatus.ON_THE_WAY,
            targetDeliveryStatus: client_1.DeliveryStatus.ON_THE_WAY,
            defaultReasonCode: 'rider_on_the_way',
            conflictMessage: 'This delivery can no longer be marked as on the way.',
            systemMessageCode: 'ORDER_ON_THE_WAY',
            canTransition: rider_delivery_policy_helper_1.canRiderMarkDeliveryOnTheWay,
            buildDeliveryUpdate: ({ now }) => ({
                status: client_1.DeliveryStatus.ON_THE_WAY,
                onTheWayAt: now,
            }),
        });
    }
    markCurrentRiderDelivered(currentUser, input) {
        return this.handleTransition(currentUser, input, {
            targetOrderStatus: client_1.OrderStatus.DELIVERED,
            targetDeliveryStatus: client_1.DeliveryStatus.DELIVERED,
            defaultReasonCode: 'rider_delivered_order',
            conflictMessage: 'This delivery can no longer be marked as delivered.',
            systemMessageCode: 'ORDER_DELIVERED',
            canTransition: rider_delivery_policy_helper_1.canRiderMarkDeliveryDelivered,
            buildDeliveryUpdate: ({ now }) => ({
                status: client_1.DeliveryStatus.DELIVERED,
                deliveredAt: now,
            }),
        });
    }
    async cancelCurrentRiderDelivery(currentUser, input) {
        const riderId = this.requireRiderId(currentUser);
        const delivery = await this.deliveriesRepository.findRiderDeliveryById(input.deliveryId, riderId);
        if (delivery === null) {
            throw new app_exception_1.AppException('Delivery was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!(0, rider_delivery_policy_helper_1.canRiderCancelPrePickup)(currentUser, delivery)) {
            throw new app_exception_1.AppException('This delivery can no longer be cancelled.', common_1.HttpStatus.CONFLICT, { code: error_codes_1.ErrorCodes.conflict });
        }
        const reasonCode = this.normalizeOptionalString(input.reasonCode) ?? 'rider_cancelled_pre_pickup';
        const note = this.normalizeOptionalString(input.note);
        const now = new Date();
        await this.prisma.runInTransaction(async (tx) => {
            await this.deliveriesRepository.updateById(delivery.id, {
                rider: { disconnect: true },
                status: client_1.DeliveryStatus.PENDING_ASSIGNMENT,
                etaMinutes: null,
                acceptedAt: null,
                pickedUpAt: null,
                onTheWayAt: null,
                deliveredAt: null,
                failedAt: null,
                cancelledAt: now,
                failureReasonCode: reasonCode,
                failureNote: note,
            }, tx);
            await this.ordersRepository.updateOrderStatus(delivery.orderId, {
                status: client_1.OrderStatus.MERCHANT_ACCEPTED,
                fromStatus: delivery.order.status,
                changedByUserId: currentUser.userId,
                reasonCode,
                note,
            }, tx);
        });
        await this.systemMessageService.publishOrderEvent(currentUser, {
            orderId: delivery.orderId,
            code: 'ORDER_CANCELLED',
            metadata: {
                actorUserId: currentUser.userId,
                deliveryId: delivery.id,
                reasonCode,
                note,
            },
            templateVariables: { reasonCode, note },
        });
        await this.queueService.add(queue_constants_1.QueueNames.dispatch, queue_constants_1.QueueJobNames.dispatch.autoDispatchOrder, { orderId: delivery.orderId }, { delayMs: 500 });
    }
    failCurrentRiderDelivery(currentUser, input) {
        return this.handleTransition(currentUser, input, {
            targetOrderStatus: client_1.OrderStatus.FAILED_DELIVERY,
            targetDeliveryStatus: client_1.DeliveryStatus.FAILED,
            conflictMessage: 'This delivery can no longer be marked as failed.',
            systemMessageCode: 'FAILED_DELIVERY',
            requireReasonCode: true,
            canTransition: rider_delivery_policy_helper_1.canRiderMarkDeliveryFailed,
            buildDeliveryUpdate: ({ now, reasonCode, note }) => ({
                status: client_1.DeliveryStatus.FAILED,
                failedAt: now,
                failureReasonCode: reasonCode,
                failureNote: note,
            }),
        });
    }
    async handleTransition(currentUser, input, config) {
        const riderId = this.requireRiderId(currentUser);
        const delivery = await this.deliveriesRepository.findRiderDeliveryById(input.deliveryId, riderId);
        if (delivery === null) {
            throw new app_exception_1.AppException('Delivery was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (delivery.order.status === config.targetOrderStatus &&
            delivery.status === config.targetDeliveryStatus) {
            return this.deliveryQueryService.buildDeliveryDetail(delivery);
        }
        if (!config.canTransition(currentUser, delivery)) {
            throw new app_exception_1.AppException(config.conflictMessage, common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
        const reasonCode = config.requireReasonCode
            ? this.requireReasonCode(input.reasonCode)
            : this.normalizeOptionalString(input.reasonCode) ??
                config.defaultReasonCode ??
                null;
        const note = this.normalizeOptionalString(input.note);
        const now = new Date();
        await this.prisma.runInTransaction(async (tx) => {
            await this.deliveriesRepository.updateById(delivery.id, config.buildDeliveryUpdate({
                delivery,
                now,
                reasonCode,
                note,
            }), tx);
            await this.ordersRepository.updateOrderStatus(delivery.orderId, {
                status: config.targetOrderStatus,
                fromStatus: delivery.order.status,
                changedByUserId: currentUser.userId,
                reasonCode: reasonCode ?? undefined,
                note,
            }, tx);
            if (config.targetOrderStatus === client_1.OrderStatus.DELIVERED) {
                await tx.payment.updateMany({
                    where: {
                        orderId: delivery.orderId,
                        method: client_1.PaymentMethod.CASH_ON_DELIVERY,
                        status: client_1.PaymentStatus.PENDING,
                    },
                    data: {
                        status: client_1.PaymentStatus.SUCCEEDED,
                        succeededAt: now,
                    },
                });
            }
        });
        const updatedDelivery = config.reloadUnscoped
            ? await this.deliveriesRepository.findById(input.deliveryId)
            : await this.deliveriesRepository.findRiderDeliveryById(input.deliveryId, riderId);
        if (updatedDelivery === null) {
            throw new app_exception_1.AppException('Delivery was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        await this.systemMessageService.publishOrderEvent(currentUser, {
            orderId: delivery.orderId,
            code: config.systemMessageCode,
            metadata: {
                actorUserId: currentUser.userId,
                deliveryId: delivery.id,
                reasonCode,
                note,
                targetOrderStatus: config.targetOrderStatus,
                targetDeliveryStatus: config.targetDeliveryStatus,
            },
            templateVariables: {
                reasonCode,
                note,
            },
        });
        return this.deliveryQueryService.buildDeliveryDetail(updatedDelivery);
    }
    requireRiderId(currentUser) {
        const riderId = currentUser.actorContext.riderId;
        if (riderId === undefined) {
            throw new app_exception_1.AppException('The authenticated actor does not have a rider scope.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return riderId;
    }
    requireReasonCode(reasonCode) {
        const normalizedReasonCode = this.normalizeOptionalString(reasonCode);
        if (normalizedReasonCode === null) {
            throw new app_exception_1.AppException('A reason code is required for failed deliveries.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        return normalizedReasonCode;
    }
    normalizeOptionalString(value) {
        if (value === undefined || value === null) {
            return null;
        }
        const normalized = value.trim();
        return normalized.length === 0 ? null : normalized;
    }
};
exports.RiderDeliveryActionsService = RiderDeliveryActionsService;
exports.RiderDeliveryActionsService = RiderDeliveryActionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        deliveries_repository_1.DeliveriesRepository,
        orders_repository_1.OrdersRepository,
        delivery_query_service_1.DeliveryQueryService,
        system_message_service_1.SystemMessageService,
        queue_service_1.QueueService])
], RiderDeliveryActionsService);
//# sourceMappingURL=rider-delivery-actions.service.js.map
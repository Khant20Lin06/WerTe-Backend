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
exports.AutoDispatchService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const app_logger_1 = require("../../../infrastructure/logging/app.logger");
const queue_constants_1 = require("../../../infrastructure/queue/queue.constants");
const queue_service_1 = require("../../../infrastructure/queue/queue.service");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const system_authenticated_actor_helper_1 = require("../../auth/entities/system-authenticated-actor.helper");
const deliveries_repository_1 = require("../../deliveries/repositories/deliveries.repository");
const system_message_service_1 = require("../../messaging/services/system-message.service");
const orders_repository_1 = require("../../orders/repositories/orders.repository");
const riders_service_1 = require("../../riders/services/riders.service");
const dispatch_repository_1 = require("../repositories/dispatch.repository");
const dispatch_assignment_policy_helper_1 = require("../policies/dispatch-assignment-policy.helper");
let AutoDispatchService = class AutoDispatchService {
    constructor(logger, queueService, prisma, dispatchRepository, ordersRepository, deliveriesRepository, ridersService, systemMessageService) {
        this.logger = logger;
        this.queueService = queueService;
        this.prisma = prisma;
        this.dispatchRepository = dispatchRepository;
        this.ordersRepository = ordersRepository;
        this.deliveriesRepository = deliveriesRepository;
        this.ridersService = ridersService;
        this.systemMessageService = systemMessageService;
    }
    enqueueForOrder(orderId) {
        return this.queueService.add(queue_constants_1.QueueNames.dispatch, queue_constants_1.QueueJobNames.dispatch.autoDispatchOrder, { orderId }, { delayMs: 500 });
    }
    enqueueForRider(riderId, township) {
        return this.queueService.add(queue_constants_1.QueueNames.dispatch, queue_constants_1.QueueJobNames.dispatch.autoDispatchPendingForRider, { riderId, township }, { delayMs: 500 });
    }
    registerHandlers() {
        this.queueService.registerHandler(queue_constants_1.QueueNames.dispatch, queue_constants_1.QueueJobNames.dispatch.autoDispatchOrder, async (payload) => {
            const { orderId } = payload;
            await this.handleAutoDispatchOrder(orderId);
        });
        this.queueService.registerHandler(queue_constants_1.QueueNames.dispatch, queue_constants_1.QueueJobNames.dispatch.autoDispatchPendingForRider, async (payload) => {
            const { riderId, township } = payload;
            await this.handleAutoDispatchForRider(riderId, township);
        });
    }
    async handleAutoDispatchOrder(orderId) {
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                status: client_1.OrderStatus.MERCHANT_ACCEPTED,
                delivery: { is: null },
                deliveryType: 'DELIVERY',
            },
            select: { id: true, deliveryTownship: true },
        });
        if (order === null) {
            this.logger.debugEvent('Auto-dispatch skipped: order not MERCHANT_ACCEPTED or already has delivery.', { orderId }, 'AutoDispatchService');
            return;
        }
        const township = order.deliveryTownship ?? null;
        const rider = await this.pickEligibleRider(township);
        if (rider === null) {
            this.logger.debugEvent('Auto-dispatch deferred: no eligible rider found for order.', { orderId, township }, 'AutoDispatchService');
            return;
        }
        await this.assignAndNotify(orderId, rider);
    }
    async handleAutoDispatchForRider(riderId, township) {
        const rider = await this.ridersService.findById(riderId);
        if (rider === null || !(0, dispatch_assignment_policy_helper_1.isDispatchEligibleRider)(rider)) {
            this.logger.debugEvent('Auto-dispatch-for-rider skipped: rider not eligible.', { riderId }, 'AutoDispatchService');
            return;
        }
        const orders = await this.dispatchRepository.findReadyOrdersWithoutRider({
            township,
            limit: 1,
        });
        if (orders.length === 0) {
            const fallback = await this.dispatchRepository.findReadyOrdersWithoutRider({
                limit: 1,
            });
            if (fallback.length === 0) {
                this.logger.debugEvent('Auto-dispatch-for-rider: no pending READY orders.', { riderId, township }, 'AutoDispatchService');
                return;
            }
            await this.assignAndNotify(fallback[0].id, rider);
            return;
        }
        await this.assignAndNotify(orders[0].id, rider);
    }
    async pickEligibleRider(township) {
        if (township !== null) {
            const matched = await this.ridersService.findEligibleRiders({ township });
            if (matched.length > 0)
                return matched[0];
        }
        const any = await this.ridersService.findEligibleRiders();
        return any.length > 0 ? any[0] : null;
    }
    async assignAndNotify(orderId, rider) {
        const systemActor = (0, system_authenticated_actor_helper_1.createSystemAuthenticatedActor)('auto-dispatch');
        const assignedAt = new Date();
        try {
            await this.prisma.runInTransaction(async (tx) => {
                await this.deliveriesRepository.upsertAssignedDelivery(orderId, { riderId: rider.id, etaMinutes: null, assignedAt }, tx);
                await this.ordersRepository.updateOrderStatus(orderId, {
                    status: client_1.OrderStatus.RIDER_ASSIGNED,
                    fromStatus: client_1.OrderStatus.MERCHANT_ACCEPTED,
                    changedByUserId: systemActor.userId,
                    reasonCode: 'auto_dispatched',
                    note: null,
                }, tx);
            });
            this.logger.debugEvent('Auto-dispatch: rider assigned.', { orderId, riderId: rider.id }, 'AutoDispatchService');
        }
        catch (err) {
            this.logger.errorEvent('Auto-dispatch: assignment transaction failed.', { orderId, riderId: rider.id, error: String(err) }, 'AutoDispatchService');
            return;
        }
        await this.systemMessageService.publishOrderEvent(systemActor, {
            orderId,
            code: 'RIDER_ASSIGNED',
            metadata: {
                actorUserId: systemActor.userId,
                riderId: rider.id,
                etaMinutes: null,
                reasonCode: 'auto_dispatched',
                note: null,
            },
            templateVariables: {
                riderName: rider.displayName,
                reasonCode: 'auto_dispatched',
                note: null,
            },
        });
    }
};
exports.AutoDispatchService = AutoDispatchService;
exports.AutoDispatchService = AutoDispatchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_logger_1.AppLogger,
        queue_service_1.QueueService,
        prisma_service_1.PrismaService,
        dispatch_repository_1.DispatchRepository,
        orders_repository_1.OrdersRepository,
        deliveries_repository_1.DeliveriesRepository,
        riders_service_1.RidersService,
        system_message_service_1.SystemMessageService])
], AutoDispatchService);
//# sourceMappingURL=auto-dispatch.service.js.map
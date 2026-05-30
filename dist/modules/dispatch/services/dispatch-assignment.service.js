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
exports.DispatchAssignmentService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const deliveries_repository_1 = require("../../deliveries/repositories/deliveries.repository");
const system_message_service_1 = require("../../messaging/services/system-message.service");
const order_policy_service_1 = require("../../orders/policies/order-policy.service");
const orders_repository_1 = require("../../orders/repositories/orders.repository");
const order_query_service_1 = require("../../orders/services/order-query.service");
const riders_service_1 = require("../../riders/services/riders.service");
const dispatch_assignment_policy_helper_1 = require("../policies/dispatch-assignment-policy.helper");
let DispatchAssignmentService = class DispatchAssignmentService {
    constructor(prisma, ordersRepository, orderQueryService, orderPolicyService, deliveriesRepository, ridersService, systemMessageService) {
        this.prisma = prisma;
        this.ordersRepository = ordersRepository;
        this.orderQueryService = orderQueryService;
        this.orderPolicyService = orderPolicyService;
        this.deliveriesRepository = deliveriesRepository;
        this.ridersService = ridersService;
        this.systemMessageService = systemMessageService;
    }
    async assignRiderToOrder(currentUser, input) {
        this.requireAdminAccess(currentUser);
        const order = await this.ordersRepository.findOrderDetailById(input.orderId);
        if (order === null) {
            throw new app_exception_1.AppException('Order was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        const orderDetail = this.orderQueryService.buildOrderDetail(order);
        if (orderDetail.status === 'RIDER_ASSIGNED' &&
            orderDetail.delivery?.riderId === input.riderId) {
            return this.orderQueryService.attachAvailableActions(currentUser, orderDetail);
        }
        if (!this.orderPolicyService.canAdminAssignRider(currentUser, orderDetail)) {
            throw new app_exception_1.AppException('This order is not ready for rider assignment.', common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
        const rider = await this.ridersService.findById(input.riderId);
        if (rider === null) {
            throw new app_exception_1.AppException('Rider was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!(0, dispatch_assignment_policy_helper_1.isDispatchEligibleRider)(rider)) {
            throw new app_exception_1.AppException('The selected rider is not currently available for assignment.', common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
        const assignedAt = new Date();
        await this.prisma.runInTransaction(async (tx) => {
            await this.deliveriesRepository.upsertAssignedDelivery(input.orderId, {
                riderId: rider.id,
                etaMinutes: input.etaMinutes ?? null,
                assignedAt,
            }, tx);
            await this.ordersRepository.updateOrderStatus(input.orderId, {
                status: 'RIDER_ASSIGNED',
                fromStatus: order.status,
                changedByUserId: currentUser.userId,
                reasonCode: this.normalizeOptionalString(input.reasonCode) ??
                    'admin_assigned_rider',
                note: this.normalizeOptionalString(input.note),
            }, tx);
        });
        const updatedOrder = await this.ordersRepository.findOrderDetailById(input.orderId);
        if (updatedOrder === null) {
            throw new app_exception_1.AppException('Assigned order detail could not be reloaded.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        await this.systemMessageService.publishOrderEvent(currentUser, {
            orderId: input.orderId,
            code: 'RIDER_ASSIGNED',
            metadata: {
                actorUserId: currentUser.userId,
                riderId: rider.id,
                etaMinutes: input.etaMinutes ?? null,
                reasonCode: this.normalizeOptionalString(input.reasonCode) ??
                    'admin_assigned_rider',
                note: this.normalizeOptionalString(input.note),
            },
            templateVariables: {
                riderName: rider.displayName,
                reasonCode: this.normalizeOptionalString(input.reasonCode) ??
                    'admin_assigned_rider',
                note: this.normalizeOptionalString(input.note),
            },
        });
        return this.orderQueryService.attachAvailableActions(currentUser, this.orderQueryService.buildOrderDetail(updatedOrder));
    }
    requireAdminAccess(currentUser) {
        if (!this.orderPolicyService.canViewAdminOrders(currentUser)) {
            throw new app_exception_1.AppException('You are not allowed to perform dispatch assignment actions.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
    }
    normalizeOptionalString(value) {
        if (value === undefined || value === null) {
            return null;
        }
        const normalized = value.trim();
        return normalized.length === 0 ? null : normalized;
    }
};
exports.DispatchAssignmentService = DispatchAssignmentService;
exports.DispatchAssignmentService = DispatchAssignmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_repository_1.OrdersRepository,
        order_query_service_1.OrderQueryService,
        order_policy_service_1.OrderPolicyService,
        deliveries_repository_1.DeliveriesRepository,
        riders_service_1.RidersService,
        system_message_service_1.SystemMessageService])
], DispatchAssignmentService);
//# sourceMappingURL=dispatch-assignment.service.js.map
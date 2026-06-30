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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiderDeliveriesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const delivery_detail_dto_1 = require("../dto/delivery-detail.dto");
const rider_delivery_action_dto_1 = require("../dto/rider-delivery-action.dto");
const rider_failed_delivery_dto_1 = require("../dto/rider-failed-delivery.dto");
const rider_delivery_actions_service_1 = require("../services/rider-delivery-actions.service");
const delivery_query_service_1 = require("../services/delivery-query.service");
let RiderDeliveriesController = class RiderDeliveriesController {
    constructor(deliveryQueryService, riderDeliveryActionsService) {
        this.deliveryQueryService = deliveryQueryService;
        this.riderDeliveryActionsService = riderDeliveryActionsService;
    }
    async active(currentUser) {
        const delivery = await this.deliveryQueryService.getRiderActiveDelivery(currentUser);
        return delivery === null ? null : (0, delivery_detail_dto_1.toDeliveryDetailDto)(delivery);
    }
    async detail(currentUser, deliveryId) {
        const delivery = await this.deliveryQueryService.getRiderDeliveryDetail(currentUser, deliveryId);
        return (0, delivery_detail_dto_1.toDeliveryDetailDto)(delivery);
    }
    async accept(currentUser, deliveryId) {
        const delivery = await this.riderDeliveryActionsService.acceptCurrentRiderDeliveryRequest(currentUser, {
            deliveryId,
        });
        return (0, delivery_detail_dto_1.toDeliveryDetailDto)(delivery);
    }
    async reject(currentUser, deliveryId, body) {
        const delivery = await this.riderDeliveryActionsService.rejectCurrentRiderDeliveryRequest(currentUser, {
            deliveryId,
            reasonCode: body?.reasonCode,
            note: body?.note,
        });
        return (0, delivery_detail_dto_1.toDeliveryDetailDto)(delivery);
    }
    async markPickedUp(currentUser, deliveryId) {
        const delivery = await this.riderDeliveryActionsService.markCurrentRiderPickedUp(currentUser, {
            deliveryId,
        });
        return (0, delivery_detail_dto_1.toDeliveryDetailDto)(delivery);
    }
    async markOnTheWay(currentUser, deliveryId) {
        const delivery = await this.riderDeliveryActionsService.markCurrentRiderOnTheWay(currentUser, {
            deliveryId,
        });
        return (0, delivery_detail_dto_1.toDeliveryDetailDto)(delivery);
    }
    async markDelivered(currentUser, deliveryId) {
        const delivery = await this.riderDeliveryActionsService.markCurrentRiderDelivered(currentUser, {
            deliveryId,
        });
        return (0, delivery_detail_dto_1.toDeliveryDetailDto)(delivery);
    }
    async cancelPrePickup(currentUser, deliveryId, body) {
        await this.riderDeliveryActionsService.cancelCurrentRiderDelivery(currentUser, {
            deliveryId,
            reasonCode: body?.reasonCode,
            note: body?.note,
        });
    }
    async markFailed(currentUser, deliveryId, body) {
        const delivery = await this.riderDeliveryActionsService.failCurrentRiderDelivery(currentUser, {
            deliveryId,
            reasonCode: body.reasonCode,
            note: body.note,
        });
        return (0, delivery_detail_dto_1.toDeliveryDetailDto)(delivery);
    }
};
exports.RiderDeliveriesController = RiderDeliveriesController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getRiderActiveDelivery',
        summary: 'Get the active delivery assigned to the authenticated rider',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the active delivery snapshot for the authenticated rider when one exists.',
        type: delivery_detail_dto_1.DeliveryDetailDto,
    }),
    (0, common_1.Get)('deliveries/active'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", Promise)
], RiderDeliveriesController.prototype, "active", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getRiderDeliveryDetail',
        summary: 'Get a delivery detail visible to the authenticated rider',
    }),
    (0, swagger_1.ApiParam)({
        name: 'deliveryId',
        description: 'Delivery identifier assigned to the authenticated rider.',
        example: 'delivery_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the delivery detail visible to the authenticated rider.',
        type: delivery_detail_dto_1.DeliveryDetailDto,
    }),
    (0, common_1.Get)('deliveries/:deliveryId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('deliveryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], RiderDeliveriesController.prototype, "detail", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'acceptRiderDeliveryRequest',
        summary: 'Accept a rider delivery assignment request',
    }),
    (0, swagger_1.ApiParam)({
        name: 'deliveryId',
        description: 'Assigned delivery request identifier.',
        example: 'delivery_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Accepts the rider delivery request and returns the updated delivery snapshot.',
        type: delivery_detail_dto_1.DeliveryDetailDto,
    }),
    (0, common_1.Post)('delivery-requests/:deliveryId/accept'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('deliveryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], RiderDeliveriesController.prototype, "accept", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'rejectRiderDeliveryRequest',
        summary: 'Reject a rider delivery assignment request',
    }),
    (0, swagger_1.ApiParam)({
        name: 'deliveryId',
        description: 'Assigned delivery request identifier.',
        example: 'delivery_1',
    }),
    (0, swagger_1.ApiBody)({ type: rider_delivery_action_dto_1.RiderDeliveryActionDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Rejects the rider delivery request and returns the updated delivery snapshot.',
        type: delivery_detail_dto_1.DeliveryDetailDto,
    }),
    (0, common_1.Post)('delivery-requests/:deliveryId/reject'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('deliveryId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, rider_delivery_action_dto_1.RiderDeliveryActionDto]),
    __metadata("design:returntype", Promise)
], RiderDeliveriesController.prototype, "reject", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'markRiderDeliveryPickedUp',
        summary: 'Mark a rider delivery as picked up',
    }),
    (0, swagger_1.ApiParam)({
        name: 'deliveryId',
        description: 'Accepted delivery identifier.',
        example: 'delivery_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks the delivery as picked up and returns the updated delivery snapshot.',
        type: delivery_detail_dto_1.DeliveryDetailDto,
    }),
    (0, common_1.Post)('deliveries/:deliveryId/picked-up'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('deliveryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], RiderDeliveriesController.prototype, "markPickedUp", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'markRiderDeliveryOnTheWay',
        summary: 'Mark a rider delivery as on the way',
    }),
    (0, swagger_1.ApiParam)({
        name: 'deliveryId',
        description: 'Picked-up delivery identifier.',
        example: 'delivery_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks the delivery as on the way and returns the updated delivery snapshot.',
        type: delivery_detail_dto_1.DeliveryDetailDto,
    }),
    (0, common_1.Post)('deliveries/:deliveryId/on-the-way'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('deliveryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], RiderDeliveriesController.prototype, "markOnTheWay", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'markRiderDeliveryDelivered',
        summary: 'Mark a rider delivery as delivered',
    }),
    (0, swagger_1.ApiParam)({
        name: 'deliveryId',
        description: 'In-transit delivery identifier.',
        example: 'delivery_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks the delivery as delivered and returns the updated delivery snapshot.',
        type: delivery_detail_dto_1.DeliveryDetailDto,
    }),
    (0, common_1.Post)('deliveries/:deliveryId/delivered'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('deliveryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], RiderDeliveriesController.prototype, "markDelivered", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'markRiderDeliveryFailed',
        summary: 'Mark a rider delivery as failed',
    }),
    (0, swagger_1.ApiParam)({
        name: 'deliveryId',
        description: 'Active delivery identifier.',
        example: 'delivery_1',
    }),
    (0, swagger_1.ApiBody)({ type: rider_failed_delivery_dto_1.RiderFailedDeliveryDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks the delivery as failed and returns the updated delivery snapshot.',
        type: delivery_detail_dto_1.DeliveryDetailDto,
    }),
    (0, swagger_1.ApiOperation)({
        operationId: 'cancelRiderDeliveryPrePickup',
        summary: 'Cancel an accepted delivery before pickup',
    }),
    (0, swagger_1.ApiParam)({
        name: 'deliveryId',
        description: 'Accepted delivery identifier to cancel.',
        example: 'delivery_1',
    }),
    (0, swagger_1.ApiBody)({ type: rider_delivery_action_dto_1.RiderDeliveryActionDto, required: false }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.Post)('deliveries/:deliveryId/cancel'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('deliveryId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, rider_delivery_action_dto_1.RiderDeliveryActionDto]),
    __metadata("design:returntype", Promise)
], RiderDeliveriesController.prototype, "cancelPrePickup", null);
__decorate([
    (0, common_1.Post)('deliveries/:deliveryId/failed'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('deliveryId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, rider_failed_delivery_dto_1.RiderFailedDeliveryDto]),
    __metadata("design:returntype", Promise)
], RiderDeliveriesController.prototype, "markFailed", null);
exports.RiderDeliveriesController = RiderDeliveriesController = __decorate([
    (0, swagger_1.ApiTags)('rider-deliveries'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.RIDER),
    (0, common_1.Controller)('rider'),
    __metadata("design:paramtypes", [delivery_query_service_1.DeliveryQueryService,
        rider_delivery_actions_service_1.RiderDeliveryActionsService])
], RiderDeliveriesController);
//# sourceMappingURL=rider-deliveries.controller.js.map
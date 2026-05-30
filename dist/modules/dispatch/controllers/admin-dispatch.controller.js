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
exports.AdminDispatchController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const order_detail_dto_1 = require("../../orders/dto/order-detail.dto");
const assign_rider_dto_1 = require("../dto/assign-rider.dto");
const dispatch_assignment_service_1 = require("../services/dispatch-assignment.service");
let AdminDispatchController = class AdminDispatchController {
    constructor(dispatchAssignmentService) {
        this.dispatchAssignmentService = dispatchAssignmentService;
    }
    async assignRider(currentUser, orderId, body) {
        const order = await this.dispatchAssignmentService.assignRiderToOrder(currentUser, {
            orderId,
            riderId: body.riderId,
            etaMinutes: body.etaMinutes,
            reasonCode: body.reasonCode,
            note: body.note,
        });
        return (0, order_detail_dto_1.toOrderDetailDto)(order);
    }
};
exports.AdminDispatchController = AdminDispatchController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'assignRiderToOrder',
        summary: 'Assign a rider to an order from the admin dispatch control plane',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the administrative control plane.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiBody)({ type: assign_rider_dto_1.AssignRiderDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Assigns a rider to an eligible order and returns the updated order detail snapshot.',
        type: order_detail_dto_1.OrderDetailDto,
    }),
    (0, common_1.Post)('orders/:orderId/assign-rider'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, assign_rider_dto_1.AssignRiderDto]),
    __metadata("design:returntype", Promise)
], AdminDispatchController.prototype, "assignRider", null);
exports.AdminDispatchController = AdminDispatchController = __decorate([
    (0, swagger_1.ApiTags)('admin-dispatch'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/dispatch'),
    __metadata("design:paramtypes", [dispatch_assignment_service_1.DispatchAssignmentService])
], AdminDispatchController);
//# sourceMappingURL=admin-dispatch.controller.js.map
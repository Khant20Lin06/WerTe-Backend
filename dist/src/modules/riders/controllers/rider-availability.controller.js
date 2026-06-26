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
exports.RiderAvailabilityController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const rider_availability_dto_1 = require("../dto/rider-availability.dto");
const rider_availability_service_1 = require("../services/rider-availability.service");
let RiderAvailabilityController = class RiderAvailabilityController {
    constructor(riderAvailabilityService) {
        this.riderAvailabilityService = riderAvailabilityService;
    }
    getCurrentAvailability(currentUser) {
        return this.riderAvailabilityService.getCurrentAvailability(currentUser);
    }
    markOnline(currentUser) {
        return this.riderAvailabilityService.markCurrentRiderOnline(currentUser);
    }
    markOffline(currentUser) {
        return this.riderAvailabilityService.markCurrentRiderOffline(currentUser);
    }
};
exports.RiderAvailabilityController = RiderAvailabilityController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getRiderAvailability',
        summary: 'Return the authenticated rider availability snapshot',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the rider availability state owned by the authenticated rider.',
        type: rider_availability_dto_1.RiderAvailabilityDto,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], RiderAvailabilityController.prototype, "getCurrentAvailability", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'markRiderOnline',
        summary: 'Mark the authenticated rider online and available for dispatch',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks the rider online and available, then returns the updated availability snapshot.',
        type: rider_availability_dto_1.RiderAvailabilityDto,
    }),
    (0, common_1.Post)('online'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], RiderAvailabilityController.prototype, "markOnline", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'markRiderOffline',
        summary: 'Mark the authenticated rider offline',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks the rider offline and unavailable, then returns the updated availability snapshot.',
        type: rider_availability_dto_1.RiderAvailabilityDto,
    }),
    (0, common_1.Post)('offline'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], RiderAvailabilityController.prototype, "markOffline", null);
exports.RiderAvailabilityController = RiderAvailabilityController = __decorate([
    (0, swagger_1.ApiTags)('rider-availability'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.RIDER),
    (0, common_1.Controller)('rider/availability'),
    __metadata("design:paramtypes", [rider_availability_service_1.RiderAvailabilityService])
], RiderAvailabilityController);
//# sourceMappingURL=rider-availability.controller.js.map
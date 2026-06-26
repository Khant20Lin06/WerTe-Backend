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
exports.AdminRidersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const admin_rider_list_dto_1 = require("../dto/admin-rider-list.dto");
const admin_update_rider_status_dto_1 = require("../dto/admin-update-rider-status.dto");
const rider_profile_dto_1 = require("../dto/rider-profile.dto");
const admin_rider_management_service_1 = require("../services/admin-rider-management.service");
let AdminRidersController = class AdminRidersController {
    constructor(adminRiderManagementService) {
        this.adminRiderManagementService = adminRiderManagementService;
    }
    listRiders(query) {
        return this.adminRiderManagementService.listRiders(query.status);
    }
    updateRiderStatus(riderId, body) {
        return this.adminRiderManagementService.updateRiderStatus(riderId, body.status);
    }
};
exports.AdminRidersController = AdminRidersController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adminListRiders',
        summary: 'List all riders with optional status filter',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns list of rider profiles.',
        type: [rider_profile_dto_1.RiderProfileDto],
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_rider_list_dto_1.AdminRiderListQueryDto]),
    __metadata("design:returntype", void 0)
], AdminRidersController.prototype, "listRiders", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adminUpdateRiderStatus',
        summary: 'Approve (ACTIVE) or suspend (SUSPENDED) a rider',
    }),
    (0, swagger_1.ApiParam)({ name: 'riderId', description: 'Rider identifier' }),
    (0, swagger_1.ApiBody)({ type: admin_update_rider_status_dto_1.AdminUpdateRiderStatusDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the updated rider profile.',
        type: rider_profile_dto_1.RiderProfileDto,
    }),
    (0, common_1.Patch)(':riderId/status'),
    __param(0, (0, common_1.Param)('riderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_update_rider_status_dto_1.AdminUpdateRiderStatusDto]),
    __metadata("design:returntype", void 0)
], AdminRidersController.prototype, "updateRiderStatus", null);
exports.AdminRidersController = AdminRidersController = __decorate([
    (0, swagger_1.ApiTags)('admin-riders'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/riders'),
    __metadata("design:paramtypes", [admin_rider_management_service_1.AdminRiderManagementService])
], AdminRidersController);
//# sourceMappingURL=admin-riders.controller.js.map
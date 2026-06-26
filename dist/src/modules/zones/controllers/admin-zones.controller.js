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
exports.AdminZonesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const create_zone_dto_1 = require("../dto/create-zone.dto");
const update_zone_dto_1 = require("../dto/update-zone.dto");
const zone_dto_1 = require("../dto/zone.dto");
const zone_management_service_1 = require("../services/zone-management.service");
let AdminZonesController = class AdminZonesController {
    constructor(zoneManagementService) {
        this.zoneManagementService = zoneManagementService;
    }
    list(currentUser) {
        return this.zoneManagementService.listZones(currentUser);
    }
    get(currentUser, zoneId) {
        return this.zoneManagementService.getZone(currentUser, zoneId);
    }
    create(currentUser, body) {
        return this.zoneManagementService.createZone(currentUser, body);
    }
    update(currentUser, zoneId, body) {
        return this.zoneManagementService.updateZone(currentUser, zoneId, body);
    }
};
exports.AdminZonesController = AdminZonesController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listAdminZones',
        summary: 'List zones for administrative management',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns all zones with branch usage counts.',
        type: zone_dto_1.ZoneDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], AdminZonesController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getAdminZone',
        summary: 'Return one administrative zone record',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns a single zone with its current branch usage count.',
        type: zone_dto_1.ZoneDto,
    }),
    (0, common_1.Get)(':zoneId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], AdminZonesController.prototype, "get", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'createAdminZone',
        summary: 'Create a new delivery zone',
    }),
    (0, swagger_1.ApiBody)({ type: create_zone_dto_1.CreateZoneDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates and returns a new zone.',
        type: zone_dto_1.ZoneDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        create_zone_dto_1.CreateZoneDto]),
    __metadata("design:returntype", void 0)
], AdminZonesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateAdminZone',
        summary: 'Update an existing delivery zone',
    }),
    (0, swagger_1.ApiBody)({ type: update_zone_dto_1.UpdateZoneDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns the requested zone.',
        type: zone_dto_1.ZoneDto,
    }),
    (0, common_1.Patch)(':zoneId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('zoneId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, update_zone_dto_1.UpdateZoneDto]),
    __metadata("design:returntype", void 0)
], AdminZonesController.prototype, "update", null);
exports.AdminZonesController = AdminZonesController = __decorate([
    (0, swagger_1.ApiTags)('admin-zones'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/zones'),
    __metadata("design:paramtypes", [zone_management_service_1.ZoneManagementService])
], AdminZonesController);
//# sourceMappingURL=admin-zones.controller.js.map
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
exports.MerchantZonesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const zone_dto_1 = require("../dto/zone.dto");
const zone_management_service_1 = require("../services/zone-management.service");
let MerchantZonesController = class MerchantZonesController {
    constructor(zoneManagementService) {
        this.zoneManagementService = zoneManagementService;
    }
    listActive(currentUser) {
        return this.zoneManagementService.listActiveZones(currentUser);
    }
};
exports.MerchantZonesController = MerchantZonesController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listMerchantActiveZones',
        summary: 'List active zones available to merchant branch workflows',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns active zones that merchant operators can assign to branches.',
        type: zone_dto_1.ZoneDto,
        isArray: true,
    }),
    (0, common_1.Get)('active'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], MerchantZonesController.prototype, "listActive", null);
exports.MerchantZonesController = MerchantZonesController = __decorate([
    (0, swagger_1.ApiTags)('merchant-zones'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant/zones'),
    __metadata("design:paramtypes", [zone_management_service_1.ZoneManagementService])
], MerchantZonesController);
//# sourceMappingURL=merchant-zones.controller.js.map
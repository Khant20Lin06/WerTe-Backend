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
exports.RiderLocationController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const ingest_rider_location_dto_1 = require("../dto/ingest-rider-location.dto");
const rider_location_dto_1 = require("../dto/rider-location.dto");
const rider_location_service_1 = require("../services/rider-location.service");
let RiderLocationController = class RiderLocationController {
    constructor(riderLocationService) {
        this.riderLocationService = riderLocationService;
    }
    ingest(currentUser, body) {
        return this.riderLocationService.ingestCurrentRiderLocation(currentUser, body);
    }
};
exports.RiderLocationController = RiderLocationController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'ingestRiderLocation',
        summary: 'Persist a rider location snapshot and append location history',
    }),
    (0, swagger_1.ApiBody)({ type: ingest_rider_location_dto_1.IngestRiderLocationDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Stores the current rider location snapshot and appends location history when the update is not a duplicate.',
        type: rider_location_dto_1.RiderLocationDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        ingest_rider_location_dto_1.IngestRiderLocationDto]),
    __metadata("design:returntype", void 0)
], RiderLocationController.prototype, "ingest", null);
exports.RiderLocationController = RiderLocationController = __decorate([
    (0, swagger_1.ApiTags)('rider-location'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.RIDER),
    (0, common_1.Controller)('rider/location'),
    __metadata("design:paramtypes", [rider_location_service_1.RiderLocationService])
], RiderLocationController);
//# sourceMappingURL=rider-location.controller.js.map
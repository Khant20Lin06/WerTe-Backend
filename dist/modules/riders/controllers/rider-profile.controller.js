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
exports.RiderProfileController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const rider_operational_summary_dto_1 = require("../dto/rider-operational-summary.dto");
const rider_profile_dto_1 = require("../dto/rider-profile.dto");
const update_rider_profile_dto_1 = require("../dto/update-rider-profile.dto");
const rider_account_service_1 = require("../services/rider-account.service");
let RiderProfileController = class RiderProfileController {
    constructor(riderAccountService) {
        this.riderAccountService = riderAccountService;
    }
    getCurrentProfile(currentUser) {
        return this.riderAccountService.getCurrentRiderProfile(currentUser);
    }
    updateCurrentProfile(currentUser, body) {
        return this.riderAccountService.updateCurrentRiderProfile(currentUser, body);
    }
    getOperationalSummary(currentUser) {
        return this.riderAccountService.getOperationalSummary(currentUser);
    }
};
exports.RiderProfileController = RiderProfileController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getRiderProfile',
        summary: 'Return the authenticated rider profile',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the rider profile owned by the authenticated rider.',
        type: rider_profile_dto_1.RiderProfileDto,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], RiderProfileController.prototype, "getCurrentProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateRiderProfile',
        summary: 'Update the authenticated rider profile',
    }),
    (0, swagger_1.ApiBody)({ type: update_rider_profile_dto_1.UpdateRiderProfileDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns the authenticated rider profile.',
        type: rider_profile_dto_1.RiderProfileDto,
    }),
    (0, common_1.Patch)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        update_rider_profile_dto_1.UpdateRiderProfileDto]),
    __metadata("design:returntype", void 0)
], RiderProfileController.prototype, "updateCurrentProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getRiderOperationalSummary',
        summary: 'Return the operational summary for the authenticated rider',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns rider operational fields that later dispatch and availability flows can bootstrap from.',
        type: rider_operational_summary_dto_1.RiderOperationalSummaryDto,
    }),
    (0, common_1.Get)('operational-summary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], RiderProfileController.prototype, "getOperationalSummary", null);
exports.RiderProfileController = RiderProfileController = __decorate([
    (0, swagger_1.ApiTags)('rider-profile'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.RIDER),
    (0, common_1.Controller)('rider/profile'),
    __metadata("design:paramtypes", [rider_account_service_1.RiderAccountService])
], RiderProfileController);
//# sourceMappingURL=rider-profile.controller.js.map
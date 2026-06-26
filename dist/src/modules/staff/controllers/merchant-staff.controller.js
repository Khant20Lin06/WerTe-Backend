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
exports.MerchantStaffController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const invite_staff_dto_1 = require("../dto/invite-staff.dto");
const update_staff_dto_1 = require("../dto/update-staff.dto");
const staff_member_dto_1 = require("../dto/staff-member.dto");
const staff_service_1 = require("../services/staff.service");
let MerchantStaffController = class MerchantStaffController {
    constructor(staffService) {
        this.staffService = staffService;
    }
    async list(currentUser) {
        const staff = await this.staffService.listStaff(currentUser);
        return staff.map(staff_member_dto_1.toStaffMemberDto);
    }
    async invite(currentUser, body) {
        const staff = await this.staffService.inviteStaff(currentUser, body);
        return (0, staff_member_dto_1.toStaffMemberDto)(staff);
    }
    async update(currentUser, staffId, body) {
        const staff = await this.staffService.updateStaff(currentUser, staffId, body);
        return (0, staff_member_dto_1.toStaffMemberDto)(staff);
    }
    remove(currentUser, staffId) {
        return this.staffService.removeStaff(currentUser, staffId);
    }
};
exports.MerchantStaffController = MerchantStaffController;
__decorate([
    (0, swagger_1.ApiOperation)({ operationId: 'listMerchantStaff', summary: 'List all staff members' }),
    (0, swagger_1.ApiOkResponse)({ type: staff_member_dto_1.StaffMemberDto, isArray: true }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", Promise)
], MerchantStaffController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({ operationId: 'inviteMerchantStaff', summary: 'Invite a new staff member' }),
    (0, swagger_1.ApiBody)({ type: invite_staff_dto_1.InviteStaffDto }),
    (0, swagger_1.ApiOkResponse)({ type: staff_member_dto_1.StaffMemberDto }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        invite_staff_dto_1.InviteStaffDto]),
    __metadata("design:returntype", Promise)
], MerchantStaffController.prototype, "invite", null);
__decorate([
    (0, swagger_1.ApiOperation)({ operationId: 'updateMerchantStaff', summary: 'Update staff role, status or branch assignments' }),
    (0, swagger_1.ApiBody)({ type: update_staff_dto_1.UpdateStaffDto }),
    (0, swagger_1.ApiOkResponse)({ type: staff_member_dto_1.StaffMemberDto }),
    (0, common_1.Patch)(':staffId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('staffId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, update_staff_dto_1.UpdateStaffDto]),
    __metadata("design:returntype", Promise)
], MerchantStaffController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ operationId: 'removeMerchantStaff', summary: 'Remove a staff member' }),
    (0, swagger_1.ApiNoContentResponse)({ description: 'Staff member removed.' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.Delete)(':staffId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('staffId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], MerchantStaffController.prototype, "remove", null);
exports.MerchantStaffController = MerchantStaffController = __decorate([
    (0, swagger_1.ApiTags)('merchant-staff'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant/staff'),
    __metadata("design:paramtypes", [staff_service_1.StaffService])
], MerchantStaffController);
//# sourceMappingURL=merchant-staff.controller.js.map
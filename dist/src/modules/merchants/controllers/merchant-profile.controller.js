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
exports.MerchantProfileController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const merchant_profile_dto_1 = require("../dto/merchant-profile.dto");
const update_merchant_profile_dto_1 = require("../dto/update-merchant-profile.dto");
const merchant_account_service_1 = require("../services/merchant-account.service");
let MerchantProfileController = class MerchantProfileController {
    constructor(merchantAccountService) {
        this.merchantAccountService = merchantAccountService;
    }
    getCurrentProfile(currentUser) {
        return this.merchantAccountService.getCurrentMerchantProfile(currentUser);
    }
    updateCurrentProfile(currentUser, body) {
        return this.merchantAccountService.updateCurrentMerchantProfile(currentUser, body);
    }
};
exports.MerchantProfileController = MerchantProfileController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getMerchantProfile',
        summary: 'Return the authenticated merchant profile',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the merchant profile owned by the authenticated user.',
        type: merchant_profile_dto_1.MerchantProfileDto,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], MerchantProfileController.prototype, "getCurrentProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateMerchantProfile',
        summary: 'Update the authenticated merchant profile',
    }),
    (0, swagger_1.ApiBody)({ type: update_merchant_profile_dto_1.UpdateMerchantProfileDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns the authenticated merchant profile.',
        type: merchant_profile_dto_1.MerchantProfileDto,
    }),
    (0, common_1.Patch)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        update_merchant_profile_dto_1.UpdateMerchantProfileDto]),
    __metadata("design:returntype", void 0)
], MerchantProfileController.prototype, "updateCurrentProfile", null);
exports.MerchantProfileController = MerchantProfileController = __decorate([
    (0, swagger_1.ApiTags)('merchant-profile'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant/profile'),
    __metadata("design:paramtypes", [merchant_account_service_1.MerchantAccountService])
], MerchantProfileController);
//# sourceMappingURL=merchant-profile.controller.js.map
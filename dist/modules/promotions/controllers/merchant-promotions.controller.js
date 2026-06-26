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
exports.MerchantPromotionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const create_promotion_dto_1 = require("../dto/create-promotion.dto");
const promotion_dto_1 = require("../dto/promotion.dto");
const merchant_promotions_service_1 = require("../services/merchant-promotions.service");
let MerchantPromotionsController = class MerchantPromotionsController {
    constructor(merchantPromotionsService) {
        this.merchantPromotionsService = merchantPromotionsService;
    }
    list(currentUser, branchId) {
        return this.merchantPromotionsService.listBranchPromotions(currentUser, branchId);
    }
    get(currentUser, branchId, promotionId) {
        return this.merchantPromotionsService.getBranchPromotion(currentUser, branchId, promotionId);
    }
    create(currentUser, branchId, body) {
        return this.merchantPromotionsService.createBranchPromotion(currentUser, branchId, body);
    }
    update(currentUser, branchId, promotionId, body) {
        return this.merchantPromotionsService.updateBranchPromotion(currentUser, branchId, promotionId, body);
    }
    async delete(currentUser, branchId, promotionId) {
        await this.merchantPromotionsService.deleteBranchPromotion(currentUser, branchId, promotionId);
    }
};
exports.MerchantPromotionsController = MerchantPromotionsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listMerchantBranchPromotions',
        summary: 'List promotions for a merchant-owned branch',
    }),
    (0, swagger_1.ApiParam)({
        name: 'branchId',
        description: 'Branch identifier owned by the authenticated merchant.',
        example: 'branch_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns promotions configured for the merchant-owned branch.',
        type: promotion_dto_1.PromotionDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], MerchantPromotionsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getMerchantBranchPromotion',
        summary: 'Return one promotion for a merchant-owned branch',
    }),
    (0, swagger_1.ApiParam)({
        name: 'branchId',
        description: 'Branch identifier owned by the authenticated merchant.',
        example: 'branch_1',
    }),
    (0, swagger_1.ApiParam)({
        name: 'promotionId',
        description: 'Promotion identifier scoped to the branch.',
        example: 'promo_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns one promotion configured for the branch.',
        type: promotion_dto_1.PromotionDto,
    }),
    (0, common_1.Get)(':promotionId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('promotionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String]),
    __metadata("design:returntype", void 0)
], MerchantPromotionsController.prototype, "get", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'createMerchantBranchPromotion',
        summary: 'Create a promotion for a merchant-owned branch',
    }),
    (0, swagger_1.ApiBody)({ type: create_promotion_dto_1.CreatePromotionDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates and returns the requested branch promotion.',
        type: promotion_dto_1.PromotionDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, create_promotion_dto_1.CreatePromotionDto]),
    __metadata("design:returntype", void 0)
], MerchantPromotionsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateMerchantBranchPromotion',
        summary: 'Update a promotion for a merchant-owned branch',
    }),
    (0, swagger_1.ApiBody)({ type: create_promotion_dto_1.UpdatePromotionDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns the requested branch promotion.',
        type: promotion_dto_1.PromotionDto,
    }),
    (0, common_1.Patch)(':promotionId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('promotionId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, create_promotion_dto_1.UpdatePromotionDto]),
    __metadata("design:returntype", void 0)
], MerchantPromotionsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'deleteMerchantBranchPromotion',
        summary: 'Soft-delete a promotion for a merchant-owned branch',
    }),
    (0, swagger_1.ApiNoContentResponse)({ description: 'Promotion deleted successfully.' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.Delete)(':promotionId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('promotionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String]),
    __metadata("design:returntype", Promise)
], MerchantPromotionsController.prototype, "delete", null);
exports.MerchantPromotionsController = MerchantPromotionsController = __decorate([
    (0, swagger_1.ApiTags)('merchant-promotions'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant/branches/:branchId/promotions'),
    __metadata("design:paramtypes", [merchant_promotions_service_1.MerchantPromotionsService])
], MerchantPromotionsController);
//# sourceMappingURL=merchant-promotions.controller.js.map
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
exports.AdminPromotionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const create_promotion_dto_1 = require("../dto/create-promotion.dto");
const admin_promotion_dto_1 = require("../dto/admin-promotion.dto");
const admin_promotions_service_1 = require("../services/admin-promotions.service");
class AdminCreatePromotionDto extends create_promotion_dto_1.CreatePromotionDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Branch to create the promotion for', example: 'branch_1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminCreatePromotionDto.prototype, "branchId", void 0);
class AdminListPromotionsQueryDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by branch ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminListPromotionsQueryDto.prototype, "branchId", void 0);
let AdminPromotionsController = class AdminPromotionsController {
    constructor(adminPromotionsService) {
        this.adminPromotionsService = adminPromotionsService;
    }
    list(_query) {
        return this.adminPromotionsService.listPromotions();
    }
    create(body) {
        const { branchId, ...rest } = body;
        return this.adminPromotionsService.createPromotion(branchId, rest);
    }
    update(promotionId, body) {
        return this.adminPromotionsService.updatePromotion(promotionId, body);
    }
};
exports.AdminPromotionsController = AdminPromotionsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adminListPromotions',
        summary: 'List all promotions across all merchants',
    }),
    (0, swagger_1.ApiOkResponse)({ type: [admin_promotion_dto_1.AdminPromotionDto] }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdminListPromotionsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminPromotionsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adminCreatePromotion',
        summary: 'Create a promotion for any branch',
    }),
    (0, swagger_1.ApiBody)({ type: AdminCreatePromotionDto }),
    (0, swagger_1.ApiCreatedResponse)({ type: admin_promotion_dto_1.AdminPromotionDto }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdminCreatePromotionDto]),
    __metadata("design:returntype", void 0)
], AdminPromotionsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adminUpdatePromotion',
        summary: 'Update or deactivate a promotion',
    }),
    (0, swagger_1.ApiParam)({ name: 'promotionId', description: 'Promotion identifier' }),
    (0, swagger_1.ApiBody)({ type: create_promotion_dto_1.UpdatePromotionDto }),
    (0, swagger_1.ApiOkResponse)({ type: admin_promotion_dto_1.AdminPromotionDto }),
    (0, common_1.Patch)(':promotionId'),
    __param(0, (0, common_1.Param)('promotionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_promotion_dto_1.UpdatePromotionDto]),
    __metadata("design:returntype", void 0)
], AdminPromotionsController.prototype, "update", null);
exports.AdminPromotionsController = AdminPromotionsController = __decorate([
    (0, swagger_1.ApiTags)('admin-promotions'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/promotions'),
    __metadata("design:paramtypes", [admin_promotions_service_1.AdminPromotionsService])
], AdminPromotionsController);
//# sourceMappingURL=admin-promotions.controller.js.map
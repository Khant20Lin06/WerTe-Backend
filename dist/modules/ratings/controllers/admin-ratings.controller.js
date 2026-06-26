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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRatingsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const create_rating_dto_1 = require("../dto/create-rating.dto");
const ratings_service_1 = require("../ratings.service");
let AdminRatingsController = class AdminRatingsController {
    constructor(ratingsService) {
        this.ratingsService = ratingsService;
    }
    async stats() {
        return this.ratingsService.getAdminStats();
    }
    async list(targetType, page = '1', limit = '50') {
        const { items, total } = await this.ratingsService.getAdminList({
            targetType,
            page: Math.max(1, parseInt(page, 10) || 1),
            limit: Math.min(200, Math.max(1, parseInt(limit, 10) || 50)),
        });
        return { items: items.map(create_rating_dto_1.toRatingDto), total };
    }
    async topBranches(limit = '10') {
        return this.ratingsService.getTopRatedBranches(Math.min(50, Math.max(1, parseInt(limit, 10) || 10)));
    }
    async topRiders(limit = '10') {
        return this.ratingsService.getTopRatedRiders(Math.min(50, Math.max(1, parseInt(limit, 10) || 10)));
    }
};
exports.AdminRatingsController = AdminRatingsController;
__decorate([
    (0, swagger_1.ApiOperation)({ operationId: 'getAdminRatingsStats', summary: 'Platform-wide rating statistics' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Aggregated rating stats by target type' }),
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminRatingsController.prototype, "stats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ operationId: 'getAdminRatingsList', summary: 'List all ratings (paginated)' }),
    (0, swagger_1.ApiQuery)({ name: 'targetType', enum: client_1.RatingTargetType, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    (0, swagger_1.ApiOkResponse)({ type: [create_rating_dto_1.RatingDto] }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('targetType')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof client_1.RatingTargetType !== "undefined" && client_1.RatingTargetType) === "function" ? _a : Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminRatingsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({ operationId: 'getTopRatedBranches', summary: 'Top rated branches' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    (0, common_1.Get)('top-branches'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminRatingsController.prototype, "topBranches", null);
__decorate([
    (0, swagger_1.ApiOperation)({ operationId: 'getTopRatedRiders', summary: 'Top rated riders' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    (0, common_1.Get)('top-riders'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminRatingsController.prototype, "topRiders", null);
exports.AdminRatingsController = AdminRatingsController = __decorate([
    (0, swagger_1.ApiTags)('admin-ratings'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/ratings'),
    __metadata("design:paramtypes", [ratings_service_1.RatingsService])
], AdminRatingsController);
//# sourceMappingURL=admin-ratings.controller.js.map
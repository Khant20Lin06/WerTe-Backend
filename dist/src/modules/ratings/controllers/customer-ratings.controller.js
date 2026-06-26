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
exports.CustomerRatingsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const create_rating_dto_1 = require("../dto/create-rating.dto");
const ratings_service_1 = require("../ratings.service");
let CustomerRatingsController = class CustomerRatingsController {
    constructor(ratingsService) {
        this.ratingsService = ratingsService;
    }
    async create(user, orderId, dto) {
        const rating = await this.ratingsService.createCustomerRating(user.actorContext.customerProfileId, orderId, dto);
        return (0, create_rating_dto_1.toRatingDto)(rating);
    }
    async list(orderId) {
        const ratings = await this.ratingsService.getOrderRatings(orderId);
        return ratings.map(create_rating_dto_1.toRatingDto);
    }
};
exports.CustomerRatingsController = CustomerRatingsController;
__decorate([
    (0, swagger_1.ApiOperation)({ operationId: 'createCustomerRating', summary: 'Rate rider or branch after delivery' }),
    (0, swagger_1.ApiParam)({ name: 'orderId' }),
    (0, swagger_1.ApiBody)({ type: create_rating_dto_1.CreateRatingDto }),
    (0, swagger_1.ApiCreatedResponse)({ type: create_rating_dto_1.RatingDto }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, create_rating_dto_1.CreateRatingDto]),
    __metadata("design:returntype", Promise)
], CustomerRatingsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ operationId: 'getOrderRatings', summary: 'Get ratings for an order' }),
    (0, swagger_1.ApiParam)({ name: 'orderId' }),
    (0, swagger_1.ApiOkResponse)({ type: [create_rating_dto_1.RatingDto] }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerRatingsController.prototype, "list", null);
exports.CustomerRatingsController = CustomerRatingsController = __decorate([
    (0, swagger_1.ApiTags)('customer-ratings'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER),
    (0, common_1.Controller)('customer/orders/:orderId/ratings'),
    __metadata("design:paramtypes", [ratings_service_1.RatingsService])
], CustomerRatingsController);
//# sourceMappingURL=customer-ratings.controller.js.map
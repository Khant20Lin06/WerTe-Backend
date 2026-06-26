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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const ratings_repository_1 = require("./repositories/ratings.repository");
let RatingsService = class RatingsService {
    constructor(ratingsRepository, prisma) {
        this.ratingsRepository = ratingsRepository;
        this.prisma = prisma;
    }
    async createCustomerRating(customerId, orderId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { delivery: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.customerProfileId !== customerId)
            throw new common_1.ForbiddenException('Not your order');
        if (order.status !== 'DELIVERED') {
            throw new common_1.BadRequestException('Order must be delivered before rating');
        }
        if (dto.targetType === client_1.RatingTargetType.RIDER) {
            if (!order.delivery?.riderId)
                throw new common_1.BadRequestException('No rider assigned to this order');
            if (order.delivery.riderId !== dto.targetId)
                throw new common_1.BadRequestException('Invalid rider for this order');
        }
        else if (dto.targetType === client_1.RatingTargetType.BRANCH) {
            if (order.branchId !== dto.targetId)
                throw new common_1.BadRequestException('Invalid branch for this order');
        }
        else {
            throw new common_1.BadRequestException('Customers can only rate RIDER or BRANCH');
        }
        const existing = await this.ratingsRepository.findExisting(orderId, client_1.RaterType.CUSTOMER, dto.targetType);
        if (existing)
            throw new common_1.BadRequestException('You have already rated this for the order');
        return this.ratingsRepository.create({
            orderId,
            raterType: client_1.RaterType.CUSTOMER,
            raterId: customerId,
            targetType: dto.targetType,
            targetId: dto.targetId,
            score: dto.score,
            comment: dto.comment,
        });
    }
    async createRiderRating(riderId, deliveryId, dto) {
        const delivery = await this.prisma.delivery.findUnique({
            where: { id: deliveryId },
            include: { order: true },
        });
        if (!delivery)
            throw new common_1.NotFoundException('Delivery not found');
        if (delivery.riderId !== riderId)
            throw new common_1.ForbiddenException('Not your delivery');
        if (delivery.status !== 'DELIVERED') {
            throw new common_1.BadRequestException('Delivery must be completed before rating');
        }
        if (dto.targetType !== client_1.RatingTargetType.CUSTOMER) {
            throw new common_1.BadRequestException('Riders can only rate CUSTOMER');
        }
        if (delivery.order.customerProfileId !== dto.targetId) {
            throw new common_1.BadRequestException('Invalid customer for this delivery');
        }
        const existing = await this.ratingsRepository.findExisting(delivery.orderId, client_1.RaterType.RIDER, client_1.RatingTargetType.CUSTOMER);
        if (existing)
            throw new common_1.BadRequestException('You have already rated this customer');
        return this.ratingsRepository.create({
            orderId: delivery.orderId,
            raterType: client_1.RaterType.RIDER,
            raterId: riderId,
            targetType: client_1.RatingTargetType.CUSTOMER,
            targetId: dto.targetId,
            score: dto.score,
            comment: dto.comment,
        });
    }
    async getOrderRatings(orderId) {
        return this.ratingsRepository.findByOrder(orderId);
    }
    async getTargetRatings(targetType, targetId) {
        const [ratings, average] = await Promise.all([
            this.ratingsRepository.findByTarget(targetType, targetId),
            this.ratingsRepository.averageScore(targetType, targetId),
        ]);
        return { ratings, average, count: ratings.length };
    }
    async getAdminStats() {
        return this.ratingsRepository.globalStats();
    }
    async getAdminList(params) {
        return this.ratingsRepository.listAll(params);
    }
    async getTopRatedBranches(limit = 10) {
        return this.ratingsRepository.topRatedBranches(limit);
    }
    async getTopRatedRiders(limit = 10) {
        return this.ratingsRepository.topRatedRiders(limit);
    }
};
exports.RatingsService = RatingsService;
exports.RatingsService = RatingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ratings_repository_1.RatingsRepository,
        prisma_service_1.PrismaService])
], RatingsService);
//# sourceMappingURL=ratings.service.js.map
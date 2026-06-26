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
exports.PromotionsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const promotion_entity_1 = require("../entities/promotion.entity");
let PromotionsRepository = class PromotionsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.promotion.findMany({
            where: { deletedAt: null },
            select: { ...promotion_entity_1.promotionSelect, _count: { select: { orders: true } } },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
    }
    listBranchPromotions(branchId, client = this.prisma) {
        return client.promotion.findMany({
            where: { branchId, deletedAt: null },
            select: promotion_entity_1.promotionSelect,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
    }
    findPromotionById(promotionId, client = this.prisma) {
        return client.promotion.findFirst({
            where: { id: promotionId, deletedAt: null },
            select: promotion_entity_1.promotionSelect,
        });
    }
    findPromotionByBranchIdAndCode(branchId, code, client = this.prisma) {
        return client.promotion.findFirst({
            where: { branchId, code, deletedAt: null },
            select: promotion_entity_1.promotionSelect,
        });
    }
    createPromotion(data, client = this.prisma) {
        return client.promotion.create({
            data,
            select: promotion_entity_1.promotionSelect,
        });
    }
    updatePromotion(promotionId, data, client = this.prisma) {
        return client.promotion.update({
            where: { id: promotionId },
            data,
            select: promotion_entity_1.promotionSelect,
        });
    }
    softDeletePromotion(promotionId, client = this.prisma) {
        return client.promotion.update({
            where: { id: promotionId },
            data: { deletedAt: new Date() },
            select: promotion_entity_1.promotionSelect,
        });
    }
    countCustomerUsage(promotionId, customerProfileId, client = this.prisma) {
        return client.promotionUsage.count({
            where: { promotionId, customerProfileId },
        });
    }
    createUsage(data, client = this.prisma) {
        return client.promotionUsage.create({
            data,
            select: { id: true },
        });
    }
};
exports.PromotionsRepository = PromotionsRepository;
exports.PromotionsRepository = PromotionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromotionsRepository);
//# sourceMappingURL=promotions.repository.js.map
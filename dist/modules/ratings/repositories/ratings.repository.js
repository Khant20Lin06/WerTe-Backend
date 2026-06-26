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
exports.RatingsRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
let RatingsRepository = class RatingsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.rating.create({ data });
    }
    async findByOrder(orderId) {
        return this.prisma.rating.findMany({ where: { orderId } });
    }
    async findByTarget(targetType, targetId) {
        return this.prisma.rating.findMany({
            where: { targetType, targetId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findExisting(orderId, raterType, targetType) {
        return this.prisma.rating.findUnique({
            where: { orderId_raterType_targetType: { orderId, raterType, targetType } },
        });
    }
    async averageScore(targetType, targetId) {
        const result = await this.prisma.rating.aggregate({
            where: { targetType, targetId },
            _avg: { score: true },
            _count: true,
        });
        return result._avg.score ?? 0;
    }
    async listAll(params) {
        const where = params.targetType ? { targetType: params.targetType } : {};
        const [items, total] = await Promise.all([
            this.prisma.rating.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (params.page - 1) * params.limit,
                take: params.limit,
            }),
            this.prisma.rating.count({ where }),
        ]);
        return { items, total };
    }
    async globalStats() {
        const [totalCount, avgBranch, avgRider, avgCustomer, scoreDistribution] = await Promise.all([
            this.prisma.rating.count(),
            this.prisma.rating.aggregate({
                where: { targetType: client_1.RatingTargetType.BRANCH },
                _avg: { score: true },
                _count: true,
            }),
            this.prisma.rating.aggregate({
                where: { targetType: client_1.RatingTargetType.RIDER },
                _avg: { score: true },
                _count: true,
            }),
            this.prisma.rating.aggregate({
                where: { targetType: client_1.RatingTargetType.CUSTOMER },
                _avg: { score: true },
                _count: true,
            }),
            this.prisma.rating.groupBy({
                by: ['score'],
                _count: true,
                orderBy: { score: 'asc' },
            }),
        ]);
        return {
            totalCount,
            branch: {
                count: avgBranch._count,
                average: avgBranch._avg.score ?? 0,
            },
            rider: {
                count: avgRider._count,
                average: avgRider._avg.score ?? 0,
            },
            customer: {
                count: avgCustomer._count,
                average: avgCustomer._avg.score ?? 0,
            },
            scoreDistribution: scoreDistribution.map((r) => ({
                score: r.score,
                count: r._count,
            })),
        };
    }
    async topRatedBranches(limit = 10) {
        const result = await this.prisma.rating.groupBy({
            by: ['targetId'],
            where: { targetType: client_1.RatingTargetType.BRANCH },
            _avg: { score: true },
            _count: true,
            orderBy: { _avg: { score: 'desc' } },
            take: limit,
            having: { score: { _count: { gte: 1 } } },
        });
        return result.map((r) => ({
            branchId: r.targetId,
            average: r._avg.score ?? 0,
            count: r._count,
        }));
    }
    async topRatedRiders(limit = 10) {
        const result = await this.prisma.rating.groupBy({
            by: ['targetId'],
            where: { targetType: client_1.RatingTargetType.RIDER },
            _avg: { score: true },
            _count: true,
            orderBy: { _avg: { score: 'desc' } },
            take: limit,
            having: { score: { _count: { gte: 1 } } },
        });
        return result.map((r) => ({
            riderId: r.targetId,
            average: r._avg.score ?? 0,
            count: r._count,
        }));
    }
};
exports.RatingsRepository = RatingsRepository;
exports.RatingsRepository = RatingsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RatingsRepository);
//# sourceMappingURL=ratings.repository.js.map
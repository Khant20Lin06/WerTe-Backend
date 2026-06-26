import { Injectable } from '@nestjs/common';
import { RaterType, RatingTargetType } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class RatingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    orderId: string;
    raterType: RaterType;
    raterId: string;
    targetType: RatingTargetType;
    targetId: string;
    score: number;
    comment?: string;
  }) {
    return this.prisma.rating.create({ data });
  }

  async findByOrder(orderId: string) {
    return this.prisma.rating.findMany({ where: { orderId } });
  }

  async findByTarget(targetType: RatingTargetType, targetId: string) {
    return this.prisma.rating.findMany({
      where: { targetType, targetId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findExisting(orderId: string, raterType: RaterType, targetType: RatingTargetType) {
    return this.prisma.rating.findUnique({
      where: { orderId_raterType_targetType: { orderId, raterType, targetType } },
    });
  }

  async averageScore(targetType: RatingTargetType, targetId: string): Promise<number> {
    const result = await this.prisma.rating.aggregate({
      where: { targetType, targetId },
      _avg: { score: true },
      _count: true,
    });
    return result._avg.score ?? 0;
  }

  async listAll(params: { targetType?: RatingTargetType; page: number; limit: number }) {
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
        where: { targetType: RatingTargetType.BRANCH },
        _avg: { score: true },
        _count: true,
      }),
      this.prisma.rating.aggregate({
        where: { targetType: RatingTargetType.RIDER },
        _avg: { score: true },
        _count: true,
      }),
      this.prisma.rating.aggregate({
        where: { targetType: RatingTargetType.CUSTOMER },
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
      where: { targetType: RatingTargetType.BRANCH },
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
      where: { targetType: RatingTargetType.RIDER },
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
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { promotionSelect, PromotionRecord } from '../entities/promotion.entity';

type PromotionsDatabaseClient = PrismaService | Prisma.TransactionClient;

export type PromotionWithCount = PromotionRecord & { _count: { orders: number } };

@Injectable()
export class PromotionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PromotionWithCount[]> {
    return this.prisma.promotion.findMany({
      where: { deletedAt: null },
      select: { ...promotionSelect, _count: { select: { orders: true } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    }) as Promise<PromotionWithCount[]>;
  }

  listBranchPromotions(
    branchId: string,
    client: PromotionsDatabaseClient = this.prisma,
  ): Promise<PromotionRecord[]> {
    return client.promotion.findMany({
      where: { branchId, deletedAt: null },
      select: promotionSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  findPromotionById(
    promotionId: string,
    client: PromotionsDatabaseClient = this.prisma,
  ): Promise<PromotionRecord | null> {
    return client.promotion.findFirst({
      where: { id: promotionId, deletedAt: null },
      select: promotionSelect,
    });
  }

  findPromotionByBranchIdAndCode(
    branchId: string,
    code: string,
    client: PromotionsDatabaseClient = this.prisma,
  ): Promise<PromotionRecord | null> {
    return client.promotion.findFirst({
      where: { branchId, code, deletedAt: null },
      select: promotionSelect,
    });
  }

  createPromotion(
    data: Prisma.PromotionUncheckedCreateInput,
    client: PromotionsDatabaseClient = this.prisma,
  ): Promise<PromotionRecord> {
    return client.promotion.create({
      data,
      select: promotionSelect,
    });
  }

  updatePromotion(
    promotionId: string,
    data: Prisma.PromotionUncheckedUpdateInput,
    client: PromotionsDatabaseClient = this.prisma,
  ): Promise<PromotionRecord> {
    return client.promotion.update({
      where: { id: promotionId },
      data,
      select: promotionSelect,
    });
  }

  softDeletePromotion(
    promotionId: string,
    client: PromotionsDatabaseClient = this.prisma,
  ): Promise<PromotionRecord> {
    return client.promotion.update({
      where: { id: promotionId },
      data: { deletedAt: new Date() },
      select: promotionSelect,
    });
  }

  countCustomerUsage(
    promotionId: string,
    customerProfileId: string,
    client: PromotionsDatabaseClient = this.prisma,
  ): Promise<number> {
    return client.promotionUsage.count({
      where: { promotionId, customerProfileId },
    });
  }

  createUsage(
    data: { promotionId: string; customerProfileId: string; orderId: string },
    client: PromotionsDatabaseClient = this.prisma,
  ): Promise<{ id: string }> {
    return client.promotionUsage.create({
      data,
      select: { id: true },
    });
  }
}

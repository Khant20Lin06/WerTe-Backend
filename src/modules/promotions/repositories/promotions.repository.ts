import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { promotionSelect, PromotionRecord } from '../entities/promotion.entity';

type PromotionsDatabaseClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class PromotionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listBranchPromotions(
    branchId: string,
    client: PromotionsDatabaseClient = this.prisma,
  ): Promise<PromotionRecord[]> {
    return client.promotion.findMany({
      where: { branchId },
      select: promotionSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  findPromotionById(
    promotionId: string,
    client: PromotionsDatabaseClient = this.prisma,
  ): Promise<PromotionRecord | null> {
    return client.promotion.findUnique({
      where: { id: promotionId },
      select: promotionSelect,
    });
  }

  findPromotionByBranchIdAndCode(
    branchId: string,
    code: string,
    client: PromotionsDatabaseClient = this.prisma,
  ): Promise<PromotionRecord | null> {
    return client.promotion.findUnique({
      where: {
        branchId_code: {
          branchId,
          code,
        },
      },
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
}

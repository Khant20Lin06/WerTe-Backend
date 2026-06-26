import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PromotionRecord } from '../entities/promotion.entity';
type PromotionsDatabaseClient = PrismaService | Prisma.TransactionClient;
export type PromotionWithCount = PromotionRecord & {
    _count: {
        orders: number;
    };
};
export declare class PromotionsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<PromotionWithCount[]>;
    listBranchPromotions(branchId: string, client?: PromotionsDatabaseClient): Promise<PromotionRecord[]>;
    findPromotionById(promotionId: string, client?: PromotionsDatabaseClient): Promise<PromotionRecord | null>;
    findPromotionByBranchIdAndCode(branchId: string, code: string, client?: PromotionsDatabaseClient): Promise<PromotionRecord | null>;
    createPromotion(data: Prisma.PromotionUncheckedCreateInput, client?: PromotionsDatabaseClient): Promise<PromotionRecord>;
    updatePromotion(promotionId: string, data: Prisma.PromotionUncheckedUpdateInput, client?: PromotionsDatabaseClient): Promise<PromotionRecord>;
    softDeletePromotion(promotionId: string, client?: PromotionsDatabaseClient): Promise<PromotionRecord>;
    countCustomerUsage(promotionId: string, customerProfileId: string, client?: PromotionsDatabaseClient): Promise<number>;
    createUsage(data: {
        promotionId: string;
        customerProfileId: string;
        orderId: string;
    }, client?: PromotionsDatabaseClient): Promise<{
        id: string;
    }>;
}
export {};

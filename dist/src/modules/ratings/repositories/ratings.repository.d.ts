import { RaterType, RatingTargetType } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
export declare class RatingsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        orderId: string;
        raterType: RaterType;
        raterId: string;
        targetType: RatingTargetType;
        targetId: string;
        score: number;
        comment?: string;
    }): Promise<any>;
    findByOrder(orderId: string): Promise<any>;
    findByTarget(targetType: RatingTargetType, targetId: string): Promise<any>;
    findExisting(orderId: string, raterType: RaterType, targetType: RatingTargetType): Promise<any>;
    averageScore(targetType: RatingTargetType, targetId: string): Promise<number>;
    listAll(params: {
        targetType?: RatingTargetType;
        page: number;
        limit: number;
    }): Promise<{
        items: any;
        total: any;
    }>;
    globalStats(): Promise<{
        totalCount: any;
        branch: {
            count: any;
            average: any;
        };
        rider: {
            count: any;
            average: any;
        };
        customer: {
            count: any;
            average: any;
        };
        scoreDistribution: any;
    }>;
    topRatedBranches(limit?: number): Promise<any>;
    topRatedRiders(limit?: number): Promise<any>;
}

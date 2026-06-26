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
    }): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        raterType: import(".prisma/client").$Enums.RaterType;
        raterId: string;
        targetType: import(".prisma/client").$Enums.RatingTargetType;
        targetId: string;
        score: number;
        comment: string | null;
    }>;
    findByOrder(orderId: string): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        raterType: import(".prisma/client").$Enums.RaterType;
        raterId: string;
        targetType: import(".prisma/client").$Enums.RatingTargetType;
        targetId: string;
        score: number;
        comment: string | null;
    }[]>;
    findByTarget(targetType: RatingTargetType, targetId: string): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        raterType: import(".prisma/client").$Enums.RaterType;
        raterId: string;
        targetType: import(".prisma/client").$Enums.RatingTargetType;
        targetId: string;
        score: number;
        comment: string | null;
    }[]>;
    findExisting(orderId: string, raterType: RaterType, targetType: RatingTargetType): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        raterType: import(".prisma/client").$Enums.RaterType;
        raterId: string;
        targetType: import(".prisma/client").$Enums.RatingTargetType;
        targetId: string;
        score: number;
        comment: string | null;
    } | null>;
    averageScore(targetType: RatingTargetType, targetId: string): Promise<number>;
    listAll(params: {
        targetType?: RatingTargetType;
        page: number;
        limit: number;
    }): Promise<{
        items: {
            id: string;
            createdAt: Date;
            orderId: string;
            raterType: import(".prisma/client").$Enums.RaterType;
            raterId: string;
            targetType: import(".prisma/client").$Enums.RatingTargetType;
            targetId: string;
            score: number;
            comment: string | null;
        }[];
        total: number;
    }>;
    globalStats(): Promise<{
        totalCount: number;
        branch: {
            count: number;
            average: number;
        };
        rider: {
            count: number;
            average: number;
        };
        customer: {
            count: number;
            average: number;
        };
        scoreDistribution: {
            score: number;
            count: number;
        }[];
    }>;
    topRatedBranches(limit?: number): Promise<{
        branchId: string;
        average: number;
        count: number;
    }[]>;
    topRatedRiders(limit?: number): Promise<{
        riderId: string;
        average: number;
        count: number;
    }[]>;
}

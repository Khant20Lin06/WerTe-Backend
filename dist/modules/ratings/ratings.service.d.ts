import { RatingTargetType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingsRepository } from './repositories/ratings.repository';
export declare class RatingsService {
    private readonly ratingsRepository;
    private readonly prisma;
    constructor(ratingsRepository: RatingsRepository, prisma: PrismaService);
    createCustomerRating(customerId: string, orderId: string, dto: CreateRatingDto): Promise<{
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
    createRiderRating(riderId: string, deliveryId: string, dto: CreateRatingDto): Promise<{
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
    getOrderRatings(orderId: string): Promise<{
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
    getTargetRatings(targetType: RatingTargetType, targetId: string): Promise<{
        ratings: {
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
        average: number;
        count: number;
    }>;
    getAdminStats(): Promise<{
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
    getAdminList(params: {
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
    getTopRatedBranches(limit?: number): Promise<{
        branchId: string;
        average: number;
        count: number;
    }[]>;
    getTopRatedRiders(limit?: number): Promise<{
        riderId: string;
        average: number;
        count: number;
    }[]>;
}

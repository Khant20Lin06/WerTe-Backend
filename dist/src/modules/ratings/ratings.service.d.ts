import { RatingTargetType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingsRepository } from './repositories/ratings.repository';
export declare class RatingsService {
    private readonly ratingsRepository;
    private readonly prisma;
    constructor(ratingsRepository: RatingsRepository, prisma: PrismaService);
    createCustomerRating(customerId: string, orderId: string, dto: CreateRatingDto): Promise<any>;
    createRiderRating(riderId: string, deliveryId: string, dto: CreateRatingDto): Promise<any>;
    getOrderRatings(orderId: string): Promise<any>;
    getTargetRatings(targetType: RatingTargetType, targetId: string): Promise<{
        ratings: any;
        average: any;
        count: any;
    }>;
    getAdminStats(): Promise<{
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
    getAdminList(params: {
        targetType?: RatingTargetType;
        page: number;
        limit: number;
    }): Promise<{
        items: any;
        total: any;
    }>;
    getTopRatedBranches(limit?: number): Promise<any>;
    getTopRatedRiders(limit?: number): Promise<any>;
}

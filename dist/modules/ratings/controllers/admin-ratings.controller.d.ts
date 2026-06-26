import { RatingTargetType } from '@prisma/client';
import { RatingDto } from '../dto/create-rating.dto';
import { RatingsService } from '../ratings.service';
export declare class AdminRatingsController {
    private readonly ratingsService;
    constructor(ratingsService: RatingsService);
    stats(): Promise<{
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
    list(targetType?: RatingTargetType, page?: string, limit?: string): Promise<{
        items: RatingDto[];
        total: number;
    }>;
    topBranches(limit?: string): Promise<{
        branchId: string;
        average: number;
        count: number;
    }[]>;
    topRiders(limit?: string): Promise<{
        riderId: string;
        average: number;
        count: number;
    }[]>;
}

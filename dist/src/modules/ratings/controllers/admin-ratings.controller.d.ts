import { RatingTargetType } from '@prisma/client';
import { RatingsService } from '../ratings.service';
export declare class AdminRatingsController {
    private readonly ratingsService;
    constructor(ratingsService: RatingsService);
    stats(): Promise<{
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
    list(targetType?: RatingTargetType, page?: string, limit?: string): Promise<{
        items: any;
        total: any;
    }>;
    topBranches(limit?: string): Promise<any>;
    topRiders(limit?: string): Promise<any>;
}

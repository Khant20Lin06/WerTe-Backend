import { RatingDto } from '../dto/create-rating.dto';
import { RatingsService } from '../ratings.service';
export declare class MerchantRatingsController {
    private readonly ratingsService;
    constructor(ratingsService: RatingsService);
    list(orderId: string): Promise<RatingDto[]>;
}

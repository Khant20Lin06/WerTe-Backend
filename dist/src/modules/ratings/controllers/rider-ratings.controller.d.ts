import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateRatingDto, RatingDto } from '../dto/create-rating.dto';
import { RatingsService } from '../ratings.service';
export declare class RiderRatingsController {
    private readonly ratingsService;
    constructor(ratingsService: RatingsService);
    create(user: AuthenticatedUserEntity, deliveryId: string, dto: CreateRatingDto): Promise<RatingDto>;
}

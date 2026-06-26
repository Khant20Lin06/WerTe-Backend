import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreatePromotionDto, UpdatePromotionDto } from '../dto/create-promotion.dto';
import { PromotionDto } from '../dto/promotion.dto';
import { MerchantPromotionsService } from '../services/merchant-promotions.service';
export declare class MerchantPromotionsController {
    private readonly merchantPromotionsService;
    constructor(merchantPromotionsService: MerchantPromotionsService);
    list(currentUser: AuthenticatedUserEntity, branchId: string): Promise<PromotionDto[]>;
    get(currentUser: AuthenticatedUserEntity, branchId: string, promotionId: string): Promise<PromotionDto>;
    create(currentUser: AuthenticatedUserEntity, branchId: string, body: CreatePromotionDto): Promise<PromotionDto>;
    update(currentUser: AuthenticatedUserEntity, branchId: string, promotionId: string, body: UpdatePromotionDto): Promise<PromotionDto>;
}

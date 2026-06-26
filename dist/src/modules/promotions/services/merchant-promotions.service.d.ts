import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { BranchesService } from '../../branches/services/branches.service';
import { CreatePromotionDto, UpdatePromotionDto } from '../dto/create-promotion.dto';
import { PromotionDto } from '../dto/promotion.dto';
import { PromotionsRepository } from '../repositories/promotions.repository';
import { PromotionPricingService } from './promotion-pricing.service';
export declare class MerchantPromotionsService {
    private readonly branchesService;
    private readonly promotionsRepository;
    private readonly promotionPricingService;
    constructor(branchesService: BranchesService, promotionsRepository: PromotionsRepository, promotionPricingService: PromotionPricingService);
    listBranchPromotions(currentUser: AuthenticatedUserEntity, branchId: string): Promise<PromotionDto[]>;
    getBranchPromotion(currentUser: AuthenticatedUserEntity, branchId: string, promotionId: string): Promise<PromotionDto>;
    createBranchPromotion(currentUser: AuthenticatedUserEntity, branchId: string, payload: CreatePromotionDto): Promise<PromotionDto>;
    updateBranchPromotion(currentUser: AuthenticatedUserEntity, branchId: string, promotionId: string, payload: UpdatePromotionDto): Promise<PromotionDto>;
    private requireOwnedBranch;
    private requireBranchPromotion;
    private assertCodeIsAvailable;
    private requireNormalizedCode;
    private assertPromotionWindow;
    private assertDiscountPayload;
    private normalizeOptionalString;
    private toOptionalDate;
}

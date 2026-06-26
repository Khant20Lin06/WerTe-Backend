import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AdminPromotionDto } from '../dto/admin-promotion.dto';
import { CreatePromotionDto, UpdatePromotionDto } from '../dto/create-promotion.dto';
import { PromotionsRepository } from '../repositories/promotions.repository';
import { PromotionPricingService } from './promotion-pricing.service';
export declare class AdminPromotionsService {
    private readonly promotionsRepository;
    private readonly promotionPricingService;
    private readonly prisma;
    constructor(promotionsRepository: PromotionsRepository, promotionPricingService: PromotionPricingService, prisma: PrismaService);
    listPromotions(): Promise<AdminPromotionDto[]>;
    createPromotion(branchId: string, payload: CreatePromotionDto): Promise<AdminPromotionDto>;
    updatePromotion(promotionId: string, payload: UpdatePromotionDto): Promise<AdminPromotionDto>;
    private requireNormalizedCode;
    private assertCodeIsAvailable;
    private assertPromotionWindow;
    private assertDiscountPayload;
    private normalizeOptionalString;
    private toOptionalDate;
}

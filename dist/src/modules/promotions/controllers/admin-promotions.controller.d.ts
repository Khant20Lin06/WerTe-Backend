import { CreatePromotionDto, UpdatePromotionDto } from '../dto/create-promotion.dto';
import { AdminPromotionDto } from '../dto/admin-promotion.dto';
import { AdminPromotionsService } from '../services/admin-promotions.service';
declare class AdminCreatePromotionDto extends CreatePromotionDto {
    branchId: string;
}
declare class AdminListPromotionsQueryDto {
    branchId?: string;
}
export declare class AdminPromotionsController {
    private readonly adminPromotionsService;
    constructor(adminPromotionsService: AdminPromotionsService);
    list(_query: AdminListPromotionsQueryDto): Promise<AdminPromotionDto[]>;
    create(body: AdminCreatePromotionDto): Promise<AdminPromotionDto>;
    update(promotionId: string, body: UpdatePromotionDto): Promise<AdminPromotionDto>;
}
export {};

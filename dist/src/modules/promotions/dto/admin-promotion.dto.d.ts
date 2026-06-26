import { PromotionDiscountType } from '@prisma/client';
import { PromotionWithCount } from '../repositories/promotions.repository';
export declare class AdminPromotionDto {
    promotionId: string;
    branchId: string;
    branchName: string | null;
    merchantName: string | null;
    code: string;
    name: string;
    description: string | null;
    discountType: PromotionDiscountType;
    discountValue: string;
    minimumSubtotalAmount: string;
    maximumDiscountAmount: string | null;
    startsAt: string | null;
    endsAt: string | null;
    isActive: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}
type BranchWithMerchant = {
    name: string;
    merchant: {
        name: string;
    } | null;
} | null;
export declare function toAdminPromotionDto(record: PromotionWithCount, branch?: BranchWithMerchant): AdminPromotionDto;
export {};

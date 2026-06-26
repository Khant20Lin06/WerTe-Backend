import { PromotionDiscountType, Prisma } from '@prisma/client';
export declare const promotionSelect: {
    id: true;
    branchId: true;
    code: true;
    name: true;
    description: true;
    discountType: true;
    discountValue: true;
    minimumSubtotalAmount: true;
    maximumDiscountAmount: true;
    startsAt: true;
    endsAt: true;
    isActive: true;
    createdAt: true;
    updatedAt: true;
};
export type PromotionRecord = Prisma.PromotionGetPayload<{
    select: typeof promotionSelect;
}>;
export declare class PromotionEntity {
    promotionId: string;
    branchId: string;
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
    createdAt: string;
    updatedAt: string;
}
export declare function buildPromotionEntity(record: PromotionRecord): PromotionEntity;

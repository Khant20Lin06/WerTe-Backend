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
    perCustomerLimit: true;
    startsAt: true;
    endsAt: true;
    isActive: true;
    deletedAt: true;
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
    perCustomerLimit: number | null;
    startsAt: string | null;
    endsAt: string | null;
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export declare function buildPromotionEntity(record: PromotionRecord): PromotionEntity;

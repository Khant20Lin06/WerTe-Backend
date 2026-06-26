import { PromotionDiscountType, Prisma } from '@prisma/client';
export declare class AppliedPromotionEntity {
    promotionId: string;
    code: string;
    name: string;
    discountType: PromotionDiscountType;
    discountAmount: string;
}
type BuildAppliedPromotionInput = {
    promotionId: string;
    code: string;
    name: string;
    discountType: PromotionDiscountType;
    discountAmount: Prisma.Decimal | string | number;
};
type AppliedPromotionSnapshotInput = {
    promotionId?: string | null;
    promotionCodeSnapshot?: string | null;
    promotionNameSnapshot?: string | null;
    promotionDiscountTypeSnapshot?: PromotionDiscountType | null;
    discountAmount?: Prisma.Decimal | string | number;
};
export declare function buildAppliedPromotionEntity(input: BuildAppliedPromotionInput): AppliedPromotionEntity;
export declare function buildAppliedPromotionEntityFromSnapshot(input: AppliedPromotionSnapshotInput): AppliedPromotionEntity | null;
export {};

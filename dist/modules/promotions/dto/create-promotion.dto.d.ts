import { PromotionDiscountType } from '@prisma/client';
export declare class CreatePromotionDto {
    code: string;
    name: string;
    description?: string;
    discountType: PromotionDiscountType;
    discountValue: number;
    minimumSubtotalAmount?: number;
    maximumDiscountAmount?: number;
    perCustomerLimit?: number;
    startsAt?: string;
    endsAt?: string;
    isActive?: boolean;
}
declare const UpdatePromotionDto_base: import("@nestjs/common").Type<Partial<CreatePromotionDto>>;
export declare class UpdatePromotionDto extends UpdatePromotionDto_base {
}
export {};

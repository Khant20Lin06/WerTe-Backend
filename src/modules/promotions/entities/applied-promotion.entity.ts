import { PromotionDiscountType, Prisma } from '@prisma/client';

export class AppliedPromotionEntity {
  promotionId!: string;
  code!: string;
  name!: string;
  discountType!: PromotionDiscountType;
  discountAmount!: string;
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

export function buildAppliedPromotionEntity(
  input: BuildAppliedPromotionInput,
): AppliedPromotionEntity {
  return {
    promotionId: input.promotionId,
    code: input.code,
    name: input.name,
    discountType: input.discountType,
    discountAmount: new Prisma.Decimal(input.discountAmount).toString(),
  };
}

export function buildAppliedPromotionEntityFromSnapshot(
  input: AppliedPromotionSnapshotInput,
): AppliedPromotionEntity | null {
  if (
    input.promotionId === undefined ||
    input.promotionId === null ||
    input.promotionCodeSnapshot === undefined ||
    input.promotionCodeSnapshot === null ||
    input.promotionNameSnapshot === undefined ||
    input.promotionNameSnapshot === null ||
    input.promotionDiscountTypeSnapshot === undefined ||
    input.promotionDiscountTypeSnapshot === null
  ) {
    return null;
  }

  return buildAppliedPromotionEntity({
    promotionId: input.promotionId,
    code: input.promotionCodeSnapshot,
    name: input.promotionNameSnapshot,
    discountType: input.promotionDiscountTypeSnapshot,
    discountAmount: input.discountAmount ?? 0,
  });
}

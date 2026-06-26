import { PromotionDiscountType, Prisma } from '@prisma/client';

export const promotionSelect = Prisma.validator<Prisma.PromotionSelect>()({
  id: true,
  branchId: true,
  code: true,
  name: true,
  description: true,
  discountType: true,
  discountValue: true,
  minimumSubtotalAmount: true,
  maximumDiscountAmount: true,
  perCustomerLimit: true,
  startsAt: true,
  endsAt: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type PromotionRecord = Prisma.PromotionGetPayload<{
  select: typeof promotionSelect;
}>;

export class PromotionEntity {
  promotionId!: string;
  branchId!: string;
  code!: string;
  name!: string;
  description!: string | null;
  discountType!: PromotionDiscountType;
  discountValue!: string;
  minimumSubtotalAmount!: string;
  maximumDiscountAmount!: string | null;
  perCustomerLimit!: number | null;
  startsAt!: string | null;
  endsAt!: string | null;
  isActive!: boolean;
  deletedAt!: string | null;
  createdAt!: string;
  updatedAt!: string;
}

export function buildPromotionEntity(record: PromotionRecord): PromotionEntity {
  return {
    promotionId: record.id,
    branchId: record.branchId,
    code: record.code,
    name: record.name,
    description: record.description,
    discountType: record.discountType,
    discountValue: record.discountValue.toString(),
    minimumSubtotalAmount: record.minimumSubtotalAmount.toString(),
    maximumDiscountAmount: record.maximumDiscountAmount?.toString() ?? null,
    perCustomerLimit: record.perCustomerLimit,
    startsAt: record.startsAt?.toISOString() ?? null,
    endsAt: record.endsAt?.toISOString() ?? null,
    isActive: record.isActive,
    deletedAt: record.deletedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

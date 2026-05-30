import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, PromotionDiscountType } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import {
  AppliedPromotionEntity,
  buildAppliedPromotionEntity,
} from '../entities/applied-promotion.entity';
import { PromotionsRepository } from '../repositories/promotions.repository';

export type PromotionPricingEvaluation = {
  promotionId: string;
  code: string;
  name: string;
  discountType: PromotionDiscountType;
  discountAmount: Prisma.Decimal;
  appliedPromotion: AppliedPromotionEntity;
};

@Injectable()
export class PromotionPricingService {
  constructor(private readonly promotionsRepository: PromotionsRepository) {}

  async evaluatePromotionForCheckout(input: {
    branchId: string;
    subtotalAmount: Prisma.Decimal;
    promotionCode?: string;
  }): Promise<PromotionPricingEvaluation | null> {
    const normalizedCode = this.normalizePromotionCode(input.promotionCode);
    if (normalizedCode === null) {
      return null;
    }

    const promotion =
      await this.promotionsRepository.findPromotionByBranchIdAndCode(
        input.branchId,
        normalizedCode,
      );

    if (promotion === null || !promotion.isActive) {
      throw new AppException(
        'The promotion code is invalid or unavailable for this branch.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            branchId: input.branchId,
            promotionCode: normalizedCode,
          },
        },
      );
    }

    const now = new Date();

    if (promotion.startsAt !== null && promotion.startsAt > now) {
      throw new AppException(
        'The promotion code is not active yet.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            promotionId: promotion.id,
            startsAt: promotion.startsAt.toISOString(),
          },
        },
      );
    }

    if (promotion.endsAt !== null && promotion.endsAt < now) {
      throw new AppException(
        'The promotion code has expired.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            promotionId: promotion.id,
            endsAt: promotion.endsAt.toISOString(),
          },
        },
      );
    }

    if (promotion.minimumSubtotalAmount.gt(input.subtotalAmount)) {
      throw new AppException(
        'The checkout subtotal does not satisfy the promotion minimum.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            promotionId: promotion.id,
            minimumSubtotalAmount:
              promotion.minimumSubtotalAmount.toString(),
            subtotalAmount: input.subtotalAmount.toString(),
          },
        },
      );
    }

    const uncappedDiscount =
      promotion.discountType === PromotionDiscountType.FIXED_AMOUNT
        ? new Prisma.Decimal(promotion.discountValue)
        : input.subtotalAmount
            .mul(promotion.discountValue)
            .div(new Prisma.Decimal(100));

    const cappedDiscount =
      promotion.maximumDiscountAmount === null
        ? uncappedDiscount
        : Prisma.Decimal.min(
            uncappedDiscount,
            new Prisma.Decimal(promotion.maximumDiscountAmount),
          );
    const discountAmount = Prisma.Decimal.min(
      cappedDiscount,
      input.subtotalAmount,
    );

    return {
      promotionId: promotion.id,
      code: promotion.code,
      name: promotion.name,
      discountType: promotion.discountType,
      discountAmount,
      appliedPromotion: buildAppliedPromotionEntity({
        promotionId: promotion.id,
        code: promotion.code,
        name: promotion.name,
        discountType: promotion.discountType,
        discountAmount,
      }),
    };
  }

  normalizePromotionCode(code?: string | null): string | null {
    const normalized = code?.trim().toUpperCase() ?? '';

    return normalized.length > 0 ? normalized : null;
  }
}

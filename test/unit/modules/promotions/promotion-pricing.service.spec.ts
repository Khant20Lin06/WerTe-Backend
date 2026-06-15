import { HttpStatus } from '@nestjs/common';
import { Prisma, PromotionDiscountType } from '@prisma/client';

import { PromotionsRepository } from '../../../../src/modules/promotions/repositories/promotions.repository';
import { PromotionPricingService } from '../../../../src/modules/promotions/services/promotion-pricing.service';

describe('PromotionPricingService', () => {
  it('returns null when no promotion code is supplied', async () => {
    const service = new PromotionPricingService(
      {} as PromotionsRepository,
    );

    await expect(
      service.evaluatePromotionForCheckout({
        branchId: 'branch_1',
        subtotalAmount: new Prisma.Decimal('6500'),
      }),
    ).resolves.toBeNull();
  });

  it('applies a percentage promotion and respects the maximum discount cap', async () => {
    const repository = {
      findPromotionByBranchIdAndCode: jest.fn().mockResolvedValue({
        id: 'promo_1',
        branchId: 'branch_1',
        code: 'SAVE20',
        name: 'Save 20 percent',
        description: null,
        discountType: PromotionDiscountType.PERCENTAGE,
        discountValue: new Prisma.Decimal('20'),
        minimumSubtotalAmount: new Prisma.Decimal('5000'),
        maximumDiscountAmount: new Prisma.Decimal('1000'),
        startsAt: new Date('2026-01-01T00:00:00.000Z'),
        endsAt: new Date('2099-12-31T23:59:59.000Z'),
        isActive: true,
        createdAt: new Date('2026-05-02T00:00:00.000Z'),
        updatedAt: new Date('2026-05-02T00:00:00.000Z'),
      }),
    } as unknown as jest.Mocked<PromotionsRepository>;
    const service = new PromotionPricingService(repository);

    const result = await service.evaluatePromotionForCheckout({
      branchId: 'branch_1',
      subtotalAmount: new Prisma.Decimal('6500'),
      promotionCode: 'save20',
    });

    expect(repository.findPromotionByBranchIdAndCode).toHaveBeenCalledWith(
      'branch_1',
      'SAVE20',
    );
    expect(result).toMatchObject({
      promotionId: 'promo_1',
      code: 'SAVE20',
      discountType: PromotionDiscountType.PERCENTAGE,
      appliedPromotion: {
        code: 'SAVE20',
        discountAmount: '1000',
      },
    });
    expect(result?.discountAmount.toString()).toBe('1000');
  });

  it('rejects promotions when the subtotal does not meet the minimum requirement', async () => {
    const service = new PromotionPricingService({
      findPromotionByBranchIdAndCode: jest.fn().mockResolvedValue({
        id: 'promo_1',
        branchId: 'branch_1',
        code: 'SAVE10',
        name: 'Save 10 percent',
        description: null,
        discountType: PromotionDiscountType.PERCENTAGE,
        discountValue: new Prisma.Decimal('10'),
        minimumSubtotalAmount: new Prisma.Decimal('8000'),
        maximumDiscountAmount: null,
        startsAt: null,
        endsAt: null,
        isActive: true,
        createdAt: new Date('2026-05-02T00:00:00.000Z'),
        updatedAt: new Date('2026-05-02T00:00:00.000Z'),
      }),
    } as unknown as PromotionsRepository);

    await expect(
      service.evaluatePromotionForCheckout({
        branchId: 'branch_1',
        subtotalAmount: new Prisma.Decimal('6500'),
        promotionCode: 'SAVE10',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
    });
  });
});

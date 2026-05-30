import { HttpStatus } from '@nestjs/common';
import {
  BranchStatus,
  MerchantStatus,
  Prisma,
  PromotionDiscountType,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { BranchOwnershipRecord } from '../../../../src/modules/branches/entities/branch-ownership.entity';
import { BranchesService } from '../../../../src/modules/branches/services/branches.service';
import { PromotionRecord } from '../../../../src/modules/promotions/entities/promotion.entity';
import { PromotionsRepository } from '../../../../src/modules/promotions/repositories/promotions.repository';
import { MerchantPromotionsService } from '../../../../src/modules/promotions/services/merchant-promotions.service';
import { PromotionPricingService } from '../../../../src/modules/promotions/services/promotion-pricing.service';

describe('MerchantPromotionsService', () => {
  const currentUser: AuthenticatedUserEntity = {
    userId: 'usr_merchant_1',
    sessionId: 'session_1',
    role: UserRole.MERCHANT,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_merchant_1',
      phone: '0999999999',
      role: UserRole.MERCHANT,
      status: UserStatus.ACTIVE,
      merchantId: 'merchant_1',
    },
  };

  const makeBranch = (): BranchOwnershipRecord =>
    ({
      id: 'branch_1',
      merchantId: 'merchant_1',
      name: 'Downtown Branch',
      contactPhone: null,
      line1: null,
      township: 'Botahtaung',
      latitude: null,
      longitude: null,
      storeType: 'restaurant',
      primaryStoreTypeId: null,
      status: BranchStatus.ACTIVE,
      createdAt: new Date('2026-05-02T00:00:00.000Z'),
      updatedAt: new Date('2026-05-02T00:00:00.000Z'),
      merchant: {
        id: 'merchant_1',
        userId: 'usr_merchant_1',
        name: 'Merchant One',
        storeType: 'restaurant',
        status: MerchantStatus.ACTIVE,
        user: {
          id: 'usr_merchant_1',
          phone: '0999999999',
          role: UserRole.MERCHANT,
          status: UserStatus.ACTIVE,
        },
      },
      branchZones: [],
    }) as unknown as BranchOwnershipRecord;

  const makePromotion = (overrides?: Partial<PromotionRecord>): PromotionRecord =>
    ({
      id: 'promo_1',
      branchId: 'branch_1',
      code: 'SAVE10',
      name: 'Save 10 percent',
      description: null,
      discountType: PromotionDiscountType.PERCENTAGE,
      discountValue: new Prisma.Decimal('10'),
      minimumSubtotalAmount: new Prisma.Decimal('5000'),
      maximumDiscountAmount: null,
      startsAt: null,
      endsAt: null,
      isActive: true,
      createdAt: new Date('2026-05-02T00:00:00.000Z'),
      updatedAt: new Date('2026-05-02T00:00:00.000Z'),
      ...overrides,
    });

  const makePromotionPricingService = () =>
    ({
      normalizePromotionCode: jest.fn((code?: string | null) => {
        const normalized = code?.trim().toUpperCase() ?? '';

        return normalized.length > 0 ? normalized : null;
      }),
    }) as unknown as jest.Mocked<PromotionPricingService>;

  it('lists promotions for a merchant-owned branch', async () => {
    const service = new MerchantPromotionsService(
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {
        listBranchPromotions: jest.fn().mockResolvedValue([makePromotion()]),
      } as unknown as PromotionsRepository,
      makePromotionPricingService(),
    );

    await expect(
      service.listBranchPromotions(currentUser, 'branch_1'),
    ).resolves.toEqual([
      expect.objectContaining({
        promotionId: 'promo_1',
        code: 'SAVE10',
        discountValue: '10',
      }),
    ]);
  });

  it('creates a branch promotion with a normalized code', async () => {
    const repository = {
      findPromotionByBranchIdAndCode: jest.fn().mockResolvedValue(null),
      createPromotion: jest.fn().mockResolvedValue(makePromotion()),
    } as unknown as jest.Mocked<PromotionsRepository>;
    const service = new MerchantPromotionsService(
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      repository,
      makePromotionPricingService(),
    );

    const result = await service.createBranchPromotion(currentUser, 'branch_1', {
      code: ' save10 ',
      name: 'Save 10 percent',
      discountType: PromotionDiscountType.PERCENTAGE,
      discountValue: 10,
      minimumSubtotalAmount: 5000,
    });

    expect(repository.createPromotion).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: 'branch_1',
        code: 'SAVE10',
      }),
    );
    expect(result.code).toBe('SAVE10');
  });

  it('rejects duplicate promotion codes on the same branch', async () => {
    const service = new MerchantPromotionsService(
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeBranch()),
      } as unknown as BranchesService,
      {
        findPromotionByBranchIdAndCode: jest
          .fn()
          .mockResolvedValue(makePromotion()),
      } as unknown as PromotionsRepository,
      makePromotionPricingService(),
    );

    await expect(
      service.createBranchPromotion(currentUser, 'branch_1', {
        code: 'SAVE10',
        name: 'Save 10 percent',
        discountType: PromotionDiscountType.PERCENTAGE,
        discountValue: 10,
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
    });
  });
});

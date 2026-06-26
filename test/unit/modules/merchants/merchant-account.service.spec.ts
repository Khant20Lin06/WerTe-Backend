import { HttpStatus } from '@nestjs/common';
import { MerchantStatus, UserRole, UserStatus } from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { MerchantOwnershipRecord } from '../../../../src/modules/merchants/entities/merchant-ownership.entity';
import { MerchantPolicyService } from '../../../../src/modules/merchants/policies/merchant-policy.service';
import { MerchantsRepository } from '../../../../src/modules/merchants/repositories/merchants.repository';
import { MerchantAccountService } from '../../../../src/modules/merchants/services/merchant-account.service';
import { MerchantsService } from '../../../../src/modules/merchants/services/merchants.service';

describe('MerchantAccountService', () => {
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

  const makeMerchant = (
    overrides?: Partial<MerchantOwnershipRecord>,
  ): MerchantOwnershipRecord => ({
    id: 'merchant_1',
    userId: 'usr_merchant_1',
    name: 'Tea House',
    supportPhone: '0942000000',
    storeType: 'restaurant',
    primaryStoreTypeId: 'store_type_restaurant',
    status: MerchantStatus.ACTIVE,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    user: {
      id: 'usr_merchant_1',
      phone: '0999999999',
      role: UserRole.MERCHANT,
      status: UserStatus.ACTIVE,
    },
    ...overrides,
  });

  it('returns the authenticated merchant profile', async () => {
    const merchantsService = {
      findOwnedByUserId: jest.fn().mockResolvedValue(makeMerchant()),
    } as unknown as MerchantsService;
    const service = new MerchantAccountService(
      merchantsService,
      {} as MerchantsRepository,
      new MerchantPolicyService(),
    );

    await expect(service.getCurrentMerchantProfile(currentUser)).resolves.toEqual({
      id: 'merchant_1',
      name: 'Tea House',
      phone: '0999999999',
      supportPhone: '0942000000',
    storeType: 'restaurant',
      status: MerchantStatus.ACTIVE,
      createdAt: '2026-04-19T00:00:00.000Z',
      updatedAt: '2026-04-19T00:00:00.000Z',
    });
  });

  it('rejects when no owned merchant profile exists', async () => {
    const merchantsService = {
      findOwnedByUserId: jest.fn().mockResolvedValue(null),
    } as unknown as MerchantsService;
    const service = new MerchantAccountService(
      merchantsService,
      {} as MerchantsRepository,
      new MerchantPolicyService(),
    );

    await expect(service.getCurrentMerchantProfile(currentUser)).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
      response: expect.objectContaining({
        code: ErrorCodes.notFound,
      }),
    });
  });

  it('updates the merchant default store type', async () => {
    const merchantsRepository = {
      update: jest.fn().mockResolvedValue(
        makeMerchant({
          storeType: 'grocery',
        }),
      ),
    } as unknown as MerchantsRepository;
    const service = new MerchantAccountService(
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeMerchant()),
        invalidateCache: jest.fn().mockResolvedValue(undefined),
      } as unknown as MerchantsService,
      merchantsRepository,
      new MerchantPolicyService(),
    );

    const result = await service.updateCurrentMerchantProfile(currentUser, {
      storeType: 'grocery',
    });

    expect(merchantsRepository.update).toHaveBeenCalledWith('merchant_1', {
      storeType: 'grocery',
    });
    expect(result.storeType).toBe('grocery');
  });
});

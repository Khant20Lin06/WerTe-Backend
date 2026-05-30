import { UserRole, UserStatus } from '@prisma/client';

import { MerchantStoreTypesController } from '../../../../src/modules/store-types/controllers/merchant-store-types.controller';
import { MerchantStoreTypeRequestService } from '../../../../src/modules/store-types/services/merchant-store-type-request.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('MerchantStoreTypesController', () => {
  const currentUser = makeAuthenticatedUser({
    userId: 'usr_merchant_1',
    role: UserRole.MERCHANT,
    actorContext: {
      userId: 'usr_merchant_1',
      phone: '0999999999',
      role: UserRole.MERCHANT,
      status: UserStatus.ACTIVE,
      merchantId: 'merchant_1',
    },
  });

  it('delegates merchant store type browse and request flows to the request service', async () => {
    const merchantStoreTypeRequestService = {
      listAvailableStoreTypes: jest.fn().mockResolvedValue([]),
      listCurrentMerchantBranchStoreTypes: jest.fn().mockResolvedValue([]),
      requestCurrentMerchantBranchStoreType: jest.fn().mockResolvedValue({
        branchId: 'branch_1',
        storeTypeId: 'store_type_grocery',
      }),
    } as unknown as jest.Mocked<MerchantStoreTypeRequestService>;
    const controller = new MerchantStoreTypesController(
      merchantStoreTypeRequestService,
    );

    await controller.listAvailable(currentUser);
    await controller.listBranchAssignments(currentUser, 'branch_1');
    await controller.request(currentUser, 'branch_1', {
      storeTypeId: 'store_type_grocery',
      reason: 'Launching grocery next week.',
    });

    expect(
      merchantStoreTypeRequestService.listAvailableStoreTypes,
    ).toHaveBeenCalledWith(currentUser);
    expect(
      merchantStoreTypeRequestService.listCurrentMerchantBranchStoreTypes,
    ).toHaveBeenCalledWith(currentUser, 'branch_1');
    expect(
      merchantStoreTypeRequestService.requestCurrentMerchantBranchStoreType,
    ).toHaveBeenCalledWith(currentUser, 'branch_1', {
      storeTypeId: 'store_type_grocery',
      reason: 'Launching grocery next week.',
    });
  });
});

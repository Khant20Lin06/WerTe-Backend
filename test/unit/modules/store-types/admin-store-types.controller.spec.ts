import { BranchStoreTypeStatus, UserRole, UserStatus } from '@prisma/client';

import { AdminBranchStoreTypesController } from '../../../../src/modules/store-types/controllers/admin-branch-store-types.controller';
import { AdminStoreTypesController } from '../../../../src/modules/store-types/controllers/admin-store-types.controller';
import { StoreTypeManagementService } from '../../../../src/modules/store-types/services/store-type-management.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('AdminStoreTypesController', () => {
  const currentUser = makeAuthenticatedUser({
    userId: 'usr_admin_1',
    role: UserRole.ADMIN,
    actorContext: {
      userId: 'usr_admin_1',
      phone: '099999999',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  it('delegates store type registry operations to the management service', async () => {
    const storeTypeManagementService = {
      listStoreTypes: jest.fn().mockResolvedValue([
        {
          id: 'store_type_restaurant',
          code: 'restaurant',
        },
      ]),
      createStoreType: jest.fn().mockResolvedValue({
        id: 'store_type_grocery',
        code: 'grocery',
      }),
      archiveStoreType: jest.fn().mockResolvedValue({
        id: 'store_type_grocery',
        isActive: false,
      }),
    } as unknown as jest.Mocked<StoreTypeManagementService>;
    const controller = new AdminStoreTypesController(storeTypeManagementService);

    await controller.list(currentUser);
    await controller.create(currentUser, {
      code: 'grocery',
      name: 'Grocery',
    });
    await controller.archive(currentUser, 'store_type_grocery');

    expect(storeTypeManagementService.listStoreTypes).toHaveBeenCalledWith(
      currentUser,
    );
    expect(storeTypeManagementService.createStoreType).toHaveBeenCalledWith(
      currentUser,
      {
        code: 'grocery',
        name: 'Grocery',
      },
    );
    expect(storeTypeManagementService.archiveStoreType).toHaveBeenCalledWith(
      currentUser,
      'store_type_grocery',
    );
  });

  it('delegates branch assignment lifecycle actions to the management service', async () => {
    const storeTypeManagementService = {
      assignBranchStoreType: jest.fn().mockResolvedValue({
        branchId: 'branch_1',
        storeTypeId: 'store_type_grocery',
      }),
      approveBranchStoreType: jest.fn().mockResolvedValue({
        status: BranchStoreTypeStatus.APPROVED,
      }),
      hideBranchStoreType: jest.fn().mockResolvedValue({
        status: BranchStoreTypeStatus.HIDDEN,
      }),
    } as unknown as jest.Mocked<StoreTypeManagementService>;
    const controller = new AdminBranchStoreTypesController(
      storeTypeManagementService,
    );

    await controller.assign(currentUser, 'branch_1', {
      storeTypeId: 'store_type_grocery',
      isPrimary: true,
    });
    await controller.approve(currentUser, 'branch_1', 'store_type_grocery', {
      reason: 'Approved',
    });
    await controller.hide(currentUser, 'branch_1', 'store_type_grocery', {
      reason: 'Temporarily hidden',
    });

    expect(storeTypeManagementService.assignBranchStoreType).toHaveBeenCalledWith(
      currentUser,
      'branch_1',
      expect.objectContaining({
        storeTypeId: 'store_type_grocery',
      }),
    );
    expect(storeTypeManagementService.approveBranchStoreType).toHaveBeenCalledWith(
      currentUser,
      'branch_1',
      'store_type_grocery',
      expect.objectContaining({
        reason: 'Approved',
      }),
    );
    expect(storeTypeManagementService.hideBranchStoreType).toHaveBeenCalledWith(
      currentUser,
      'branch_1',
      'store_type_grocery',
      expect.objectContaining({
        reason: 'Temporarily hidden',
      }),
    );
  });
});

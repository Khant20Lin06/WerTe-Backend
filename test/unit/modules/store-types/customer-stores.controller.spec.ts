import { UserRole, UserStatus } from '@prisma/client';

import { CustomerStoresController } from '../../../../src/modules/store-types/controllers/customer-stores.controller';
import { CustomerStoreDiscoveryService } from '../../../../src/modules/store-types/services/customer-store-discovery.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('CustomerStoresController', () => {
  const currentUser = makeAuthenticatedUser({
    userId: 'usr_customer_1',
    role: UserRole.CUSTOMER,
    actorContext: {
      userId: 'usr_customer_1',
      phone: '09111111111',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfileId: 'customer_profile_1',
    },
  });

  it('delegates customer store discovery filtering to the discovery service', async () => {
    const customerStoreDiscoveryService = {
      listDiscoverableStores: jest.fn().mockResolvedValue([]),
      getDiscoverableStoreFacets: jest.fn().mockResolvedValue({
        totalStoreCount: 0,
        storeTypes: [],
        townships: [],
      }),
      getDiscoverableStoreDetail: jest.fn().mockResolvedValue({}),
      getDiscoverableStoreCatalogEntry: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<CustomerStoreDiscoveryService>;
    const controller = new CustomerStoresController(customerStoreDiscoveryService);

    await controller.list(currentUser, {
      storeTypeCode: 'grocery',
      keyword: 'city',
    });
    await controller.facets(currentUser, {
      storeTypeCodes: ['grocery', 'pharmacy'],
    });
    await controller.detail(currentUser, 'branch_1');
    await controller.catalog(currentUser, 'branch_1', {
      storeTypeCode: 'pharmacy',
    });

    expect(customerStoreDiscoveryService.listDiscoverableStores).toHaveBeenCalledWith(
      currentUser,
      {
        storeTypeCode: 'grocery',
        keyword: 'city',
      },
    );
    expect(
      customerStoreDiscoveryService.getDiscoverableStoreFacets,
    ).toHaveBeenCalledWith(currentUser, {
      storeTypeCodes: ['grocery', 'pharmacy'],
    });
    expect(
      customerStoreDiscoveryService.getDiscoverableStoreDetail,
    ).toHaveBeenCalledWith(currentUser, 'branch_1');
    expect(
      customerStoreDiscoveryService.getDiscoverableStoreCatalogEntry,
    ).toHaveBeenCalledWith(currentUser, 'branch_1', {
      storeTypeCode: 'pharmacy',
    });
  });
});

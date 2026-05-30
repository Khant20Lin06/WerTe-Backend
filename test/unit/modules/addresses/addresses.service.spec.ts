import { Prisma, UserRole, UserStatus } from '@prisma/client';

import { AddressOwnershipRecord } from '../../../../src/modules/addresses/entities/address-ownership.entity';
import { AddressesRepository } from '../../../../src/modules/addresses/repositories/addresses.repository';
import { AddressesService } from '../../../../src/modules/addresses/services/addresses.service';

describe('AddressesService', () => {
  const makeAddress = (
    overrides?: Partial<AddressOwnershipRecord>,
  ): AddressOwnershipRecord => ({
    id: 'addr_1',
    customerProfileId: 'cust_prof_1',
    label: 'Home',
    line1: 'No. 1, Main Road',
    line2: null,
    landmark: null,
    township: 'Thingangyun',
    city: 'Yangon',
    postalCode: null,
    deliveryInstructions: null,
    isDefault: true,
    latitude: new Prisma.Decimal('16.8340'),
    longitude: new Prisma.Decimal('96.1760'),
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    customerProfile: {
      id: 'cust_prof_1',
      userId: 'usr_1',
      user: {
        id: 'usr_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
    },
    ...overrides,
  });

  it('builds ownership details for address reads', () => {
    const repository = {} as AddressesRepository;
    const service = new AddressesService(repository);

    const ownership = service.buildOwnership(makeAddress());

    expect(ownership).toEqual({
      addressId: 'addr_1',
      customerProfileId: 'cust_prof_1',
      userId: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      userStatus: UserStatus.ACTIVE,
      label: 'Home',
      line1: 'No. 1, Main Road',
      township: 'Thingangyun',
      city: 'Yangon',
      isDefault: true,
    });
  });

  it('returns null when the address does not belong to the requesting user', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(makeAddress()),
    } as unknown as AddressesRepository;
    const service = new AddressesService(repository);

    const address = await service.findOwnedByUserId('usr_2', 'addr_1');

    expect(address).toBeNull();
  });
});

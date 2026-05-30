import { HttpStatus } from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { CustomerProfileOwnershipRecord } from '../../../../src/modules/customer-profiles/entities/customer-profile-ownership.entity';
import { CustomerProfilesService } from '../../../../src/modules/customer-profiles/services/customer-profiles.service';
import { AddressOwnershipRecord } from '../../../../src/modules/addresses/entities/address-ownership.entity';
import { AddressPolicyService } from '../../../../src/modules/addresses/policies/address-policy.service';
import { AddressesRepository } from '../../../../src/modules/addresses/repositories/addresses.repository';
import { CustomerAddressesService } from '../../../../src/modules/addresses/services/customer-addresses.service';

describe('CustomerAddressesService', () => {
  const currentUser: AuthenticatedUserEntity = {
    userId: 'usr_1',
    sessionId: 'session_1',
    role: UserRole.CUSTOMER,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfileId: 'cust_prof_1',
    },
  };

  const makeProfile = (
    overrides?: Partial<CustomerProfileOwnershipRecord>,
  ): CustomerProfileOwnershipRecord => ({
    id: 'cust_prof_1',
    userId: 'usr_1',
    fullName: 'Mg Mg',
    avatarUrl: null,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    user: {
      id: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
    ...overrides,
  });

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

  const prismaService = {
    runInTransaction: jest.fn(async (callback: (tx: object) => Promise<unknown>) =>
      callback({}),
    ),
  } as unknown as PrismaService;

  it('promotes the first created address to default automatically', async () => {
    const addressesRepository = {
      countByCustomerProfileId: jest.fn().mockResolvedValue(0),
      clearDefaultByCustomerProfileId: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest
        .fn()
        .mockImplementation(async (payload: AddressOwnershipRecord) =>
          makeAddress(payload),
        ),
    } as unknown as AddressesRepository;
    const service = new CustomerAddressesService(
      prismaService,
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
      } as unknown as CustomerProfilesService,
      addressesRepository,
      new AddressPolicyService(),
    );

    const result = await service.createCurrentCustomerAddress(currentUser, {
      label: 'Home',
      line1: 'No. 1, Main Road',
      township: 'Thingangyun',
      latitude: 16.834,
      longitude: 96.176,
    });

    expect(addressesRepository.clearDefaultByCustomerProfileId).toHaveBeenCalled();
    expect(result.isDefault).toBe(true);
  });

  it('rejects attempts to unset the current default address directly', async () => {
    const service = new CustomerAddressesService(
      prismaService,
      {} as CustomerProfilesService,
      {
        findById: jest.fn().mockResolvedValue(makeAddress()),
      } as unknown as AddressesRepository,
      new AddressPolicyService(),
    );

    await expect(
      service.updateCurrentCustomerAddress(currentUser, 'addr_1', {
        isDefault: false,
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
      }),
    });
  });

  it('promotes another address when deleting the default one', async () => {
    const addressesRepository = {
      findById: jest.fn().mockResolvedValue(makeAddress()),
      delete: jest.fn().mockResolvedValue(makeAddress()),
      findLatestByCustomerProfileId: jest.fn().mockResolvedValue(
        makeAddress({
          id: 'addr_2',
          isDefault: false,
          createdAt: new Date('2026-04-20T00:00:00.000Z'),
          updatedAt: new Date('2026-04-20T00:00:00.000Z'),
        }),
      ),
      update: jest.fn().mockResolvedValue(
        makeAddress({
          id: 'addr_2',
          isDefault: true,
          createdAt: new Date('2026-04-20T00:00:00.000Z'),
          updatedAt: new Date('2026-04-20T00:00:00.000Z'),
        }),
      ),
    } as unknown as AddressesRepository;
    const service = new CustomerAddressesService(
      prismaService,
      {} as CustomerProfilesService,
      addressesRepository,
      new AddressPolicyService(),
    );

    const result = await service.deleteCurrentCustomerAddress(
      currentUser,
      'addr_1',
    );

    expect(addressesRepository.findLatestByCustomerProfileId).toHaveBeenCalledWith(
      'cust_prof_1',
      expect.anything(),
    );
    expect(addressesRepository.update).toHaveBeenCalledWith(
      'addr_2',
      {
        isDefault: true,
      },
      expect.anything(),
    );
    expect(result).toEqual({
      deletedAddressId: 'addr_1',
    });
  });
});

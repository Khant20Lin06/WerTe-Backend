import {
  BranchStatus,
  CartStatus,
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { AddressOwnershipRecord } from '../../../../src/modules/addresses/entities/address-ownership.entity';
import { AddressesService } from '../../../../src/modules/addresses/services/addresses.service';
import { BranchOwnershipRecord } from '../../../../src/modules/branches/entities/branch-ownership.entity';
import { BranchesService } from '../../../../src/modules/branches/services/branches.service';
import { CartAggregateEntity } from '../../../../src/modules/carts/entities/cart-aggregate.entity';
import { CartQueryService } from '../../../../src/modules/carts/services/cart-query.service';
import { CheckoutContextService } from '../../../../src/modules/checkout/services/checkout-context.service';
import { CheckoutValidationService } from '../../../../src/modules/checkout/services/checkout-validation.service';
import { CustomerProfileOwnershipRecord } from '../../../../src/modules/customer-profiles/entities/customer-profile-ownership.entity';
import { CustomerProfilesService } from '../../../../src/modules/customer-profiles/services/customer-profiles.service';

function makeCustomerProfile(
  overrides?: Partial<CustomerProfileOwnershipRecord>,
): CustomerProfileOwnershipRecord {
  return {
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
  };
}

function makeAddress(
  overrides?: Partial<AddressOwnershipRecord>,
): AddressOwnershipRecord {
  return {
    id: 'addr_1',
    customerProfileId: 'cust_prof_1',
    label: 'Home',
    line1: 'No. 1, Main Road',
    line2: null,
    landmark: null,
    township: 'Botahtaung',
    city: 'Yangon',
    postalCode: null,
    deliveryInstructions: 'Call before arrival',
    isDefault: true,
    latitude: new Prisma.Decimal('16.834'),
    longitude: new Prisma.Decimal('96.176'),
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
  };
}

function makeBranch(
  overrides?: Partial<BranchOwnershipRecord>,
): BranchOwnershipRecord {
  return {
    id: 'branch_1',
    merchantId: 'merchant_1',
    name: 'Downtown Branch',
    contactPhone: null,
    line1: 'No. 1',
    township: 'Botahtaung',
    latitude: null,
    longitude: null,
    storeType: 'restaurant',
    primaryStoreTypeId: 'store_type_restaurant',
    status: BranchStatus.ACTIVE,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
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
    operatingHours: null,
    branchZones: [],
    staffAssignments: [],
    ...overrides,
  };
}

function makeCart(
  overrides?: Partial<CartAggregateEntity>,
): CartAggregateEntity {
  return {
    cartId: 'cart_1',
    customerProfileId: 'cust_prof_1',
    branchId: 'branch_1',
    merchantId: 'merchant_1',
    branchName: 'Downtown Branch',
    branchStatus: BranchStatus.ACTIVE,
    merchantStatus: MerchantStatus.ACTIVE,
    status: CartStatus.ACTIVE,
    totalQuantity: 1,
    subtotalAmount: '3000',
    totalAmount: '3000',
    isEmpty: false,
    items: [],
    ...overrides,
  };
}

describe('CheckoutContextService', () => {
  const currentUser = makeAuthenticatedUser({
    actorContext: {
      userId: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfileId: 'cust_prof_1',
    },
  });

  it('resolves a validated checkout context using an explicitly selected address', async () => {
    const customerProfilesService = {
      findOwnedByUserId: jest.fn().mockResolvedValue(makeCustomerProfile()),
    } as unknown as CustomerProfilesService;
    const addressesService = {
      findById: jest.fn().mockResolvedValue(makeAddress()),
    } as unknown as AddressesService;
    const branchesService = {
      findById: jest.fn().mockResolvedValue(makeBranch()),
    } as unknown as BranchesService;
    const cartQueryService = {
      getOwnedActiveCartAggregateOrEmpty: jest.fn().mockResolvedValue(makeCart()),
    } as unknown as CartQueryService;
    const checkoutValidationService = {
      assertCartReadyForCheckout: jest.fn().mockResolvedValue(undefined),
    } as unknown as CheckoutValidationService;
    const service = new CheckoutContextService(
      customerProfilesService,
      addressesService,
      branchesService,
      cartQueryService,
      checkoutValidationService,
    );

    const result = await service.getValidatedCurrentCustomerCheckoutContext(
      currentUser,
      {
        branchId: 'branch_1',
        addressId: 'addr_1',
      },
    );

    expect(addressesService.findById).toHaveBeenCalledWith('addr_1');
    expect(checkoutValidationService.assertCartReadyForCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'branch_1' }),
      expect.objectContaining({ cartId: 'cart_1' }),
    );
    expect(result).toMatchObject({
      currencyCode: 'MMK',
      customer: {
        customerProfileId: 'cust_prof_1',
      },
      address: {
        addressId: 'addr_1',
      },
      branch: {
        branchId: 'branch_1',
      },
      cart: {
        cartId: 'cart_1',
      },
    });
  });

  it('falls back to the default customer address when no address id is provided', async () => {
    const customerProfilesService = {
      findOwnedByUserId: jest.fn().mockResolvedValue(makeCustomerProfile()),
    } as unknown as CustomerProfilesService;
    const addressesService = {
      findDefaultByCustomerProfileId: jest.fn().mockResolvedValue(makeAddress()),
    } as unknown as AddressesService;
    const branchesService = {
      findById: jest.fn().mockResolvedValue(makeBranch()),
    } as unknown as BranchesService;
    const cartQueryService = {
      getOwnedActiveCartAggregateOrEmpty: jest.fn().mockResolvedValue(makeCart()),
    } as unknown as CartQueryService;
    const checkoutValidationService = {
      assertCartReadyForCheckout: jest.fn().mockResolvedValue(undefined),
    } as unknown as CheckoutValidationService;
    const service = new CheckoutContextService(
      customerProfilesService,
      addressesService,
      branchesService,
      cartQueryService,
      checkoutValidationService,
    );

    const result = await service.getValidatedCurrentCustomerCheckoutContext(
      currentUser,
      {
        branchId: 'branch_1',
      },
    );

    expect(addressesService.findDefaultByCustomerProfileId).toHaveBeenCalledWith(
      'cust_prof_1',
    );
    expect(result.address.addressId).toBe('addr_1');
  });

  it('rejects checkout context resolution when no default address exists', async () => {
    const service = new CheckoutContextService(
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeCustomerProfile()),
      } as unknown as CustomerProfilesService,
      {
        findDefaultByCustomerProfileId: jest.fn().mockResolvedValue(null),
      } as unknown as AddressesService,
      {} as BranchesService,
      {} as CartQueryService,
      {} as CheckoutValidationService,
    );

    await expect(
      service.getValidatedCurrentCustomerCheckoutContext(currentUser, {
        branchId: 'branch_1',
      }),
    ).rejects.toMatchObject({
      status: 422,
    });
  });

  it('rejects checkout context resolution when the requested address belongs to another customer profile', async () => {
    const service = new CheckoutContextService(
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeCustomerProfile()),
      } as unknown as CustomerProfilesService,
      {
        findById: jest.fn().mockResolvedValue(
          makeAddress({
            customerProfile: {
              id: 'cust_prof_2',
              userId: 'usr_2',
              user: {
                id: 'usr_2',
                phone: '0991111111',
                role: UserRole.CUSTOMER,
                status: UserStatus.ACTIVE,
              },
            },
          }),
        ),
      } as unknown as AddressesService,
      {} as BranchesService,
      {} as CartQueryService,
      {} as CheckoutValidationService,
    );

    await expect(
      service.getValidatedCurrentCustomerCheckoutContext(currentUser, {
        branchId: 'branch_1',
        addressId: 'addr_2',
      }),
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  it('rejects checkout context resolution when the branch does not exist', async () => {
    const service = new CheckoutContextService(
      {
        findOwnedByUserId: jest.fn().mockResolvedValue(makeCustomerProfile()),
      } as unknown as CustomerProfilesService,
      {
        findDefaultByCustomerProfileId: jest.fn().mockResolvedValue(makeAddress()),
      } as unknown as AddressesService,
      {
        findById: jest.fn().mockResolvedValue(null),
      } as unknown as BranchesService,
      {
        getOwnedActiveCartAggregateOrEmpty: jest.fn().mockResolvedValue(makeCart()),
      } as unknown as CartQueryService,
      {} as CheckoutValidationService,
    );

    await expect(
      service.getValidatedCurrentCustomerCheckoutContext(currentUser, {
        branchId: 'branch_missing',
      }),
    ).rejects.toMatchObject({
      status: 404,
    });
  });
});

import {
  BranchStatus,
  MerchantStatus,
  OrderStatus,
  Prisma,
  RiderStatus,
  UserStatus,
} from '@prisma/client';

import {
  buildOrderSummary,
  OrderSummaryRecord,
} from '../../../../src/modules/orders/entities/order-summary.entity';

function makeOrderSummaryRecord(
  overrides?: Partial<OrderSummaryRecord>,
): OrderSummaryRecord {
  return {
    id: 'order_1',
    orderCode: 'ORD-00000001',
    customerProfileId: 'cust_prof_1',
    branchId: 'branch_1',
    addressId: 'addr_1',
    cartId: 'cart_1',
    idempotencyKey: 'idem_1',
    status: OrderStatus.PLACED,
    subtotalAmount: new Prisma.Decimal('6500'),
    discountAmount: new Prisma.Decimal('0'),
    deliveryFee: new Prisma.Decimal('500'),
    totalAmount: new Prisma.Decimal('7000'),
    currencyCode: 'MMK',
    deliveryLabel: 'Home',
    deliveryLine1: 'No. 1, Main Road',
    deliveryLine2: null,
    deliveryLandmark: null,
    deliveryTownship: 'Botahtaung',
    deliveryCity: 'Yangon',
    deliveryPostalCode: null,
    deliveryInstructions: 'Call before arrival',
    deliveryLatitude: new Prisma.Decimal('16.834'),
    deliveryLongitude: new Prisma.Decimal('96.176'),
    placedAt: new Date('2026-04-19T10:00:00.000Z'),
    updatedAt: new Date('2026-04-19T10:05:00.000Z'),
    customerProfile: {
      id: 'cust_prof_1',
      fullName: 'Mg Mg',
      avatarUrl: null,
      user: {
        id: 'usr_1',
        phone: '09123456789',
        status: UserStatus.ACTIVE,
      },
    },
    branch: {
      id: 'branch_1',
      name: 'Downtown Branch',
      status: BranchStatus.ACTIVE,
      township: 'Botahtaung',
      merchant: {
        id: 'merchant_1',
        userId: 'usr_merchant_1',
        name: 'Merchant One',
        status: MerchantStatus.ACTIVE,
      },
    },
    delivery: {
      id: 'delivery_1',
      riderId: 'rider_1',
      etaMinutes: 20,
      rider: {
        id: 'rider_1',
        userId: 'usr_rider_1',
        displayName: 'Ko Aung',
        vehicleType: 'bike',
        currentTownship: 'Pabedan',
        status: RiderStatus.ACTIVE,
        user: {
          id: 'usr_rider_1',
          phone: '0999999999',
          status: UserStatus.ACTIVE,
        },
      },
    },
    items: [],
    statusHistory: [],
    address: null,
    cart: null,
    conversations: [],
    ...overrides,
  } as OrderSummaryRecord;
}

describe('buildOrderSummary', () => {
  it('serializes order summary scalars and nested context to API-friendly strings', () => {
    const result = buildOrderSummary(makeOrderSummaryRecord());

    expect(result).toMatchObject({
      orderId: 'order_1',
      orderCode: 'ORD-00000001',
      subtotalAmount: '6500',
      discountAmount: '0',
      deliveryFee: '500',
      totalAmount: '7000',
      customer: {
        customerProfileId: 'cust_prof_1',
        userId: 'usr_1',
        phone: '09123456789',
        fullName: 'Mg Mg',
      },
      branch: {
        branchId: 'branch_1',
        merchantId: 'merchant_1',
        merchantUserId: 'usr_merchant_1',
        merchantName: 'Merchant One',
      },
      delivery: {
        deliveryId: 'delivery_1',
        riderId: 'rider_1',
        rider: {
          riderId: 'rider_1',
          displayName: 'Ko Aung',
          vehicleType: 'bike',
        },
      },
    });
    expect(result.placedAt).toBe('2026-04-19T10:00:00.000Z');
    expect(result.updatedAt).toBe('2026-04-19T10:05:00.000Z');
  });

  it('keeps delivery context nullable when no delivery has been created yet', () => {
    const result = buildOrderSummary(
      makeOrderSummaryRecord({
        delivery: null,
      }),
    );

    expect(result.delivery).toBeNull();
  });
});

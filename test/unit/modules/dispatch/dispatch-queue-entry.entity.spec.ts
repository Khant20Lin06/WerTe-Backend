import {
  BranchStatus,
  DeliveryStatus,
  MerchantStatus,
  OrderStatus,
  Prisma,
  RiderStatus,
  UserStatus,
} from '@prisma/client';

import {
  buildDispatchQueueEntry,
  DispatchQueueEntryRecord,
} from '../../../../src/modules/dispatch/entities/dispatch-queue-entry.entity';

function makeDispatchQueueEntryRecord(
  overrides?: Partial<DispatchQueueEntryRecord>,
): DispatchQueueEntryRecord {
  return {
    id: 'order_1',
    orderCode: 'ORD-00000001',
    customerProfileId: 'cust_prof_1',
    branchId: 'branch_1',
    addressId: 'addr_1',
    cartId: 'cart_1',
    idempotencyKey: 'idem_1',
    status: OrderStatus.PREPARING,
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
      user: {
        id: 'usr_customer_1',
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
    delivery: null,
    items: [],
    statusHistory: [],
    address: null,
    cart: null,
    conversations: [],
    ...overrides,
  } as DispatchQueueEntryRecord;
}

describe('buildDispatchQueueEntry', () => {
  it('marks preparing orders without a delivery as awaiting_assignment', () => {
    const result = buildDispatchQueueEntry(makeDispatchQueueEntryRecord());

    expect(result).toMatchObject({
      orderId: 'order_1',
      queueState: 'awaiting_assignment',
      delivery: null,
      customer: {
        customerProfileId: 'cust_prof_1',
      },
    });
  });

  it('marks rider-assigned orders with delivery records as awaiting_rider_acceptance', () => {
    const result = buildDispatchQueueEntry(
      makeDispatchQueueEntryRecord({
        status: OrderStatus.RIDER_ASSIGNED,
        delivery: {
          id: 'delivery_1',
          riderId: 'rider_1',
          status: DeliveryStatus.ASSIGNED,
          etaMinutes: 15,
          assignedAt: new Date('2026-04-19T10:10:00.000Z'),
          acceptedAt: null,
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
            availability: {
              isOnline: true,
              isAvailable: true,
              lastStatusChangedAt: new Date('2026-04-19T10:09:00.000Z'),
            },
            currentLocation: {
              latitude: new Prisma.Decimal('16.840'),
              longitude: new Prisma.Decimal('96.180'),
              recordedAt: new Date('2026-04-19T10:09:30.000Z'),
            },
          },
        },
      }),
    );

    expect(result).toMatchObject({
      queueState: 'awaiting_rider_acceptance',
      delivery: {
        deliveryId: 'delivery_1',
        status: DeliveryStatus.ASSIGNED,
        rider: {
          riderId: 'rider_1',
          availability: {
            isOnline: true,
          },
          currentLocation: {
            latitude: '16.84',
          },
        },
      },
    });
  });
});

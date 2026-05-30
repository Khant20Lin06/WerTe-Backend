import {
  BranchStatus,
  ItemOptionGroupKind,
  MerchantStatus,
  OrderStatus,
  Prisma,
  UserStatus,
} from '@prisma/client';

import {
  buildOrderDetail,
  buildOrderTimelineEntry,
  OrderDetailRecord,
  OrderTimelineEntryRecord,
} from '../../../../src/modules/orders/entities/order-detail.entity';

function makeOrderDetailRecord(
  overrides?: Partial<OrderDetailRecord>,
): OrderDetailRecord {
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
    deliveryLine2: 'Room 5B',
    deliveryLandmark: 'Near City Mart',
    deliveryTownship: 'Botahtaung',
    deliveryCity: 'Yangon',
    deliveryPostalCode: '11111',
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
    delivery: null,
    items: [
      {
        id: 'order_item_1',
        orderId: 'order_1',
        menuItemId: 'item_1',
        categoryId: 'cat_1',
        nameSnapshot: 'Mohinga',
        descriptionSnapshot: 'Breakfast item',
        imageUrlSnapshot: null,
        menuItemStockTrackedSnapshot: true,
        unitBasePriceSnapshot: new Prisma.Decimal('2500'),
        unitPriceSnapshot: new Prisma.Decimal('3250'),
        quantity: 2,
        lineTotal: new Prisma.Decimal('6500'),
        inventoryLotAllocations: [
          {
            id: 'order_item_lot_alloc_1',
            inventoryLotId: 'lot_1',
            batchNoSnapshot: 'BATCH-001',
            expiryDateSnapshot: new Date('2026-05-30T00:00:00.000Z'),
            quantity: 2,
            createdAt: new Date('2026-04-19T10:00:00.000Z'),
            updatedAt: new Date('2026-04-19T10:00:00.000Z'),
          },
        ],
        createdAt: new Date('2026-04-19T10:00:00.000Z'),
        updatedAt: new Date('2026-04-19T10:00:00.000Z'),
        selectedOptions: [
          {
            id: 'order_item_option_1',
            orderItemId: 'order_item_1',
            itemOptionId: 'option_1',
            optionGroupId: 'group_1',
            optionGroupNameSnapshot: 'Choose extras',
            optionGroupKindSnapshot: ItemOptionGroupKind.ADD_ON,
            itemOptionStockTrackedSnapshot: true,
            nameSnapshot: 'Extra fish cake',
            priceDeltaSnapshot: new Prisma.Decimal('750'),
            createdAt: new Date('2026-04-19T10:00:00.000Z'),
            updatedAt: new Date('2026-04-19T10:00:00.000Z'),
          },
        ],
      },
    ],
    statusHistory: [
      {
        id: 'hist_1',
        fromStatus: null,
        toStatus: OrderStatus.PLACED,
        changedByUserId: 'usr_1',
        reasonCode: 'checkout_submitted',
        note: null,
        createdAt: new Date('2026-04-19T10:00:00.000Z'),
      },
    ],
    address: null,
    cart: null,
    conversations: [],
    ...overrides,
  } as OrderDetailRecord;
}

describe('order detail read models', () => {
  it('buildOrderTimelineEntry serializes history metadata', () => {
    const result = buildOrderTimelineEntry({
      id: 'hist_1',
      fromStatus: null,
      toStatus: OrderStatus.PLACED,
      changedByUserId: 'usr_1',
      reasonCode: 'checkout_submitted',
      note: null,
      createdAt: new Date('2026-04-19T10:00:00.000Z'),
    } as OrderTimelineEntryRecord);

    expect(result).toEqual({
      orderStatusHistoryId: 'hist_1',
      fromStatus: null,
      toStatus: OrderStatus.PLACED,
      changedByUserId: 'usr_1',
      reasonCode: 'checkout_submitted',
      note: null,
      createdAt: '2026-04-19T10:00:00.000Z',
    });
  });

  it('buildOrderDetail serializes address snapshots, item snapshots, and timeline entries', () => {
    const result = buildOrderDetail(makeOrderDetailRecord());

    expect(result).toMatchObject({
      orderId: 'order_1',
      deliveryAddress: {
        addressId: 'addr_1',
        label: 'Home',
        line1: 'No. 1, Main Road',
        line2: 'Room 5B',
        latitude: '16.834',
        longitude: '96.176',
      },
      items: [
        {
          orderItemId: 'order_item_1',
          menuItemId: 'item_1',
          unitBasePriceSnapshot: '2500',
          unitPriceSnapshot: '3250',
          lineTotal: '6500',
          inventoryLotAllocations: [
            {
              orderItemInventoryLotAllocationId: 'order_item_lot_alloc_1',
              inventoryLotId: 'lot_1',
              batchNoSnapshot: 'BATCH-001',
              expiryDateSnapshot: '2026-05-30T00:00:00.000Z',
              quantity: 2,
            },
          ],
          selectedOptions: [
            {
              orderItemOptionId: 'order_item_option_1',
              itemOptionId: 'option_1',
              optionGroupId: 'group_1',
              optionGroupKindSnapshot: ItemOptionGroupKind.ADD_ON,
              priceDeltaSnapshot: '750',
            },
          ],
        },
      ],
      timeline: [
        {
          orderStatusHistoryId: 'hist_1',
          toStatus: OrderStatus.PLACED,
          reasonCode: 'checkout_submitted',
        },
      ],
    });
  });
});

import { ItemOptionGroupKind, OrderStatus, Prisma } from '@prisma/client';

import {
  buildOrderSummary,
  OrderSummaryEntity,
  OrderSummaryRecord,
  orderSummaryInclude,
} from './order-summary.entity';

export const orderTimelineSelect =
  Prisma.validator<Prisma.OrderStatusHistorySelect>()({
    id: true,
    fromStatus: true,
    toStatus: true,
    changedByUserId: true,
    reasonCode: true,
    note: true,
    createdAt: true,
  });

export type OrderTimelineEntryRecord = Prisma.OrderStatusHistoryGetPayload<{
  select: typeof orderTimelineSelect;
}>;

export const orderDetailInclude = Prisma.validator<Prisma.OrderInclude>()({
  ...orderSummaryInclude,
  items: {
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      orderId: true,
      menuItemId: true,
      categoryId: true,
      nameSnapshot: true,
      descriptionSnapshot: true,
      imageUrlSnapshot: true,
      selectedVariantCombinationId: true,
      selectedVariantCombinationNameSnapshot: true,
      menuItemStockTrackedSnapshot: true,
      variantCombinationStockTrackedSnapshot: true,
      unitBasePriceSnapshot: true,
      unitPriceSnapshot: true,
      quantity: true,
      lineTotal: true,
      createdAt: true,
      updatedAt: true,
      inventoryLotAllocations: {
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          inventoryLotId: true,
          batchNoSnapshot: true,
          expiryDateSnapshot: true,
          quantity: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      selectedOptions: {
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          orderItemId: true,
          itemOptionId: true,
          optionGroupId: true,
          optionGroupNameSnapshot: true,
          optionGroupKindSnapshot: true,
          itemOptionStockTrackedSnapshot: true,
          nameSnapshot: true,
          priceDeltaSnapshot: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },
  statusHistory: {
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: orderTimelineSelect,
  },
});

export type OrderDetailRecord = Prisma.OrderGetPayload<{
  include: typeof orderDetailInclude;
}>;

export class OrderDetailAddressEntity {
  addressId!: string | null;
  label!: string | null;
  line1!: string | null;
  line2!: string | null;
  landmark!: string | null;
  township!: string | null;
  city!: string | null;
  postalCode!: string | null;
  deliveryInstructions!: string | null;
  latitude!: string | null;
  longitude!: string | null;
}

export class OrderDetailSelectedOptionEntity {
  orderItemOptionId!: string;
  itemOptionId!: string;
  optionGroupId!: string;
  optionGroupNameSnapshot!: string;
  optionGroupKindSnapshot!: ItemOptionGroupKind;
  nameSnapshot!: string;
  priceDeltaSnapshot!: string;
}

export class OrderDetailInventoryLotAllocationEntity {
  orderItemInventoryLotAllocationId!: string;
  inventoryLotId!: string;
  batchNoSnapshot!: string;
  expiryDateSnapshot!: string | null;
  quantity!: number;
}

export class OrderDetailItemEntity {
  orderItemId!: string;
  menuItemId!: string;
  categoryId!: string | null;
  nameSnapshot!: string;
  descriptionSnapshot!: string | null;
  imageUrlSnapshot!: string | null;
  selectedVariantCombinationId!: string | null;
  selectedVariantCombinationNameSnapshot!: string | null;
  unitBasePriceSnapshot!: string;
  unitPriceSnapshot!: string;
  quantity!: number;
  lineTotal!: string;
  inventoryLotAllocations!: OrderDetailInventoryLotAllocationEntity[];
  selectedOptions!: OrderDetailSelectedOptionEntity[];
}

export class OrderTimelineEntryEntity {
  orderStatusHistoryId!: string;
  fromStatus!: OrderStatus | null;
  toStatus!: OrderStatus;
  changedByUserId!: string | null;
  reasonCode!: string | null;
  note!: string | null;
  createdAt!: string;
}

export class OrderDetailEntity extends OrderSummaryEntity {
  deliveryAddress!: OrderDetailAddressEntity;
  items!: OrderDetailItemEntity[];
  timeline!: OrderTimelineEntryEntity[];
}

export function buildOrderTimelineEntry(
  entry: OrderTimelineEntryRecord,
): OrderTimelineEntryEntity {
  return {
    orderStatusHistoryId: entry.id,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    changedByUserId: entry.changedByUserId,
    reasonCode: entry.reasonCode,
    note: entry.note,
    createdAt: entry.createdAt.toISOString(),
  };
}

export function buildOrderDetail(order: OrderDetailRecord): OrderDetailEntity {
  const summary = buildOrderSummary(order as OrderSummaryRecord);

  return {
    ...summary,
    deliveryAddress: {
      addressId: order.addressId,
      label: order.deliveryLabel,
      line1: order.deliveryLine1,
      line2: order.deliveryLine2,
      landmark: order.deliveryLandmark,
      township: order.deliveryTownship,
      city: order.deliveryCity,
      postalCode: order.deliveryPostalCode,
      deliveryInstructions: order.deliveryInstructions,
      latitude:
        order.deliveryLatitude === null ? null : order.deliveryLatitude.toString(),
      longitude:
        order.deliveryLongitude === null
          ? null
          : order.deliveryLongitude.toString(),
    },
    items: order.items.map((item) => ({
      orderItemId: item.id,
      menuItemId: item.menuItemId,
      categoryId: item.categoryId,
      nameSnapshot: item.nameSnapshot,
      descriptionSnapshot: item.descriptionSnapshot,
      imageUrlSnapshot: item.imageUrlSnapshot,
      selectedVariantCombinationId: item.selectedVariantCombinationId,
      selectedVariantCombinationNameSnapshot:
        item.selectedVariantCombinationNameSnapshot,
      unitBasePriceSnapshot: item.unitBasePriceSnapshot.toString(),
      unitPriceSnapshot: item.unitPriceSnapshot.toString(),
      quantity: item.quantity,
      lineTotal: item.lineTotal.toString(),
      inventoryLotAllocations: item.inventoryLotAllocations.map((allocation) => ({
        orderItemInventoryLotAllocationId: allocation.id,
        inventoryLotId: allocation.inventoryLotId,
        batchNoSnapshot: allocation.batchNoSnapshot,
        expiryDateSnapshot:
          allocation.expiryDateSnapshot?.toISOString() ?? null,
        quantity: allocation.quantity,
      })),
      selectedOptions: item.selectedOptions.map((selectedOption) => ({
        orderItemOptionId: selectedOption.id,
        itemOptionId: selectedOption.itemOptionId,
        optionGroupId: selectedOption.optionGroupId,
        optionGroupNameSnapshot: selectedOption.optionGroupNameSnapshot,
        optionGroupKindSnapshot: selectedOption.optionGroupKindSnapshot,
        nameSnapshot: selectedOption.nameSnapshot,
        priceDeltaSnapshot: selectedOption.priceDeltaSnapshot.toString(),
      })),
    })),
    timeline: order.statusHistory.map((entry) => buildOrderTimelineEntry(entry)),
  };
}

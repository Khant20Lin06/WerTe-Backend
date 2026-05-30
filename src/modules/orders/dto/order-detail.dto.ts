import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemOptionGroupKind } from '@prisma/client';

import {
  OrderDetailEntity,
  OrderDetailInventoryLotAllocationEntity,
  OrderDetailItemEntity,
  OrderDetailSelectedOptionEntity,
  OrderTimelineEntryEntity,
} from '../entities/order-detail.entity';
import { OrderSummaryDto, toOrderSummaryDto } from './order-summary.dto';

class OrderDetailAddressDto {
  @ApiPropertyOptional({ example: 'addr_1' })
  addressId!: string | null;

  @ApiPropertyOptional({ example: 'Home' })
  label!: string | null;

  @ApiPropertyOptional({ example: 'No. 1, Main Road' })
  line1!: string | null;

  @ApiPropertyOptional({ example: 'Room 5B' })
  line2!: string | null;

  @ApiPropertyOptional({ example: 'Near City Mart' })
  landmark!: string | null;

  @ApiPropertyOptional({ example: 'Botahtaung' })
  township!: string | null;

  @ApiPropertyOptional({ example: 'Yangon' })
  city!: string | null;

  @ApiPropertyOptional({ example: '11111' })
  postalCode!: string | null;

  @ApiPropertyOptional({ example: 'Call before arrival' })
  deliveryInstructions!: string | null;

  @ApiPropertyOptional({ example: '16.834' })
  latitude!: string | null;

  @ApiPropertyOptional({ example: '96.176' })
  longitude!: string | null;
}

class OrderDetailSelectedOptionDto {
  @ApiProperty({ example: 'order_item_option_1' })
  orderItemOptionId!: string;

  @ApiProperty({ example: 'option_1' })
  itemOptionId!: string;

  @ApiProperty({ example: 'group_1' })
  optionGroupId!: string;

  @ApiProperty({ example: 'Choose extras' })
  optionGroupNameSnapshot!: string;

  @ApiProperty({
    enum: ItemOptionGroupKind,
    example: ItemOptionGroupKind.ADD_ON,
  })
  optionGroupKindSnapshot!: ItemOptionGroupKind;

  @ApiProperty({ example: 'Extra fish cake' })
  nameSnapshot!: string;

  @ApiProperty({ example: '750' })
  priceDeltaSnapshot!: string;
}

class OrderDetailInventoryLotAllocationDto {
  @ApiProperty({ example: 'order_item_lot_alloc_1' })
  orderItemInventoryLotAllocationId!: string;

  @ApiProperty({ example: 'lot_1' })
  inventoryLotId!: string;

  @ApiProperty({ example: 'BATCH-001' })
  batchNoSnapshot!: string;

  @ApiPropertyOptional({ example: '2026-05-30T00:00:00.000Z' })
  expiryDateSnapshot!: string | null;

  @ApiProperty({ example: 2 })
  quantity!: number;
}

class OrderDetailItemDto {
  @ApiProperty({ example: 'order_item_1' })
  orderItemId!: string;

  @ApiProperty({ example: 'item_1' })
  menuItemId!: string;

  @ApiPropertyOptional({ example: 'cat_1' })
  categoryId!: string | null;

  @ApiProperty({ example: 'Mohinga' })
  nameSnapshot!: string;

  @ApiPropertyOptional({ example: 'Breakfast item' })
  descriptionSnapshot!: string | null;

  @ApiPropertyOptional({ example: null })
  imageUrlSnapshot!: string | null;

  @ApiPropertyOptional({ example: 'variant_combo_1' })
  selectedVariantCombinationId!: string | null;

  @ApiPropertyOptional({ example: 'Small / Red / Cotton' })
  selectedVariantCombinationNameSnapshot!: string | null;

  @ApiProperty({ example: '2500' })
  unitBasePriceSnapshot!: string;

  @ApiProperty({ example: '3250' })
  unitPriceSnapshot!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: '6500' })
  lineTotal!: string;

  @ApiProperty({
    type: () => OrderDetailInventoryLotAllocationDto,
    isArray: true,
  })
  inventoryLotAllocations!: OrderDetailInventoryLotAllocationDto[];

  @ApiProperty({ type: () => OrderDetailSelectedOptionDto, isArray: true })
  selectedOptions!: OrderDetailSelectedOptionDto[];
}

class OrderTimelineEntryDto {
  @ApiProperty({ example: 'hist_1' })
  orderStatusHistoryId!: string;

  @ApiPropertyOptional({ example: null })
  fromStatus!: string | null;

  @ApiProperty({ example: 'PLACED' })
  toStatus!: string;

  @ApiPropertyOptional({ example: 'usr_1' })
  changedByUserId!: string | null;

  @ApiPropertyOptional({ example: 'checkout_submitted' })
  reasonCode!: string | null;

  @ApiPropertyOptional({ example: null })
  note!: string | null;

  @ApiProperty({ example: '2026-04-19T10:00:00.000Z' })
  createdAt!: string;
}

function toOrderDetailSelectedOptionDto(
  selectedOption: OrderDetailSelectedOptionEntity,
): OrderDetailSelectedOptionDto {
  return {
    orderItemOptionId: selectedOption.orderItemOptionId,
    itemOptionId: selectedOption.itemOptionId,
    optionGroupId: selectedOption.optionGroupId,
    optionGroupNameSnapshot: selectedOption.optionGroupNameSnapshot,
    optionGroupKindSnapshot: selectedOption.optionGroupKindSnapshot,
    nameSnapshot: selectedOption.nameSnapshot,
    priceDeltaSnapshot: selectedOption.priceDeltaSnapshot,
  };
}

function toOrderDetailInventoryLotAllocationDto(
  allocation: OrderDetailInventoryLotAllocationEntity,
): OrderDetailInventoryLotAllocationDto {
  return {
    orderItemInventoryLotAllocationId: allocation.orderItemInventoryLotAllocationId,
    inventoryLotId: allocation.inventoryLotId,
    batchNoSnapshot: allocation.batchNoSnapshot,
    expiryDateSnapshot: allocation.expiryDateSnapshot,
    quantity: allocation.quantity,
  };
}

function toOrderDetailItemDto(item: OrderDetailItemEntity): OrderDetailItemDto {
  return {
    orderItemId: item.orderItemId,
    menuItemId: item.menuItemId,
    categoryId: item.categoryId,
    nameSnapshot: item.nameSnapshot,
    descriptionSnapshot: item.descriptionSnapshot,
    imageUrlSnapshot: item.imageUrlSnapshot,
    selectedVariantCombinationId: item.selectedVariantCombinationId,
    selectedVariantCombinationNameSnapshot:
      item.selectedVariantCombinationNameSnapshot,
    unitBasePriceSnapshot: item.unitBasePriceSnapshot,
    unitPriceSnapshot: item.unitPriceSnapshot,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
    inventoryLotAllocations: item.inventoryLotAllocations.map((allocation) =>
      toOrderDetailInventoryLotAllocationDto(allocation),
    ),
    selectedOptions: item.selectedOptions.map((selectedOption) =>
      toOrderDetailSelectedOptionDto(selectedOption),
    ),
  };
}

function toOrderTimelineEntryDto(
  entry: OrderTimelineEntryEntity,
): OrderTimelineEntryDto {
  return {
    orderStatusHistoryId: entry.orderStatusHistoryId,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    changedByUserId: entry.changedByUserId,
    reasonCode: entry.reasonCode,
    note: entry.note,
    createdAt: entry.createdAt,
  };
}

export class OrderDetailDto extends OrderSummaryDto {
  @ApiProperty({ type: () => OrderDetailAddressDto })
  deliveryAddress!: OrderDetailAddressDto;

  @ApiProperty({ type: () => OrderDetailItemDto, isArray: true })
  items!: OrderDetailItemDto[];

  @ApiProperty({ type: () => OrderTimelineEntryDto, isArray: true })
  timeline!: OrderTimelineEntryDto[];
}

export function toOrderDetailDto(order: OrderDetailEntity): OrderDetailDto {
  const summary = toOrderSummaryDto(order);

  return {
    ...summary,
    deliveryAddress: {
      addressId: order.deliveryAddress.addressId,
      label: order.deliveryAddress.label,
      line1: order.deliveryAddress.line1,
      line2: order.deliveryAddress.line2,
      landmark: order.deliveryAddress.landmark,
      township: order.deliveryAddress.township,
      city: order.deliveryAddress.city,
      postalCode: order.deliveryAddress.postalCode,
      deliveryInstructions: order.deliveryAddress.deliveryInstructions,
      latitude: order.deliveryAddress.latitude,
      longitude: order.deliveryAddress.longitude,
    },
    items: order.items.map((item) => toOrderDetailItemDto(item)),
    timeline: order.timeline.map((entry) => toOrderTimelineEntryDto(entry)),
  };
}

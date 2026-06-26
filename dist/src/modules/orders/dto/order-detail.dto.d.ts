import { ItemOptionGroupKind } from '@prisma/client';
import { OrderDetailEntity } from '../entities/order-detail.entity';
import { OrderSummaryDto } from './order-summary.dto';
declare class OrderDetailAddressDto {
    addressId: string | null;
    label: string | null;
    line1: string | null;
    line2: string | null;
    landmark: string | null;
    township: string | null;
    city: string | null;
    postalCode: string | null;
    deliveryInstructions: string | null;
    latitude: string | null;
    longitude: string | null;
}
declare class OrderDetailSelectedOptionDto {
    orderItemOptionId: string;
    itemOptionId: string;
    optionGroupId: string;
    optionGroupNameSnapshot: string;
    optionGroupKindSnapshot: ItemOptionGroupKind;
    nameSnapshot: string;
    priceDeltaSnapshot: string;
}
declare class OrderDetailInventoryLotAllocationDto {
    orderItemInventoryLotAllocationId: string;
    inventoryLotId: string;
    batchNoSnapshot: string;
    expiryDateSnapshot: string | null;
    quantity: number;
}
declare class OrderDetailItemDto {
    orderItemId: string;
    menuItemId: string;
    categoryId: string | null;
    nameSnapshot: string;
    descriptionSnapshot: string | null;
    imageUrlSnapshot: string | null;
    selectedVariantCombinationId: string | null;
    selectedVariantCombinationNameSnapshot: string | null;
    unitBasePriceSnapshot: string;
    unitPriceSnapshot: string;
    quantity: number;
    lineTotal: string;
    inventoryLotAllocations: OrderDetailInventoryLotAllocationDto[];
    selectedOptions: OrderDetailSelectedOptionDto[];
}
declare class OrderTimelineEntryDto {
    orderStatusHistoryId: string;
    fromStatus: string | null;
    toStatus: string;
    changedByUserId: string | null;
    reasonCode: string | null;
    note: string | null;
    createdAt: string;
}
export declare class OrderDetailDto extends OrderSummaryDto {
    deliveryAddress: OrderDetailAddressDto;
    items: OrderDetailItemDto[];
    timeline: OrderTimelineEntryDto[];
}
export declare function toOrderDetailDto(order: OrderDetailEntity): OrderDetailDto;
export {};

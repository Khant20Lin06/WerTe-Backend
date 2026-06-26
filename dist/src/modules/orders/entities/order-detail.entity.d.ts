import { ItemOptionGroupKind, OrderStatus, Prisma } from '@prisma/client';
import { OrderSummaryEntity } from './order-summary.entity';
export declare const orderTimelineSelect: {
    id: true;
    fromStatus: true;
    toStatus: true;
    changedByUserId: true;
    reasonCode: true;
    note: true;
    createdAt: true;
};
export type OrderTimelineEntryRecord = Prisma.OrderStatusHistoryGetPayload<{
    select: typeof orderTimelineSelect;
}>;
export declare const orderDetailInclude: {
    items: {
        orderBy: [{
            createdAt: "asc";
        }, {
            id: "asc";
        }];
        select: {
            id: true;
            orderId: true;
            menuItemId: true;
            categoryId: true;
            nameSnapshot: true;
            descriptionSnapshot: true;
            imageUrlSnapshot: true;
            selectedVariantCombinationId: true;
            selectedVariantCombinationNameSnapshot: true;
            menuItemStockTrackedSnapshot: true;
            variantCombinationStockTrackedSnapshot: true;
            unitBasePriceSnapshot: true;
            unitPriceSnapshot: true;
            quantity: true;
            lineTotal: true;
            createdAt: true;
            updatedAt: true;
            inventoryLotAllocations: {
                orderBy: [{
                    createdAt: "asc";
                }, {
                    id: "asc";
                }];
                select: {
                    id: true;
                    inventoryLotId: true;
                    batchNoSnapshot: true;
                    expiryDateSnapshot: true;
                    quantity: true;
                    createdAt: true;
                    updatedAt: true;
                };
            };
            selectedOptions: {
                orderBy: [{
                    createdAt: "asc";
                }, {
                    id: "asc";
                }];
                select: {
                    id: true;
                    orderItemId: true;
                    itemOptionId: true;
                    optionGroupId: true;
                    optionGroupNameSnapshot: true;
                    optionGroupKindSnapshot: true;
                    itemOptionStockTrackedSnapshot: true;
                    nameSnapshot: true;
                    priceDeltaSnapshot: true;
                    createdAt: true;
                    updatedAt: true;
                };
            };
        };
    };
    statusHistory: {
        orderBy: [{
            createdAt: "asc";
        }, {
            id: "asc";
        }];
        select: {
            id: true;
            fromStatus: true;
            toStatus: true;
            changedByUserId: true;
            reasonCode: true;
            note: true;
            createdAt: true;
        };
    };
    customerProfile: {
        select: {
            id: true;
            fullName: true;
            avatarUrl: true;
            user: {
                select: {
                    id: true;
                    phone: true;
                    status: true;
                };
            };
        };
    };
    branch: {
        select: {
            id: true;
            name: true;
            status: true;
            township: true;
            merchant: {
                select: {
                    id: true;
                    userId: true;
                    name: true;
                    status: true;
                };
            };
        };
    };
    delivery: {
        select: {
            id: true;
            riderId: true;
            etaMinutes: true;
            rider: {
                select: {
                    id: true;
                    userId: true;
                    displayName: true;
                    vehicleType: true;
                    currentTownship: true;
                    status: true;
                    user: {
                        select: {
                            id: true;
                            phone: true;
                            status: true;
                        };
                    };
                };
            };
        };
    };
};
export type OrderDetailRecord = Prisma.OrderGetPayload<{
    include: typeof orderDetailInclude;
}>;
export declare class OrderDetailAddressEntity {
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
export declare class OrderDetailSelectedOptionEntity {
    orderItemOptionId: string;
    itemOptionId: string;
    optionGroupId: string;
    optionGroupNameSnapshot: string;
    optionGroupKindSnapshot: ItemOptionGroupKind;
    nameSnapshot: string;
    priceDeltaSnapshot: string;
}
export declare class OrderDetailInventoryLotAllocationEntity {
    orderItemInventoryLotAllocationId: string;
    inventoryLotId: string;
    batchNoSnapshot: string;
    expiryDateSnapshot: string | null;
    quantity: number;
}
export declare class OrderDetailItemEntity {
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
    inventoryLotAllocations: OrderDetailInventoryLotAllocationEntity[];
    selectedOptions: OrderDetailSelectedOptionEntity[];
}
export declare class OrderTimelineEntryEntity {
    orderStatusHistoryId: string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    changedByUserId: string | null;
    reasonCode: string | null;
    note: string | null;
    createdAt: string;
}
export declare class OrderDetailEntity extends OrderSummaryEntity {
    deliveryAddress: OrderDetailAddressEntity;
    items: OrderDetailItemEntity[];
    timeline: OrderTimelineEntryEntity[];
}
export declare function buildOrderTimelineEntry(entry: OrderTimelineEntryRecord): OrderTimelineEntryEntity;
export declare function buildOrderDetail(order: OrderDetailRecord): OrderDetailEntity;

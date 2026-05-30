import { OrderStatus, Prisma } from '@prisma/client';
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
        include: {
            selectedOptions: {
                orderBy: [{
                    createdAt: "asc";
                }, {
                    id: "asc";
                }];
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
    nameSnapshot: string;
    priceDeltaSnapshot: string;
}
export declare class OrderDetailItemEntity {
    orderItemId: string;
    menuItemId: string;
    categoryId: string | null;
    nameSnapshot: string;
    descriptionSnapshot: string | null;
    imageUrlSnapshot: string | null;
    unitBasePriceSnapshot: string;
    unitPriceSnapshot: string;
    quantity: number;
    lineTotal: string;
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

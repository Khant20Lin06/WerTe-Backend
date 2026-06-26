import { BranchStatus, DeliveryType, MerchantStatus, OrderStatus, Prisma, RiderStatus, UserStatus } from '@prisma/client';
import { AppliedPromotionEntity } from '../../promotions/entities/applied-promotion.entity';
export declare const orderSummaryInclude: {
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
    items: {
        select: {
            id: true;
            nameSnapshot: true;
            quantity: true;
            unitPriceSnapshot: true;
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
export type OrderSummaryRecord = Prisma.OrderGetPayload<{
    include: typeof orderSummaryInclude;
}>;
export declare class OrderSummaryItemEntity {
    orderItemId: string;
    name: string;
    quantity: number;
    unitPrice: string;
}
export declare class OrderSummaryCustomerEntity {
    customerProfileId: string;
    userId: string;
    phone: string;
    userStatus: UserStatus;
    fullName: string | null;
    avatarUrl: string | null;
}
export declare class OrderSummaryBranchEntity {
    branchId: string;
    branchName: string;
    branchStatus: BranchStatus;
    township: string;
    merchantId: string;
    merchantUserId: string;
    merchantName: string;
    merchantStatus: MerchantStatus;
}
export declare class OrderSummaryRiderEntity {
    riderId: string;
    userId: string;
    phone: string;
    userStatus: UserStatus;
    displayName: string;
    vehicleType: string;
    currentTownship: string | null;
    status: RiderStatus;
}
export declare class OrderSummaryDeliveryEntity {
    deliveryId: string;
    riderId: string | null;
    etaMinutes: number | null;
    rider: OrderSummaryRiderEntity | null;
}
export declare class OrderSummaryEntity {
    orderId: string;
    orderCode: string;
    customerProfileId: string;
    branchId: string;
    addressId: string | null;
    cartId: string | null;
    status: OrderStatus;
    deliveryType: DeliveryType;
    currencyCode: string;
    appliedPromotion?: AppliedPromotionEntity | null;
    subtotalAmount: string;
    discountAmount: string;
    deliveryFee: string;
    totalAmount: string;
    placedAt: string;
    updatedAt: string;
    availableActions: string[];
    summaryItems?: OrderSummaryItemEntity[];
    customer: OrderSummaryCustomerEntity;
    branch: OrderSummaryBranchEntity;
    delivery: OrderSummaryDeliveryEntity | null;
}
export declare function buildOrderSummary(order: OrderSummaryRecord): OrderSummaryEntity;

import { BranchStatus, DeliveryStatus, MerchantStatus, OrderStatus, Prisma, RiderStatus, UserStatus } from '@prisma/client';
export declare const dispatchQueueOrderInclude: {
    customerProfile: {
        select: {
            id: true;
            fullName: true;
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
            status: true;
            etaMinutes: true;
            assignedAt: true;
            acceptedAt: true;
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
                    availability: {
                        select: {
                            isOnline: true;
                            isAvailable: true;
                            lastStatusChangedAt: true;
                        };
                    };
                    currentLocation: {
                        select: {
                            latitude: true;
                            longitude: true;
                            recordedAt: true;
                        };
                    };
                };
            };
        };
    };
};
export type DispatchQueueEntryRecord = Prisma.OrderGetPayload<{
    include: typeof dispatchQueueOrderInclude;
}>;
export declare class DispatchQueueCustomerEntity {
    customerProfileId: string;
    userId: string;
    phone: string;
    userStatus: UserStatus;
    fullName: string | null;
}
export declare class DispatchQueueBranchEntity {
    branchId: string;
    branchName: string;
    branchStatus: BranchStatus;
    township: string;
    merchantId: string;
    merchantUserId: string;
    merchantName: string;
    merchantStatus: MerchantStatus;
}
export declare class DispatchQueueRiderAvailabilityEntity {
    isOnline: boolean;
    isAvailable: boolean;
    lastStatusChangedAt: string;
}
export declare class DispatchQueueRiderLocationEntity {
    latitude: string;
    longitude: string;
    recordedAt: string;
}
export declare class DispatchQueueRiderEntity {
    riderId: string;
    userId: string;
    phone: string;
    userStatus: UserStatus;
    displayName: string;
    vehicleType: string;
    currentTownship: string | null;
    status: RiderStatus;
    availability: DispatchQueueRiderAvailabilityEntity | null;
    currentLocation: DispatchQueueRiderLocationEntity | null;
}
export declare class DispatchQueueDeliveryEntity {
    deliveryId: string;
    riderId: string | null;
    status: DeliveryStatus;
    etaMinutes: number | null;
    assignedAt: string | null;
    acceptedAt: string | null;
    rider: DispatchQueueRiderEntity | null;
}
export declare class DispatchQueueEntryEntity {
    orderId: string;
    orderCode: string;
    orderStatus: OrderStatus;
    queueState: 'awaiting_assignment' | 'awaiting_rider_acceptance';
    currencyCode: string;
    totalAmount: string;
    deliveryTownship: string | null;
    deliveryLatitude: string | null;
    deliveryLongitude: string | null;
    placedAt: string;
    updatedAt: string;
    customer: DispatchQueueCustomerEntity;
    branch: DispatchQueueBranchEntity;
    delivery: DispatchQueueDeliveryEntity | null;
}
export declare function buildDispatchQueueEntry(order: DispatchQueueEntryRecord): DispatchQueueEntryEntity;

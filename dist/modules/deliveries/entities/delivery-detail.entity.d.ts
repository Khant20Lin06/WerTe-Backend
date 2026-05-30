import { BranchStatus, DeliveryStatus, MerchantStatus, Prisma, RiderStatus, UserStatus } from '@prisma/client';
export declare const deliveryLinkedOrderSelect: {
    id: true;
    orderCode: true;
    status: true;
    currencyCode: true;
    subtotalAmount: true;
    discountAmount: true;
    deliveryFee: true;
    totalAmount: true;
    deliveryLabel: true;
    deliveryLine1: true;
    deliveryLine2: true;
    deliveryLandmark: true;
    deliveryTownship: true;
    deliveryCity: true;
    deliveryPostalCode: true;
    deliveryInstructions: true;
    deliveryLatitude: true;
    deliveryLongitude: true;
    placedAt: true;
    updatedAt: true;
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
};
export declare const deliveryRiderSelect: {
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
            updatedAt: true;
        };
    };
    currentLocation: {
        select: {
            latitude: true;
            longitude: true;
            heading: true;
            speed: true;
            accuracyMeters: true;
            recordedAt: true;
            deliveryId: true;
        };
    };
};
export declare const deliveryDetailInclude: {
    order: {
        select: {
            id: true;
            orderCode: true;
            status: true;
            currencyCode: true;
            subtotalAmount: true;
            discountAmount: true;
            deliveryFee: true;
            totalAmount: true;
            deliveryLabel: true;
            deliveryLine1: true;
            deliveryLine2: true;
            deliveryLandmark: true;
            deliveryTownship: true;
            deliveryCity: true;
            deliveryPostalCode: true;
            deliveryInstructions: true;
            deliveryLatitude: true;
            deliveryLongitude: true;
            placedAt: true;
            updatedAt: true;
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
        };
    };
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
                    updatedAt: true;
                };
            };
            currentLocation: {
                select: {
                    latitude: true;
                    longitude: true;
                    heading: true;
                    speed: true;
                    accuracyMeters: true;
                    recordedAt: true;
                    deliveryId: true;
                };
            };
        };
    };
};
export type DeliveryDetailRecord = Prisma.DeliveryGetPayload<{
    include: typeof deliveryDetailInclude;
}>;
export declare class DeliveryDetailOrderCustomerEntity {
    customerProfileId: string;
    userId: string;
    phone: string;
    userStatus: UserStatus;
    fullName: string | null;
}
export declare class DeliveryDetailOrderBranchEntity {
    branchId: string;
    branchName: string;
    branchStatus: BranchStatus;
    township: string;
    merchantId: string;
    merchantUserId: string;
    merchantName: string;
    merchantStatus: MerchantStatus;
}
export declare class DeliveryDetailOrderAddressEntity {
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
export declare class DeliveryDetailOrderEntity {
    orderId: string;
    orderCode: string;
    orderStatus: string;
    currencyCode: string;
    subtotalAmount: string;
    discountAmount: string;
    deliveryFee: string;
    totalAmount: string;
    placedAt: string;
    updatedAt: string;
    customer: DeliveryDetailOrderCustomerEntity;
    branch: DeliveryDetailOrderBranchEntity;
    deliveryAddress: DeliveryDetailOrderAddressEntity;
}
export declare class DeliveryDetailRiderAvailabilityEntity {
    isOnline: boolean;
    isAvailable: boolean;
    lastStatusChangedAt: string;
    updatedAt: string;
}
export declare class DeliveryDetailRiderLocationEntity {
    latitude: string;
    longitude: string;
    heading: string | null;
    speed: string | null;
    accuracyMeters: string | null;
    recordedAt: string;
    deliveryId: string | null;
}
export declare class DeliveryDetailRiderEntity {
    riderId: string;
    userId: string;
    phone: string;
    userStatus: UserStatus;
    displayName: string;
    vehicleType: string;
    currentTownship: string | null;
    status: RiderStatus;
    availability: DeliveryDetailRiderAvailabilityEntity | null;
    currentLocation: DeliveryDetailRiderLocationEntity | null;
}
export declare class DeliveryDetailEntity {
    deliveryId: string;
    orderId: string;
    riderId: string | null;
    status: DeliveryStatus;
    etaMinutes: number | null;
    assignedAt: string | null;
    acceptedAt: string | null;
    pickedUpAt: string | null;
    onTheWayAt: string | null;
    deliveredAt: string | null;
    failedAt: string | null;
    cancelledAt: string | null;
    failureReasonCode: string | null;
    failureNote: string | null;
    createdAt: string;
    updatedAt: string;
    order: DeliveryDetailOrderEntity;
    rider: DeliveryDetailRiderEntity | null;
}
export declare function buildDeliveryDetail(delivery: DeliveryDetailRecord): DeliveryDetailEntity;

import { DeliveryDetailEntity } from '../entities/delivery-detail.entity';
declare class DeliveryDetailOrderCustomerDto {
    customerProfileId: string;
    userId: string;
    phone: string;
    userStatus: string;
    fullName: string | null;
}
declare class DeliveryDetailOrderBranchDto {
    branchId: string;
    branchName: string;
    branchStatus: string;
    township: string;
    merchantId: string;
    merchantUserId: string;
    merchantName: string;
    merchantStatus: string;
}
declare class DeliveryDetailOrderAddressDto {
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
declare class DeliveryDetailOrderDto {
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
    customer: DeliveryDetailOrderCustomerDto;
    branch: DeliveryDetailOrderBranchDto;
    deliveryAddress: DeliveryDetailOrderAddressDto;
}
declare class DeliveryDetailRiderAvailabilityDto {
    isOnline: boolean;
    isAvailable: boolean;
    lastStatusChangedAt: string;
    updatedAt: string;
}
declare class DeliveryDetailRiderLocationDto {
    latitude: string;
    longitude: string;
    heading: string | null;
    speed: string | null;
    accuracyMeters: string | null;
    recordedAt: string;
    deliveryId: string | null;
}
declare class DeliveryDetailRiderDto {
    riderId: string;
    userId: string;
    phone: string;
    userStatus: string;
    displayName: string;
    vehicleType: string;
    currentTownship: string | null;
    status: string;
    availability: DeliveryDetailRiderAvailabilityDto | null;
    currentLocation: DeliveryDetailRiderLocationDto | null;
}
export declare class DeliveryDetailDto {
    deliveryId: string;
    orderId: string;
    riderId: string | null;
    status: string;
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
    order: DeliveryDetailOrderDto;
    rider: DeliveryDetailRiderDto | null;
}
export declare function toDeliveryDetailDto(delivery: DeliveryDetailEntity): DeliveryDetailDto;
export {};

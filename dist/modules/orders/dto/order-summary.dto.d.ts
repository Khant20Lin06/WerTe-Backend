import { OrderSummaryEntity } from '../entities/order-summary.entity';
declare class OrderSummaryCustomerDto {
    customerProfileId: string;
    userId: string;
    phone: string;
    userStatus: string;
    fullName: string | null;
    avatarUrl: string | null;
}
declare class OrderSummaryBranchDto {
    branchId: string;
    branchName: string;
    branchStatus: string;
    township: string;
    merchantId: string;
    merchantUserId: string;
    merchantName: string;
    merchantStatus: string;
}
declare class OrderSummaryRiderDto {
    riderId: string;
    userId: string;
    phone: string;
    userStatus: string;
    displayName: string;
    vehicleType: string;
    currentTownship: string | null;
    status: string;
}
declare class OrderSummaryDeliveryDto {
    deliveryId: string;
    riderId: string | null;
    etaMinutes: number | null;
    rider: OrderSummaryRiderDto | null;
}
export declare class OrderSummaryDto {
    orderId: string;
    orderCode: string;
    customerProfileId: string;
    branchId: string;
    addressId: string | null;
    cartId: string | null;
    status: string;
    currencyCode: string;
    subtotalAmount: string;
    discountAmount: string;
    deliveryFee: string;
    totalAmount: string;
    placedAt: string;
    updatedAt: string;
    availableActions: string[];
    customer: OrderSummaryCustomerDto;
    branch: OrderSummaryBranchDto;
    delivery: OrderSummaryDeliveryDto | null;
}
export declare function toOrderSummaryDto(order: OrderSummaryEntity): OrderSummaryDto;
export {};

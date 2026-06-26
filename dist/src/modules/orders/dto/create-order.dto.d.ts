import { DeliveryType, PaymentMethod, PaymentProvider } from '@prisma/client';
export declare class CreateOrderDto {
    branchId: string;
    deliveryType?: DeliveryType;
    addressId?: string;
    idempotencyKey: string;
    paymentMethod?: PaymentMethod;
    paymentProvider?: PaymentProvider;
    promotionCode?: string;
}

import { CartDto } from '../../carts/dto/cart.dto';
import { CheckoutPreviewEntity } from '../entities/checkout-preview.entity';
export declare class CheckoutPreviewCustomerDto {
    customerProfileId: string;
    userId: string;
    phone: string;
    role: string;
    userStatus: string;
    fullName?: string | null;
    avatarUrl?: string | null;
}
export declare class CheckoutPreviewAddressDto {
    addressId: string;
    label: string;
    line1: string;
    line2?: string | null;
    landmark?: string | null;
    township: string;
    city?: string | null;
    postalCode?: string | null;
    deliveryInstructions?: string | null;
    latitude: string;
    longitude: string;
    isDefault: boolean;
}
export declare class CheckoutPreviewBranchDto {
    branchId: string;
    merchantId: string;
    merchantUserId: string;
    merchantName: string;
    merchantStatus: string;
    branchName: string;
    township: string;
    branchStatus: string;
}
export declare class CheckoutPreviewPricingDto {
    currencyCode: string;
    subtotalAmount: string;
    discountAmount: string;
    deliveryFee: string;
    totalAmount: string;
}
export declare class CheckoutPreviewDto {
    currencyCode: string;
    customer: CheckoutPreviewCustomerDto;
    address: CheckoutPreviewAddressDto;
    branch: CheckoutPreviewBranchDto;
    cart: CartDto;
    pricing: CheckoutPreviewPricingDto;
}
export declare function toCheckoutPreviewDto(preview: CheckoutPreviewEntity): CheckoutPreviewDto;

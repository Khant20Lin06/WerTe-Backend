import { BranchStatus, MerchantStatus, UserRole, UserStatus } from '@prisma/client';
import { AddressOwnershipRecord } from '../../addresses/entities/address-ownership.entity';
import { CartAggregateEntity } from '../../carts/entities/cart-aggregate.entity';
import { BranchOwnershipRecord } from '../../branches/entities/branch-ownership.entity';
import { CustomerProfileOwnershipRecord } from '../../customer-profiles/entities/customer-profile-ownership.entity';
export declare class CheckoutContextCustomerEntity {
    customerProfileId: string;
    userId: string;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    fullName?: string | null;
    avatarUrl?: string | null;
}
export declare class CheckoutContextAddressEntity {
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
export declare class CheckoutContextBranchEntity {
    branchId: string;
    merchantId: string;
    merchantUserId: string;
    merchantName: string;
    merchantStatus: MerchantStatus;
    branchName: string;
    township: string;
    branchStatus: BranchStatus;
}
export declare class CheckoutContextEntity {
    currencyCode: string;
    customer: CheckoutContextCustomerEntity;
    address: CheckoutContextAddressEntity;
    branch: CheckoutContextBranchEntity;
    cart: CartAggregateEntity;
}
type BuildCheckoutContextInput = {
    currencyCode?: string;
    customerProfile: CustomerProfileOwnershipRecord;
    address: AddressOwnershipRecord;
    branch: BranchOwnershipRecord;
    cart: CartAggregateEntity;
};
export declare function buildCheckoutContext(input: BuildCheckoutContextInput): CheckoutContextEntity;
export {};

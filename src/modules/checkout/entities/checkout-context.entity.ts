import {
  BranchStatus,
  MerchantStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { AddressOwnershipRecord } from '../../addresses/entities/address-ownership.entity';
import { CartAggregateEntity } from '../../carts/entities/cart-aggregate.entity';
import { BranchOwnershipRecord } from '../../branches/entities/branch-ownership.entity';
import { CustomerProfileOwnershipRecord } from '../../customer-profiles/entities/customer-profile-ownership.entity';

export class CheckoutContextCustomerEntity {
  customerProfileId!: string;
  userId!: string;
  phone!: string;
  role!: UserRole;
  userStatus!: UserStatus;
  fullName?: string | null;
  avatarUrl?: string | null;
}

export class CheckoutContextAddressEntity {
  addressId!: string;
  label!: string;
  line1!: string;
  line2?: string | null;
  landmark?: string | null;
  township!: string;
  city?: string | null;
  postalCode?: string | null;
  deliveryInstructions?: string | null;
  latitude!: string;
  longitude!: string;
  isDefault!: boolean;
}

export class CheckoutContextBranchEntity {
  branchId!: string;
  merchantId!: string;
  merchantUserId!: string;
  merchantName!: string;
  merchantStatus!: MerchantStatus;
  branchName!: string;
  township!: string;
  branchStatus!: BranchStatus;
}

export class CheckoutContextEntity {
  currencyCode!: string;
  customer!: CheckoutContextCustomerEntity;
  address!: CheckoutContextAddressEntity;
  branch!: CheckoutContextBranchEntity;
  cart!: CartAggregateEntity;
}

type BuildCheckoutContextInput = {
  currencyCode?: string;
  customerProfile: CustomerProfileOwnershipRecord;
  address: AddressOwnershipRecord;
  branch: BranchOwnershipRecord;
  cart: CartAggregateEntity;
};

export function buildCheckoutContext(
  input: BuildCheckoutContextInput,
): CheckoutContextEntity {
  return {
    currencyCode: input.currencyCode ?? 'MMK',
    customer: {
      customerProfileId: input.customerProfile.id,
      userId: input.customerProfile.user.id,
      phone: input.customerProfile.user.phone,
      role: input.customerProfile.user.role,
      userStatus: input.customerProfile.user.status,
      fullName: input.customerProfile.fullName,
      avatarUrl: input.customerProfile.avatarUrl,
    },
    address: {
      addressId: input.address.id,
      label: input.address.label,
      line1: input.address.line1,
      line2: input.address.line2,
      landmark: input.address.landmark,
      township: input.address.township,
      city: input.address.city,
      postalCode: input.address.postalCode,
      deliveryInstructions: input.address.deliveryInstructions,
      latitude: input.address.latitude.toString(),
      longitude: input.address.longitude.toString(),
      isDefault: input.address.isDefault,
    },
    branch: {
      branchId: input.branch.id,
      merchantId: input.branch.merchant.id,
      merchantUserId: input.branch.merchant.user.id,
      merchantName: input.branch.merchant.name,
      merchantStatus: input.branch.merchant.status,
      branchName: input.branch.name,
      township: input.branch.township,
      branchStatus: input.branch.status,
    },
    cart: input.cart,
  };
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CartDto, toCartDto } from '../../carts/dto/cart.dto';
import { CheckoutPreviewEntity } from '../entities/checkout-preview.entity';
import {
  AppliedPromotionDto,
  toAppliedPromotionDto,
} from '../../promotions/dto/applied-promotion.dto';

export class CheckoutPreviewCustomerDto {
  @ApiProperty({
    description: 'Customer profile identifier.',
    example: 'cust_prof_1',
  })
  customerProfileId!: string;

  @ApiProperty({
    description: 'Authenticated user identifier.',
    example: 'usr_1',
  })
  userId!: string;

  @ApiProperty({
    description: 'Customer phone number.',
    example: '09123456789',
  })
  phone!: string;

  @ApiProperty({
    description: 'Customer role.',
    example: 'CUSTOMER',
  })
  role!: string;

  @ApiProperty({
    description: 'Customer account status.',
    example: 'ACTIVE',
  })
  userStatus!: string;

  @ApiPropertyOptional({
    description: 'Optional customer display name.',
    example: 'Mg Mg',
  })
  fullName?: string | null;

  @ApiPropertyOptional({
    description: 'Optional customer avatar URL.',
    example: 'https://cdn.example.com/customer/avatar.png',
  })
  avatarUrl?: string | null;
}

export class CheckoutPreviewAddressDto {
  @ApiProperty({
    description: 'Delivery address identifier.',
    example: 'addr_1',
  })
  addressId!: string;

  @ApiProperty({
    description: 'Address label.',
    example: 'Home',
  })
  label!: string;

  @ApiProperty({
    description: 'Primary address line.',
    example: 'No. 1, Main Road',
  })
  line1!: string;

  @ApiPropertyOptional({
    description: 'Secondary address line.',
    example: 'Apartment 5B',
  })
  line2?: string | null;

  @ApiPropertyOptional({
    description: 'Nearby landmark.',
    example: 'Near City Mart',
  })
  landmark?: string | null;

  @ApiProperty({
    description: 'Township for delivery routing.',
    example: 'Botahtaung',
  })
  township!: string;

  @ApiPropertyOptional({
    description: 'City name.',
    example: 'Yangon',
  })
  city?: string | null;

  @ApiPropertyOptional({
    description: 'Postal code.',
    example: '11071',
  })
  postalCode?: string | null;

  @ApiPropertyOptional({
    description: 'Additional delivery instructions.',
    example: 'Call before arrival',
  })
  deliveryInstructions?: string | null;

  @ApiProperty({
    description: 'Latitude serialized as a string.',
    example: '16.834',
  })
  latitude!: string;

  @ApiProperty({
    description: 'Longitude serialized as a string.',
    example: '96.176',
  })
  longitude!: string;

  @ApiProperty({
    description: 'Whether this address is the default address.',
    example: true,
  })
  isDefault!: boolean;
}

export class CheckoutPreviewBranchDto {
  @ApiProperty({
    description: 'Branch identifier.',
    example: 'branch_1',
  })
  branchId!: string;

  @ApiProperty({
    description: 'Merchant identifier.',
    example: 'merchant_1',
  })
  merchantId!: string;

  @ApiProperty({
    description: 'Merchant user identifier.',
    example: 'usr_merchant_1',
  })
  merchantUserId!: string;

  @ApiProperty({
    description: 'Merchant display name.',
    example: 'Merchant One',
  })
  merchantName!: string;

  @ApiProperty({
    description: 'Merchant operational status.',
    example: 'ACTIVE',
  })
  merchantStatus!: string;

  @ApiProperty({
    description: 'Branch display name.',
    example: 'Downtown Branch',
  })
  branchName!: string;

  @ApiProperty({
    description: 'Branch township.',
    example: 'Botahtaung',
  })
  township!: string;

  @ApiProperty({
    description: 'Branch operational status.',
    example: 'ACTIVE',
  })
  branchStatus!: string;
}

export class CheckoutPreviewPricingDto {
  @ApiProperty({
    description: 'Currency code for the checkout preview.',
    example: 'MMK',
  })
  currencyCode!: string;

  @ApiProperty({
    description: 'Subtotal amount serialized as a string.',
    example: '6500',
  })
  subtotalAmount!: string;

  @ApiProperty({
    description: 'Discount amount serialized as a string.',
    example: '0',
  })
  discountAmount!: string;

  @ApiProperty({
    description: 'Delivery fee serialized as a string.',
    example: '0',
  })
  deliveryFee!: string;

  @ApiProperty({
    description: 'Final total amount serialized as a string.',
    example: '6500',
  })
  totalAmount!: string;

  @ApiPropertyOptional({
    description: 'Applied promotion summary when a valid promotion code affects pricing.',
    type: () => AppliedPromotionDto,
  })
  appliedPromotion?: AppliedPromotionDto | null;
}

export class CheckoutPreviewDto {
  @ApiProperty({
    description: 'Currency code for the checkout preview.',
    example: 'MMK',
  })
  currencyCode!: string;

  @ApiProperty({
    description: 'Customer context resolved for the checkout preview.',
    type: () => CheckoutPreviewCustomerDto,
  })
  customer!: CheckoutPreviewCustomerDto;

  @ApiProperty({
    description: 'Delivery address used for the checkout preview.',
    type: () => CheckoutPreviewAddressDto,
  })
  address!: CheckoutPreviewAddressDto;

  @ApiProperty({
    description: 'Branch context used for the checkout preview.',
    type: () => CheckoutPreviewBranchDto,
  })
  branch!: CheckoutPreviewBranchDto;

  @ApiProperty({
    description: 'Resolved active cart aggregate used for the checkout preview.',
    type: () => CartDto,
  })
  cart!: CartDto;

  @ApiProperty({
    description: 'Pricing breakdown for the checkout preview.',
    type: () => CheckoutPreviewPricingDto,
  })
  pricing!: CheckoutPreviewPricingDto;
}

export function toCheckoutPreviewDto(
  preview: CheckoutPreviewEntity,
): CheckoutPreviewDto {
  return {
    currencyCode: preview.currencyCode,
    customer: {
      customerProfileId: preview.customer.customerProfileId,
      userId: preview.customer.userId,
      phone: preview.customer.phone,
      role: preview.customer.role,
      userStatus: preview.customer.userStatus,
      fullName: preview.customer.fullName,
      avatarUrl: preview.customer.avatarUrl,
    },
    address: {
      addressId: preview.address.addressId,
      label: preview.address.label,
      line1: preview.address.line1,
      line2: preview.address.line2,
      landmark: preview.address.landmark,
      township: preview.address.township,
      city: preview.address.city,
      postalCode: preview.address.postalCode,
      deliveryInstructions: preview.address.deliveryInstructions,
      latitude: preview.address.latitude,
      longitude: preview.address.longitude,
      isDefault: preview.address.isDefault,
    },
    branch: {
      branchId: preview.branch.branchId,
      merchantId: preview.branch.merchantId,
      merchantUserId: preview.branch.merchantUserId,
      merchantName: preview.branch.merchantName,
      merchantStatus: preview.branch.merchantStatus,
      branchName: preview.branch.branchName,
      township: preview.branch.township,
      branchStatus: preview.branch.branchStatus,
    },
    cart: toCartDto(preview.cart),
    pricing: {
      currencyCode: preview.pricing.currencyCode,
      subtotalAmount: preview.pricing.subtotalAmount,
      discountAmount: preview.pricing.discountAmount,
      deliveryFee: preview.pricing.deliveryFee,
      totalAmount: preview.pricing.totalAmount,
      appliedPromotion: toAppliedPromotionDto(preview.pricing.appliedPromotion),
    },
  };
}

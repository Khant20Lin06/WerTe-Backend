import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  AppliedPromotionDto,
  toAppliedPromotionDto,
} from '../../promotions/dto/applied-promotion.dto';
import { OrderSummaryDeliveryEntity, OrderSummaryEntity, OrderSummaryItemEntity } from '../entities/order-summary.entity';

class OrderSummaryItemDto {
  @ApiProperty({ example: 'item_1' })
  orderItemId!: string;

  @ApiProperty({ example: 'Mohinga' })
  name!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: '3000' })
  unitPrice!: string;
}

function toOrderSummaryItemDto(item: OrderSummaryItemEntity): OrderSummaryItemDto {
  return {
    orderItemId: item.orderItemId,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  };
}

class OrderSummaryCustomerDto {
  @ApiProperty({ example: 'cust_prof_1' })
  customerProfileId!: string;

  @ApiProperty({ example: 'usr_1' })
  userId!: string;

  @ApiProperty({ example: '09123456789' })
  phone!: string;

  @ApiProperty({ example: 'ACTIVE' })
  userStatus!: string;

  @ApiPropertyOptional({ example: 'Mg Mg' })
  fullName!: string | null;

  @ApiPropertyOptional({ example: null })
  avatarUrl!: string | null;
}

class OrderSummaryBranchDto {
  @ApiProperty({ example: 'branch_1' })
  branchId!: string;

  @ApiProperty({ example: 'Downtown Branch' })
  branchName!: string;

  @ApiProperty({ example: 'ACTIVE' })
  branchStatus!: string;

  @ApiProperty({ example: 'Botahtaung' })
  township!: string;

  @ApiProperty({ example: 'merchant_1' })
  merchantId!: string;

  @ApiProperty({ example: 'usr_merchant_1' })
  merchantUserId!: string;

  @ApiProperty({ example: 'Merchant One' })
  merchantName!: string;

  @ApiProperty({ example: 'ACTIVE' })
  merchantStatus!: string;
}

class OrderSummaryRiderDto {
  @ApiProperty({ example: 'rider_1' })
  riderId!: string;

  @ApiProperty({ example: 'usr_rider_1' })
  userId!: string;

  @ApiProperty({ example: '0999999999' })
  phone!: string;

  @ApiProperty({ example: 'ACTIVE' })
  userStatus!: string;

  @ApiProperty({ example: 'Ko Aung' })
  displayName!: string;

  @ApiProperty({ example: 'bike' })
  vehicleType!: string;

  @ApiPropertyOptional({ example: 'Pabedan' })
  currentTownship!: string | null;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;
}

class OrderSummaryDeliveryDto {
  @ApiProperty({ example: 'delivery_1' })
  deliveryId!: string;

  @ApiPropertyOptional({ example: 'rider_1' })
  riderId!: string | null;

  @ApiPropertyOptional({ example: 15 })
  etaMinutes!: number | null;

  @ApiPropertyOptional({ type: () => OrderSummaryRiderDto })
  rider!: OrderSummaryRiderDto | null;
}

function toOrderSummaryDeliveryDto(
  delivery: OrderSummaryDeliveryEntity | null,
): OrderSummaryDeliveryDto | null {
  if (delivery === null) {
    return null;
  }

  return {
    deliveryId: delivery.deliveryId,
    riderId: delivery.riderId,
    etaMinutes: delivery.etaMinutes,
    rider:
      delivery.rider === null
        ? null
        : {
            riderId: delivery.rider.riderId,
            userId: delivery.rider.userId,
            phone: delivery.rider.phone,
            userStatus: delivery.rider.userStatus,
            displayName: delivery.rider.displayName,
            vehicleType: delivery.rider.vehicleType,
            currentTownship: delivery.rider.currentTownship,
            status: delivery.rider.status,
          },
  };
}

export class OrderSummaryDto {
  @ApiProperty({ example: 'order_1' })
  orderId!: string;

  @ApiProperty({ example: 'ORD-00000001' })
  orderCode!: string;

  @ApiProperty({ example: 'cust_prof_1' })
  customerProfileId!: string;

  @ApiProperty({ example: 'branch_1' })
  branchId!: string;

  @ApiPropertyOptional({ example: 'addr_1' })
  addressId!: string | null;

  @ApiPropertyOptional({ example: 'cart_1' })
  cartId!: string | null;

  @ApiProperty({ example: 'PLACED' })
  status!: string;

  @ApiProperty({ example: 'MMK' })
  currencyCode!: string;

  @ApiPropertyOptional({ type: () => AppliedPromotionDto })
  appliedPromotion?: AppliedPromotionDto | null;

  @ApiProperty({ example: '6500' })
  subtotalAmount!: string;

  @ApiProperty({ example: '0' })
  discountAmount!: string;

  @ApiProperty({ example: '500' })
  deliveryFee!: string;

  @ApiProperty({ example: '7000' })
  totalAmount!: string;

  @ApiProperty({ example: '2026-04-19T10:00:00.000Z' })
  placedAt!: string;

  @ApiProperty({ example: '2026-04-19T10:05:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ type: () => String, isArray: true, example: ['cancel'] })
  availableActions!: string[];

  @ApiPropertyOptional({ type: () => OrderSummaryItemDto, isArray: true })
  summaryItems?: OrderSummaryItemDto[];

  @ApiProperty({ type: () => OrderSummaryCustomerDto })
  customer!: OrderSummaryCustomerDto;

  @ApiProperty({ type: () => OrderSummaryBranchDto })
  branch!: OrderSummaryBranchDto;

  @ApiPropertyOptional({ type: () => OrderSummaryDeliveryDto })
  delivery!: OrderSummaryDeliveryDto | null;
}

export function toOrderSummaryDto(order: OrderSummaryEntity): OrderSummaryDto {
  return {
    orderId: order.orderId,
    orderCode: order.orderCode,
    customerProfileId: order.customerProfileId,
    branchId: order.branchId,
    addressId: order.addressId,
    cartId: order.cartId,
    status: order.status,
    currencyCode: order.currencyCode,
    appliedPromotion: toAppliedPromotionDto(order.appliedPromotion),
    subtotalAmount: order.subtotalAmount,
    discountAmount: order.discountAmount,
    deliveryFee: order.deliveryFee,
    totalAmount: order.totalAmount,
    placedAt: order.placedAt,
    updatedAt: order.updatedAt,
    availableActions: order.availableActions,
    customer: {
      customerProfileId: order.customer.customerProfileId,
      userId: order.customer.userId,
      phone: order.customer.phone,
      userStatus: order.customer.userStatus,
      fullName: order.customer.fullName,
      avatarUrl: order.customer.avatarUrl,
    },
    branch: {
      branchId: order.branch.branchId,
      branchName: order.branch.branchName,
      branchStatus: order.branch.branchStatus,
      township: order.branch.township,
      merchantId: order.branch.merchantId,
      merchantUserId: order.branch.merchantUserId,
      merchantName: order.branch.merchantName,
      merchantStatus: order.branch.merchantStatus,
    },
    summaryItems: (order.summaryItems ?? []).map(toOrderSummaryItemDto),
    delivery: toOrderSummaryDeliveryDto(order.delivery),
  };
}

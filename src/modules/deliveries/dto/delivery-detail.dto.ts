import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  DeliveryDetailEntity,
  DeliveryDetailOrderAddressEntity,
  DeliveryDetailOrderBranchEntity,
  DeliveryDetailOrderCustomerEntity,
  DeliveryDetailOrderEntity,
  DeliveryDetailRiderAvailabilityEntity,
  DeliveryDetailRiderEntity,
  DeliveryDetailRiderLocationEntity,
} from '../entities/delivery-detail.entity';

class DeliveryDetailOrderCustomerDto {
  @ApiProperty({ example: 'cust_prof_1' })
  customerProfileId!: string;

  @ApiProperty({ example: 'usr_customer_1' })
  userId!: string;

  @ApiProperty({ example: '09123456789' })
  phone!: string;

  @ApiProperty({ example: 'ACTIVE' })
  userStatus!: string;

  @ApiPropertyOptional({ example: 'Mg Mg' })
  fullName!: string | null;
}

class DeliveryDetailOrderBranchDto {
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

class DeliveryDetailOrderAddressDto {
  @ApiPropertyOptional({ example: 'Home' })
  label!: string | null;

  @ApiPropertyOptional({ example: 'No. 1, Main Road' })
  line1!: string | null;

  @ApiPropertyOptional({ example: 'Room 5B' })
  line2!: string | null;

  @ApiPropertyOptional({ example: 'Near City Mart' })
  landmark!: string | null;

  @ApiPropertyOptional({ example: 'Botahtaung' })
  township!: string | null;

  @ApiPropertyOptional({ example: 'Yangon' })
  city!: string | null;

  @ApiPropertyOptional({ example: '11111' })
  postalCode!: string | null;

  @ApiPropertyOptional({ example: 'Call before arrival' })
  deliveryInstructions!: string | null;

  @ApiPropertyOptional({ example: '16.834' })
  latitude!: string | null;

  @ApiPropertyOptional({ example: '96.176' })
  longitude!: string | null;
}

class DeliveryDetailOrderDto {
  @ApiProperty({ example: 'order_1' })
  orderId!: string;

  @ApiProperty({ example: 'ORD-00000001' })
  orderCode!: string;

  @ApiProperty({ example: 'RIDER_ASSIGNED' })
  orderStatus!: string;

  @ApiProperty({ example: 'MMK' })
  currencyCode!: string;

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

  @ApiProperty({ type: () => DeliveryDetailOrderCustomerDto })
  customer!: DeliveryDetailOrderCustomerDto;

  @ApiProperty({ type: () => DeliveryDetailOrderBranchDto })
  branch!: DeliveryDetailOrderBranchDto;

  @ApiProperty({ type: () => DeliveryDetailOrderAddressDto })
  deliveryAddress!: DeliveryDetailOrderAddressDto;
}

class DeliveryDetailRiderAvailabilityDto {
  @ApiProperty({ example: true })
  isOnline!: boolean;

  @ApiProperty({ example: true })
  isAvailable!: boolean;

  @ApiProperty({ example: '2026-04-19T10:05:00.000Z' })
  lastStatusChangedAt!: string;

  @ApiProperty({ example: '2026-04-19T10:05:00.000Z' })
  updatedAt!: string;
}

class DeliveryDetailRiderLocationDto {
  @ApiProperty({ example: '16.834' })
  latitude!: string;

  @ApiProperty({ example: '96.176' })
  longitude!: string;

  @ApiPropertyOptional({ example: '90' })
  heading!: string | null;

  @ApiPropertyOptional({ example: '14.5' })
  speed!: string | null;

  @ApiPropertyOptional({ example: '5.2' })
  accuracyMeters!: string | null;

  @ApiProperty({ example: '2026-04-19T10:12:00.000Z' })
  recordedAt!: string;

  @ApiPropertyOptional({ example: 'delivery_1' })
  deliveryId!: string | null;
}

class DeliveryDetailRiderDto {
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

  @ApiPropertyOptional({ type: () => DeliveryDetailRiderAvailabilityDto })
  availability!: DeliveryDetailRiderAvailabilityDto | null;

  @ApiPropertyOptional({ type: () => DeliveryDetailRiderLocationDto })
  currentLocation!: DeliveryDetailRiderLocationDto | null;
}

function toOrderCustomerDto(
  customer: DeliveryDetailOrderCustomerEntity,
): DeliveryDetailOrderCustomerDto {
  return {
    customerProfileId: customer.customerProfileId,
    userId: customer.userId,
    phone: customer.phone,
    userStatus: customer.userStatus,
    fullName: customer.fullName,
  };
}

function toOrderBranchDto(
  branch: DeliveryDetailOrderBranchEntity,
): DeliveryDetailOrderBranchDto {
  return {
    branchId: branch.branchId,
    branchName: branch.branchName,
    branchStatus: branch.branchStatus,
    township: branch.township,
    merchantId: branch.merchantId,
    merchantUserId: branch.merchantUserId,
    merchantName: branch.merchantName,
    merchantStatus: branch.merchantStatus,
  };
}

function toOrderAddressDto(
  address: DeliveryDetailOrderAddressEntity,
): DeliveryDetailOrderAddressDto {
  return {
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    landmark: address.landmark,
    township: address.township,
    city: address.city,
    postalCode: address.postalCode,
    deliveryInstructions: address.deliveryInstructions,
    latitude: address.latitude,
    longitude: address.longitude,
  };
}

function toOrderDto(order: DeliveryDetailOrderEntity): DeliveryDetailOrderDto {
  return {
    orderId: order.orderId,
    orderCode: order.orderCode,
    orderStatus: order.orderStatus,
    currencyCode: order.currencyCode,
    subtotalAmount: order.subtotalAmount,
    discountAmount: order.discountAmount,
    deliveryFee: order.deliveryFee,
    totalAmount: order.totalAmount,
    placedAt: order.placedAt,
    updatedAt: order.updatedAt,
    customer: toOrderCustomerDto(order.customer),
    branch: toOrderBranchDto(order.branch),
    deliveryAddress: toOrderAddressDto(order.deliveryAddress),
  };
}

function toRiderAvailabilityDto(
  availability: DeliveryDetailRiderAvailabilityEntity | null,
): DeliveryDetailRiderAvailabilityDto | null {
  if (availability === null) {
    return null;
  }

  return {
    isOnline: availability.isOnline,
    isAvailable: availability.isAvailable,
    lastStatusChangedAt: availability.lastStatusChangedAt,
    updatedAt: availability.updatedAt,
  };
}

function toRiderLocationDto(
  location: DeliveryDetailRiderLocationEntity | null,
): DeliveryDetailRiderLocationDto | null {
  if (location === null) {
    return null;
  }

  return {
    latitude: location.latitude,
    longitude: location.longitude,
    heading: location.heading,
    speed: location.speed,
    accuracyMeters: location.accuracyMeters,
    recordedAt: location.recordedAt,
    deliveryId: location.deliveryId,
  };
}

function toRiderDto(rider: DeliveryDetailRiderEntity | null): DeliveryDetailRiderDto | null {
  if (rider === null) {
    return null;
  }

  return {
    riderId: rider.riderId,
    userId: rider.userId,
    phone: rider.phone,
    userStatus: rider.userStatus,
    displayName: rider.displayName,
    vehicleType: rider.vehicleType,
    currentTownship: rider.currentTownship,
    status: rider.status,
    availability: toRiderAvailabilityDto(rider.availability),
    currentLocation: toRiderLocationDto(rider.currentLocation),
  };
}

export class DeliveryDetailDto {
  @ApiProperty({ example: 'delivery_1' })
  deliveryId!: string;

  @ApiProperty({ example: 'order_1' })
  orderId!: string;

  @ApiPropertyOptional({ example: 'rider_1' })
  riderId!: string | null;

  @ApiProperty({ example: 'ASSIGNED' })
  status!: string;

  @ApiPropertyOptional({ example: 18 })
  etaMinutes!: number | null;

  @ApiPropertyOptional({ example: '2026-04-19T10:10:00.000Z' })
  assignedAt!: string | null;

  @ApiPropertyOptional({ example: '2026-04-19T10:12:00.000Z' })
  acceptedAt!: string | null;

  @ApiPropertyOptional({ example: '2026-04-19T10:20:00.000Z' })
  pickedUpAt!: string | null;

  @ApiPropertyOptional({ example: '2026-04-19T10:25:00.000Z' })
  onTheWayAt!: string | null;

  @ApiPropertyOptional({ example: '2026-04-19T10:40:00.000Z' })
  deliveredAt!: string | null;

  @ApiPropertyOptional({ example: null })
  failedAt!: string | null;

  @ApiPropertyOptional({ example: null })
  cancelledAt!: string | null;

  @ApiPropertyOptional({ example: null })
  failureReasonCode!: string | null;

  @ApiPropertyOptional({ example: null })
  failureNote!: string | null;

  @ApiProperty({ example: '2026-04-19T10:10:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-04-19T10:10:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ type: () => DeliveryDetailOrderDto })
  order!: DeliveryDetailOrderDto;

  @ApiPropertyOptional({ type: () => DeliveryDetailRiderDto })
  rider!: DeliveryDetailRiderDto | null;
}

export function toDeliveryDetailDto(
  delivery: DeliveryDetailEntity,
): DeliveryDetailDto {
  return {
    deliveryId: delivery.deliveryId,
    orderId: delivery.orderId,
    riderId: delivery.riderId,
    status: delivery.status,
    etaMinutes: delivery.etaMinutes,
    assignedAt: delivery.assignedAt,
    acceptedAt: delivery.acceptedAt,
    pickedUpAt: delivery.pickedUpAt,
    onTheWayAt: delivery.onTheWayAt,
    deliveredAt: delivery.deliveredAt,
    failedAt: delivery.failedAt,
    cancelledAt: delivery.cancelledAt,
    failureReasonCode: delivery.failureReasonCode,
    failureNote: delivery.failureNote,
    createdAt: delivery.createdAt,
    updatedAt: delivery.updatedAt,
    order: toOrderDto(delivery.order),
    rider: toRiderDto(delivery.rider),
  };
}

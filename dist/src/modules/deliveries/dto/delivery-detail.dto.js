"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryDetailDto = void 0;
exports.toDeliveryDetailDto = toDeliveryDetailDto;
const swagger_1 = require("@nestjs/swagger");
class DeliveryDetailOrderCustomerDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cust_prof_1' }),
    __metadata("design:type", String)
], DeliveryDetailOrderCustomerDto.prototype, "customerProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usr_customer_1' }),
    __metadata("design:type", String)
], DeliveryDetailOrderCustomerDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09123456789' }),
    __metadata("design:type", String)
], DeliveryDetailOrderCustomerDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVE' }),
    __metadata("design:type", String)
], DeliveryDetailOrderCustomerDto.prototype, "userStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mg Mg' }),
    __metadata("design:type", Object)
], DeliveryDetailOrderCustomerDto.prototype, "fullName", void 0);
class DeliveryDetailOrderBranchDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'branch_1' }),
    __metadata("design:type", String)
], DeliveryDetailOrderBranchDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Downtown Branch' }),
    __metadata("design:type", String)
], DeliveryDetailOrderBranchDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVE' }),
    __metadata("design:type", String)
], DeliveryDetailOrderBranchDto.prototype, "branchStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Botahtaung' }),
    __metadata("design:type", String)
], DeliveryDetailOrderBranchDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'merchant_1' }),
    __metadata("design:type", String)
], DeliveryDetailOrderBranchDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usr_merchant_1' }),
    __metadata("design:type", String)
], DeliveryDetailOrderBranchDto.prototype, "merchantUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Merchant One' }),
    __metadata("design:type", String)
], DeliveryDetailOrderBranchDto.prototype, "merchantName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVE' }),
    __metadata("design:type", String)
], DeliveryDetailOrderBranchDto.prototype, "merchantStatus", void 0);
class DeliveryDetailOrderAddressDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Home' }),
    __metadata("design:type", Object)
], DeliveryDetailOrderAddressDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'No. 1, Main Road' }),
    __metadata("design:type", Object)
], DeliveryDetailOrderAddressDto.prototype, "line1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Room 5B' }),
    __metadata("design:type", Object)
], DeliveryDetailOrderAddressDto.prototype, "line2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Near City Mart' }),
    __metadata("design:type", Object)
], DeliveryDetailOrderAddressDto.prototype, "landmark", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Botahtaung' }),
    __metadata("design:type", Object)
], DeliveryDetailOrderAddressDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Yangon' }),
    __metadata("design:type", Object)
], DeliveryDetailOrderAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '11111' }),
    __metadata("design:type", Object)
], DeliveryDetailOrderAddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Call before arrival' }),
    __metadata("design:type", Object)
], DeliveryDetailOrderAddressDto.prototype, "deliveryInstructions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '16.834' }),
    __metadata("design:type", Object)
], DeliveryDetailOrderAddressDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '96.176' }),
    __metadata("design:type", Object)
], DeliveryDetailOrderAddressDto.prototype, "longitude", void 0);
class DeliveryDetailOrderDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order_1' }),
    __metadata("design:type", String)
], DeliveryDetailOrderDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ORD-00000001' }),
    __metadata("design:type", String)
], DeliveryDetailOrderDto.prototype, "orderCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'RIDER_ASSIGNED' }),
    __metadata("design:type", String)
], DeliveryDetailOrderDto.prototype, "orderStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MMK' }),
    __metadata("design:type", String)
], DeliveryDetailOrderDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6500' }),
    __metadata("design:type", String)
], DeliveryDetailOrderDto.prototype, "subtotalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0' }),
    __metadata("design:type", String)
], DeliveryDetailOrderDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '500' }),
    __metadata("design:type", String)
], DeliveryDetailOrderDto.prototype, "deliveryFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '7000' }),
    __metadata("design:type", String)
], DeliveryDetailOrderDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-19T10:00:00.000Z' }),
    __metadata("design:type", String)
], DeliveryDetailOrderDto.prototype, "placedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-19T10:05:00.000Z' }),
    __metadata("design:type", String)
], DeliveryDetailOrderDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => DeliveryDetailOrderCustomerDto }),
    __metadata("design:type", DeliveryDetailOrderCustomerDto)
], DeliveryDetailOrderDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => DeliveryDetailOrderBranchDto }),
    __metadata("design:type", DeliveryDetailOrderBranchDto)
], DeliveryDetailOrderDto.prototype, "branch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => DeliveryDetailOrderAddressDto }),
    __metadata("design:type", DeliveryDetailOrderAddressDto)
], DeliveryDetailOrderDto.prototype, "deliveryAddress", void 0);
class DeliveryDetailRiderAvailabilityDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], DeliveryDetailRiderAvailabilityDto.prototype, "isOnline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], DeliveryDetailRiderAvailabilityDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-19T10:05:00.000Z' }),
    __metadata("design:type", String)
], DeliveryDetailRiderAvailabilityDto.prototype, "lastStatusChangedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-19T10:05:00.000Z' }),
    __metadata("design:type", String)
], DeliveryDetailRiderAvailabilityDto.prototype, "updatedAt", void 0);
class DeliveryDetailRiderLocationDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '16.834' }),
    __metadata("design:type", String)
], DeliveryDetailRiderLocationDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '96.176' }),
    __metadata("design:type", String)
], DeliveryDetailRiderLocationDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '90' }),
    __metadata("design:type", Object)
], DeliveryDetailRiderLocationDto.prototype, "heading", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '14.5' }),
    __metadata("design:type", Object)
], DeliveryDetailRiderLocationDto.prototype, "speed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '5.2' }),
    __metadata("design:type", Object)
], DeliveryDetailRiderLocationDto.prototype, "accuracyMeters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-19T10:12:00.000Z' }),
    __metadata("design:type", String)
], DeliveryDetailRiderLocationDto.prototype, "recordedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'delivery_1' }),
    __metadata("design:type", Object)
], DeliveryDetailRiderLocationDto.prototype, "deliveryId", void 0);
class DeliveryDetailRiderDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'rider_1' }),
    __metadata("design:type", String)
], DeliveryDetailRiderDto.prototype, "riderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usr_rider_1' }),
    __metadata("design:type", String)
], DeliveryDetailRiderDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0999999999' }),
    __metadata("design:type", String)
], DeliveryDetailRiderDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVE' }),
    __metadata("design:type", String)
], DeliveryDetailRiderDto.prototype, "userStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ko Aung' }),
    __metadata("design:type", String)
], DeliveryDetailRiderDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'bike' }),
    __metadata("design:type", String)
], DeliveryDetailRiderDto.prototype, "vehicleType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Pabedan' }),
    __metadata("design:type", Object)
], DeliveryDetailRiderDto.prototype, "currentTownship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVE' }),
    __metadata("design:type", String)
], DeliveryDetailRiderDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => DeliveryDetailRiderAvailabilityDto }),
    __metadata("design:type", Object)
], DeliveryDetailRiderDto.prototype, "availability", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => DeliveryDetailRiderLocationDto }),
    __metadata("design:type", Object)
], DeliveryDetailRiderDto.prototype, "currentLocation", void 0);
function toOrderCustomerDto(customer) {
    return {
        customerProfileId: customer.customerProfileId,
        userId: customer.userId,
        phone: customer.phone,
        userStatus: customer.userStatus,
        fullName: customer.fullName,
    };
}
function toOrderBranchDto(branch) {
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
function toOrderAddressDto(address) {
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
function toOrderDto(order) {
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
function toRiderAvailabilityDto(availability) {
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
function toRiderLocationDto(location) {
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
function toRiderDto(rider) {
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
class DeliveryDetailDto {
}
exports.DeliveryDetailDto = DeliveryDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'delivery_1' }),
    __metadata("design:type", String)
], DeliveryDetailDto.prototype, "deliveryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order_1' }),
    __metadata("design:type", String)
], DeliveryDetailDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'rider_1' }),
    __metadata("design:type", Object)
], DeliveryDetailDto.prototype, "riderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ASSIGNED' }),
    __metadata("design:type", String)
], DeliveryDetailDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 18 }),
    __metadata("design:type", Object)
], DeliveryDetailDto.prototype, "etaMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-04-19T10:10:00.000Z' }),
    __metadata("design:type", Object)
], DeliveryDetailDto.prototype, "assignedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-04-19T10:12:00.000Z' }),
    __metadata("design:type", Object)
], DeliveryDetailDto.prototype, "acceptedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-04-19T10:20:00.000Z' }),
    __metadata("design:type", Object)
], DeliveryDetailDto.prototype, "pickedUpAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-04-19T10:25:00.000Z' }),
    __metadata("design:type", Object)
], DeliveryDetailDto.prototype, "onTheWayAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-04-19T10:40:00.000Z' }),
    __metadata("design:type", Object)
], DeliveryDetailDto.prototype, "deliveredAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], DeliveryDetailDto.prototype, "failedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], DeliveryDetailDto.prototype, "cancelledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], DeliveryDetailDto.prototype, "failureReasonCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], DeliveryDetailDto.prototype, "failureNote", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-19T10:10:00.000Z' }),
    __metadata("design:type", String)
], DeliveryDetailDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-19T10:10:00.000Z' }),
    __metadata("design:type", String)
], DeliveryDetailDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => DeliveryDetailOrderDto }),
    __metadata("design:type", DeliveryDetailOrderDto)
], DeliveryDetailDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => DeliveryDetailRiderDto }),
    __metadata("design:type", Object)
], DeliveryDetailDto.prototype, "rider", void 0);
function toDeliveryDetailDto(delivery) {
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
//# sourceMappingURL=delivery-detail.dto.js.map
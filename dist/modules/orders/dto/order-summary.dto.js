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
exports.OrderSummaryDto = void 0;
exports.toOrderSummaryDto = toOrderSummaryDto;
const swagger_1 = require("@nestjs/swagger");
class OrderSummaryCustomerDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cust_prof_1' }),
    __metadata("design:type", String)
], OrderSummaryCustomerDto.prototype, "customerProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usr_1' }),
    __metadata("design:type", String)
], OrderSummaryCustomerDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09123456789' }),
    __metadata("design:type", String)
], OrderSummaryCustomerDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVE' }),
    __metadata("design:type", String)
], OrderSummaryCustomerDto.prototype, "userStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mg Mg' }),
    __metadata("design:type", Object)
], OrderSummaryCustomerDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], OrderSummaryCustomerDto.prototype, "avatarUrl", void 0);
class OrderSummaryBranchDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'branch_1' }),
    __metadata("design:type", String)
], OrderSummaryBranchDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Downtown Branch' }),
    __metadata("design:type", String)
], OrderSummaryBranchDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVE' }),
    __metadata("design:type", String)
], OrderSummaryBranchDto.prototype, "branchStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Botahtaung' }),
    __metadata("design:type", String)
], OrderSummaryBranchDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'merchant_1' }),
    __metadata("design:type", String)
], OrderSummaryBranchDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usr_merchant_1' }),
    __metadata("design:type", String)
], OrderSummaryBranchDto.prototype, "merchantUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Merchant One' }),
    __metadata("design:type", String)
], OrderSummaryBranchDto.prototype, "merchantName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVE' }),
    __metadata("design:type", String)
], OrderSummaryBranchDto.prototype, "merchantStatus", void 0);
class OrderSummaryRiderDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'rider_1' }),
    __metadata("design:type", String)
], OrderSummaryRiderDto.prototype, "riderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usr_rider_1' }),
    __metadata("design:type", String)
], OrderSummaryRiderDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0999999999' }),
    __metadata("design:type", String)
], OrderSummaryRiderDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVE' }),
    __metadata("design:type", String)
], OrderSummaryRiderDto.prototype, "userStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ko Aung' }),
    __metadata("design:type", String)
], OrderSummaryRiderDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'bike' }),
    __metadata("design:type", String)
], OrderSummaryRiderDto.prototype, "vehicleType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Pabedan' }),
    __metadata("design:type", Object)
], OrderSummaryRiderDto.prototype, "currentTownship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVE' }),
    __metadata("design:type", String)
], OrderSummaryRiderDto.prototype, "status", void 0);
class OrderSummaryDeliveryDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'delivery_1' }),
    __metadata("design:type", String)
], OrderSummaryDeliveryDto.prototype, "deliveryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'rider_1' }),
    __metadata("design:type", Object)
], OrderSummaryDeliveryDto.prototype, "riderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 15 }),
    __metadata("design:type", Object)
], OrderSummaryDeliveryDto.prototype, "etaMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => OrderSummaryRiderDto }),
    __metadata("design:type", Object)
], OrderSummaryDeliveryDto.prototype, "rider", void 0);
function toOrderSummaryDeliveryDto(delivery) {
    if (delivery === null) {
        return null;
    }
    return {
        deliveryId: delivery.deliveryId,
        riderId: delivery.riderId,
        etaMinutes: delivery.etaMinutes,
        rider: delivery.rider === null
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
class OrderSummaryDto {
}
exports.OrderSummaryDto = OrderSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order_1' }),
    __metadata("design:type", String)
], OrderSummaryDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ORD-00000001' }),
    __metadata("design:type", String)
], OrderSummaryDto.prototype, "orderCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cust_prof_1' }),
    __metadata("design:type", String)
], OrderSummaryDto.prototype, "customerProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'branch_1' }),
    __metadata("design:type", String)
], OrderSummaryDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'addr_1' }),
    __metadata("design:type", Object)
], OrderSummaryDto.prototype, "addressId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'cart_1' }),
    __metadata("design:type", Object)
], OrderSummaryDto.prototype, "cartId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PLACED' }),
    __metadata("design:type", String)
], OrderSummaryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MMK' }),
    __metadata("design:type", String)
], OrderSummaryDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6500' }),
    __metadata("design:type", String)
], OrderSummaryDto.prototype, "subtotalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0' }),
    __metadata("design:type", String)
], OrderSummaryDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '500' }),
    __metadata("design:type", String)
], OrderSummaryDto.prototype, "deliveryFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '7000' }),
    __metadata("design:type", String)
], OrderSummaryDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-19T10:00:00.000Z' }),
    __metadata("design:type", String)
], OrderSummaryDto.prototype, "placedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-19T10:05:00.000Z' }),
    __metadata("design:type", String)
], OrderSummaryDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => String, isArray: true, example: ['cancel'] }),
    __metadata("design:type", Array)
], OrderSummaryDto.prototype, "availableActions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => OrderSummaryCustomerDto }),
    __metadata("design:type", OrderSummaryCustomerDto)
], OrderSummaryDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => OrderSummaryBranchDto }),
    __metadata("design:type", OrderSummaryBranchDto)
], OrderSummaryDto.prototype, "branch", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => OrderSummaryDeliveryDto }),
    __metadata("design:type", Object)
], OrderSummaryDto.prototype, "delivery", void 0);
function toOrderSummaryDto(order) {
    return {
        orderId: order.orderId,
        orderCode: order.orderCode,
        customerProfileId: order.customerProfileId,
        branchId: order.branchId,
        addressId: order.addressId,
        cartId: order.cartId,
        status: order.status,
        currencyCode: order.currencyCode,
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
        delivery: toOrderSummaryDeliveryDto(order.delivery),
    };
}
//# sourceMappingURL=order-summary.dto.js.map
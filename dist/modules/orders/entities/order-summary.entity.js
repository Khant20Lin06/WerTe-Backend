"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSummaryEntity = exports.OrderSummaryDeliveryEntity = exports.OrderSummaryRiderEntity = exports.OrderSummaryBranchEntity = exports.OrderSummaryCustomerEntity = exports.orderSummaryInclude = void 0;
exports.buildOrderSummary = buildOrderSummary;
const client_1 = require("@prisma/client");
exports.orderSummaryInclude = client_1.Prisma.validator()({
    customerProfile: {
        select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            user: {
                select: {
                    id: true,
                    phone: true,
                    status: true,
                },
            },
        },
    },
    branch: {
        select: {
            id: true,
            name: true,
            status: true,
            township: true,
            merchant: {
                select: {
                    id: true,
                    userId: true,
                    name: true,
                    status: true,
                },
            },
        },
    },
    delivery: {
        select: {
            id: true,
            riderId: true,
            etaMinutes: true,
            rider: {
                select: {
                    id: true,
                    userId: true,
                    displayName: true,
                    vehicleType: true,
                    currentTownship: true,
                    status: true,
                    user: {
                        select: {
                            id: true,
                            phone: true,
                            status: true,
                        },
                    },
                },
            },
        },
    },
});
class OrderSummaryCustomerEntity {
}
exports.OrderSummaryCustomerEntity = OrderSummaryCustomerEntity;
class OrderSummaryBranchEntity {
}
exports.OrderSummaryBranchEntity = OrderSummaryBranchEntity;
class OrderSummaryRiderEntity {
}
exports.OrderSummaryRiderEntity = OrderSummaryRiderEntity;
class OrderSummaryDeliveryEntity {
}
exports.OrderSummaryDeliveryEntity = OrderSummaryDeliveryEntity;
class OrderSummaryEntity {
}
exports.OrderSummaryEntity = OrderSummaryEntity;
function buildOrderSummary(order) {
    return {
        orderId: order.id,
        orderCode: order.orderCode,
        customerProfileId: order.customerProfileId,
        branchId: order.branchId,
        addressId: order.addressId,
        cartId: order.cartId,
        status: order.status,
        currencyCode: order.currencyCode,
        subtotalAmount: order.subtotalAmount.toString(),
        discountAmount: order.discountAmount.toString(),
        deliveryFee: order.deliveryFee.toString(),
        totalAmount: order.totalAmount.toString(),
        placedAt: order.placedAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        availableActions: [],
        customer: {
            customerProfileId: order.customerProfile.id,
            userId: order.customerProfile.user.id,
            phone: order.customerProfile.user.phone,
            userStatus: order.customerProfile.user.status,
            fullName: order.customerProfile.fullName,
            avatarUrl: order.customerProfile.avatarUrl,
        },
        branch: {
            branchId: order.branch.id,
            branchName: order.branch.name,
            branchStatus: order.branch.status,
            township: order.branch.township,
            merchantId: order.branch.merchant.id,
            merchantUserId: order.branch.merchant.userId,
            merchantName: order.branch.merchant.name,
            merchantStatus: order.branch.merchant.status,
        },
        delivery: order.delivery === null
            ? null
            : {
                deliveryId: order.delivery.id,
                riderId: order.delivery.riderId,
                etaMinutes: order.delivery.etaMinutes,
                rider: order.delivery.rider === null
                    ? null
                    : {
                        riderId: order.delivery.rider.id,
                        userId: order.delivery.rider.user.id,
                        phone: order.delivery.rider.user.phone,
                        userStatus: order.delivery.rider.user.status,
                        displayName: order.delivery.rider.displayName,
                        vehicleType: order.delivery.rider.vehicleType,
                        currentTownship: order.delivery.rider.currentTownship,
                        status: order.delivery.rider.status,
                    },
            },
    };
}
//# sourceMappingURL=order-summary.entity.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryDetailEntity = exports.DeliveryDetailRiderEntity = exports.DeliveryDetailRiderLocationEntity = exports.DeliveryDetailRiderAvailabilityEntity = exports.DeliveryDetailOrderEntity = exports.DeliveryDetailOrderAddressEntity = exports.DeliveryDetailOrderBranchEntity = exports.DeliveryDetailOrderCustomerEntity = exports.deliveryDetailInclude = exports.deliveryRiderSelect = exports.deliveryLinkedOrderSelect = void 0;
exports.buildDeliveryDetail = buildDeliveryDetail;
const client_1 = require("@prisma/client");
exports.deliveryLinkedOrderSelect = client_1.Prisma.validator()({
    id: true,
    orderCode: true,
    status: true,
    currencyCode: true,
    subtotalAmount: true,
    discountAmount: true,
    deliveryFee: true,
    totalAmount: true,
    deliveryLabel: true,
    deliveryLine1: true,
    deliveryLine2: true,
    deliveryLandmark: true,
    deliveryTownship: true,
    deliveryCity: true,
    deliveryPostalCode: true,
    deliveryInstructions: true,
    deliveryLatitude: true,
    deliveryLongitude: true,
    placedAt: true,
    updatedAt: true,
    customerProfile: {
        select: {
            id: true,
            fullName: true,
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
});
exports.deliveryRiderSelect = client_1.Prisma.validator()({
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
    availability: {
        select: {
            isOnline: true,
            isAvailable: true,
            lastStatusChangedAt: true,
            updatedAt: true,
        },
    },
    currentLocation: {
        select: {
            latitude: true,
            longitude: true,
            heading: true,
            speed: true,
            accuracyMeters: true,
            recordedAt: true,
            deliveryId: true,
        },
    },
});
exports.deliveryDetailInclude = client_1.Prisma.validator()({
    order: {
        select: exports.deliveryLinkedOrderSelect,
    },
    rider: {
        select: exports.deliveryRiderSelect,
    },
});
class DeliveryDetailOrderCustomerEntity {
}
exports.DeliveryDetailOrderCustomerEntity = DeliveryDetailOrderCustomerEntity;
class DeliveryDetailOrderBranchEntity {
}
exports.DeliveryDetailOrderBranchEntity = DeliveryDetailOrderBranchEntity;
class DeliveryDetailOrderAddressEntity {
}
exports.DeliveryDetailOrderAddressEntity = DeliveryDetailOrderAddressEntity;
class DeliveryDetailOrderEntity {
}
exports.DeliveryDetailOrderEntity = DeliveryDetailOrderEntity;
class DeliveryDetailRiderAvailabilityEntity {
}
exports.DeliveryDetailRiderAvailabilityEntity = DeliveryDetailRiderAvailabilityEntity;
class DeliveryDetailRiderLocationEntity {
}
exports.DeliveryDetailRiderLocationEntity = DeliveryDetailRiderLocationEntity;
class DeliveryDetailRiderEntity {
}
exports.DeliveryDetailRiderEntity = DeliveryDetailRiderEntity;
class DeliveryDetailEntity {
}
exports.DeliveryDetailEntity = DeliveryDetailEntity;
function buildDeliveryDetail(delivery) {
    return {
        deliveryId: delivery.id,
        orderId: delivery.orderId,
        riderId: delivery.riderId,
        status: delivery.status,
        etaMinutes: delivery.etaMinutes,
        assignedAt: delivery.assignedAt?.toISOString() ?? null,
        acceptedAt: delivery.acceptedAt?.toISOString() ?? null,
        pickedUpAt: delivery.pickedUpAt?.toISOString() ?? null,
        onTheWayAt: delivery.onTheWayAt?.toISOString() ?? null,
        deliveredAt: delivery.deliveredAt?.toISOString() ?? null,
        failedAt: delivery.failedAt?.toISOString() ?? null,
        cancelledAt: delivery.cancelledAt?.toISOString() ?? null,
        failureReasonCode: delivery.failureReasonCode,
        failureNote: delivery.failureNote,
        createdAt: delivery.createdAt.toISOString(),
        updatedAt: delivery.updatedAt.toISOString(),
        order: {
            orderId: delivery.order.id,
            orderCode: delivery.order.orderCode,
            orderStatus: delivery.order.status,
            currencyCode: delivery.order.currencyCode,
            subtotalAmount: delivery.order.subtotalAmount.toString(),
            discountAmount: delivery.order.discountAmount.toString(),
            deliveryFee: delivery.order.deliveryFee.toString(),
            totalAmount: delivery.order.totalAmount.toString(),
            placedAt: delivery.order.placedAt.toISOString(),
            updatedAt: delivery.order.updatedAt.toISOString(),
            customer: {
                customerProfileId: delivery.order.customerProfile.id,
                userId: delivery.order.customerProfile.user.id,
                phone: delivery.order.customerProfile.user.phone,
                userStatus: delivery.order.customerProfile.user.status,
                fullName: delivery.order.customerProfile.fullName,
            },
            branch: {
                branchId: delivery.order.branch.id,
                branchName: delivery.order.branch.name,
                branchStatus: delivery.order.branch.status,
                township: delivery.order.branch.township,
                merchantId: delivery.order.branch.merchant.id,
                merchantUserId: delivery.order.branch.merchant.userId,
                merchantName: delivery.order.branch.merchant.name,
                merchantStatus: delivery.order.branch.merchant.status,
            },
            deliveryAddress: {
                label: delivery.order.deliveryLabel,
                line1: delivery.order.deliveryLine1,
                line2: delivery.order.deliveryLine2,
                landmark: delivery.order.deliveryLandmark,
                township: delivery.order.deliveryTownship,
                city: delivery.order.deliveryCity,
                postalCode: delivery.order.deliveryPostalCode,
                deliveryInstructions: delivery.order.deliveryInstructions,
                latitude: delivery.order.deliveryLatitude?.toString() ?? null,
                longitude: delivery.order.deliveryLongitude?.toString() ?? null,
            },
        },
        rider: delivery.rider === null
            ? null
            : {
                riderId: delivery.rider.id,
                userId: delivery.rider.user.id,
                phone: delivery.rider.user.phone,
                userStatus: delivery.rider.user.status,
                displayName: delivery.rider.displayName,
                vehicleType: delivery.rider.vehicleType,
                currentTownship: delivery.rider.currentTownship,
                status: delivery.rider.status,
                availability: delivery.rider.availability === null
                    ? null
                    : {
                        isOnline: delivery.rider.availability.isOnline,
                        isAvailable: delivery.rider.availability.isAvailable,
                        lastStatusChangedAt: delivery.rider.availability.lastStatusChangedAt.toISOString(),
                        updatedAt: delivery.rider.availability.updatedAt.toISOString(),
                    },
                currentLocation: delivery.rider.currentLocation === null
                    ? null
                    : {
                        latitude: delivery.rider.currentLocation.latitude.toString(),
                        longitude: delivery.rider.currentLocation.longitude.toString(),
                        heading: delivery.rider.currentLocation.heading?.toString() ?? null,
                        speed: delivery.rider.currentLocation.speed?.toString() ?? null,
                        accuracyMeters: delivery.rider.currentLocation.accuracyMeters?.toString() ??
                            null,
                        recordedAt: delivery.rider.currentLocation.recordedAt.toISOString(),
                        deliveryId: delivery.rider.currentLocation.deliveryId,
                    },
            },
    };
}
//# sourceMappingURL=delivery-detail.entity.js.map
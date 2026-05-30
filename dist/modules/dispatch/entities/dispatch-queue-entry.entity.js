"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchQueueEntryEntity = exports.DispatchQueueDeliveryEntity = exports.DispatchQueueRiderEntity = exports.DispatchQueueRiderLocationEntity = exports.DispatchQueueRiderAvailabilityEntity = exports.DispatchQueueBranchEntity = exports.DispatchQueueCustomerEntity = exports.dispatchQueueOrderInclude = void 0;
exports.buildDispatchQueueEntry = buildDispatchQueueEntry;
const client_1 = require("@prisma/client");
exports.dispatchQueueOrderInclude = client_1.Prisma.validator()({
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
    delivery: {
        select: {
            id: true,
            riderId: true,
            status: true,
            etaMinutes: true,
            assignedAt: true,
            acceptedAt: true,
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
                    availability: {
                        select: {
                            isOnline: true,
                            isAvailable: true,
                            lastStatusChangedAt: true,
                        },
                    },
                    currentLocation: {
                        select: {
                            latitude: true,
                            longitude: true,
                            recordedAt: true,
                        },
                    },
                },
            },
        },
    },
});
class DispatchQueueCustomerEntity {
}
exports.DispatchQueueCustomerEntity = DispatchQueueCustomerEntity;
class DispatchQueueBranchEntity {
}
exports.DispatchQueueBranchEntity = DispatchQueueBranchEntity;
class DispatchQueueRiderAvailabilityEntity {
}
exports.DispatchQueueRiderAvailabilityEntity = DispatchQueueRiderAvailabilityEntity;
class DispatchQueueRiderLocationEntity {
}
exports.DispatchQueueRiderLocationEntity = DispatchQueueRiderLocationEntity;
class DispatchQueueRiderEntity {
}
exports.DispatchQueueRiderEntity = DispatchQueueRiderEntity;
class DispatchQueueDeliveryEntity {
}
exports.DispatchQueueDeliveryEntity = DispatchQueueDeliveryEntity;
class DispatchQueueEntryEntity {
}
exports.DispatchQueueEntryEntity = DispatchQueueEntryEntity;
function buildDispatchQueueEntry(order) {
    const queueState = order.delivery === null || order.delivery.status === client_1.DeliveryStatus.PENDING_ASSIGNMENT
        ? 'awaiting_assignment'
        : 'awaiting_rider_acceptance';
    return {
        orderId: order.id,
        orderCode: order.orderCode,
        orderStatus: order.status,
        queueState,
        currencyCode: order.currencyCode,
        totalAmount: order.totalAmount.toString(),
        deliveryTownship: order.deliveryTownship,
        deliveryLatitude: order.deliveryLatitude?.toString() ?? null,
        deliveryLongitude: order.deliveryLongitude?.toString() ?? null,
        placedAt: order.placedAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        customer: {
            customerProfileId: order.customerProfile.id,
            userId: order.customerProfile.user.id,
            phone: order.customerProfile.user.phone,
            userStatus: order.customerProfile.user.status,
            fullName: order.customerProfile.fullName,
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
                status: order.delivery.status,
                etaMinutes: order.delivery.etaMinutes,
                assignedAt: order.delivery.assignedAt?.toISOString() ?? null,
                acceptedAt: order.delivery.acceptedAt?.toISOString() ?? null,
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
                        availability: order.delivery.rider.availability === null
                            ? null
                            : {
                                isOnline: order.delivery.rider.availability.isOnline,
                                isAvailable: order.delivery.rider.availability.isAvailable,
                                lastStatusChangedAt: order.delivery.rider.availability.lastStatusChangedAt.toISOString(),
                            },
                        currentLocation: order.delivery.rider.currentLocation === null
                            ? null
                            : {
                                latitude: order.delivery.rider.currentLocation.latitude.toString(),
                                longitude: order.delivery.rider.currentLocation.longitude.toString(),
                                recordedAt: order.delivery.rider.currentLocation.recordedAt.toISOString(),
                            },
                    },
            },
    };
}
//# sourceMappingURL=dispatch-queue-entry.entity.js.map
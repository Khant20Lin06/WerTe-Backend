"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiderAvailabilitySnapshotEntity = exports.RiderOwnershipEntity = exports.riderOwnershipInclude = void 0;
exports.buildRiderOwnership = buildRiderOwnership;
const client_1 = require("@prisma/client");
exports.riderOwnershipInclude = client_1.Prisma.validator()({
    user: {
        select: {
            id: true,
            phone: true,
            role: true,
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
});
class RiderOwnershipEntity {
}
exports.RiderOwnershipEntity = RiderOwnershipEntity;
class RiderAvailabilitySnapshotEntity {
}
exports.RiderAvailabilitySnapshotEntity = RiderAvailabilitySnapshotEntity;
function buildRiderOwnership(rider) {
    return {
        riderId: rider.id,
        userId: rider.user.id,
        phone: rider.user.phone,
        role: rider.user.role,
        userStatus: rider.user.status,
        displayName: rider.displayName,
        vehicleType: rider.vehicleType,
        currentTownship: rider.currentTownship,
        status: rider.status,
        availability: rider.availability === null
            ? null
            : {
                isOnline: rider.availability.isOnline,
                isAvailable: rider.availability.isAvailable,
                lastStatusChangedAt: rider.availability.lastStatusChangedAt.toISOString(),
                updatedAt: rider.availability.updatedAt.toISOString(),
            },
    };
}
//# sourceMappingURL=rider-ownership.entity.js.map
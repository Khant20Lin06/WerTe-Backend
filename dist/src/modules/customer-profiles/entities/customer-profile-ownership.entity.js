"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerProfileOwnershipEntity = exports.customerProfileOwnershipInclude = void 0;
exports.buildCustomerProfileOwnership = buildCustomerProfileOwnership;
const client_1 = require("@prisma/client");
exports.customerProfileOwnershipInclude = client_1.Prisma.validator()({
    user: {
        select: {
            id: true,
            phone: true,
            role: true,
            status: true,
        },
    },
});
class CustomerProfileOwnershipEntity {
}
exports.CustomerProfileOwnershipEntity = CustomerProfileOwnershipEntity;
function buildCustomerProfileOwnership(profile) {
    return {
        customerProfileId: profile.id,
        userId: profile.user.id,
        phone: profile.user.phone,
        role: profile.user.role,
        userStatus: profile.user.status,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
    };
}
//# sourceMappingURL=customer-profile-ownership.entity.js.map
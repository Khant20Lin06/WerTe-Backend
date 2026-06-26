"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressOwnershipEntity = exports.addressOwnershipInclude = void 0;
exports.buildAddressOwnership = buildAddressOwnership;
const client_1 = require("@prisma/client");
exports.addressOwnershipInclude = client_1.Prisma.validator()({
    customerProfile: {
        select: {
            id: true,
            userId: true,
            user: {
                select: {
                    id: true,
                    phone: true,
                    role: true,
                    status: true,
                },
            },
        },
    },
});
class AddressOwnershipEntity {
}
exports.AddressOwnershipEntity = AddressOwnershipEntity;
function buildAddressOwnership(address) {
    return {
        addressId: address.id,
        customerProfileId: address.customerProfile.id,
        userId: address.customerProfile.user.id,
        phone: address.customerProfile.user.phone,
        role: address.customerProfile.user.role,
        userStatus: address.customerProfile.user.status,
        label: address.label,
        line1: address.line1,
        township: address.township,
        city: address.city,
        isDefault: address.isDefault,
    };
}
//# sourceMappingURL=address-ownership.entity.js.map
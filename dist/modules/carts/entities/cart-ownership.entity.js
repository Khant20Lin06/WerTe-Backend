"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartOwnershipEntity = exports.cartOwnershipInclude = void 0;
exports.buildCartOwnership = buildCartOwnership;
const client_1 = require("@prisma/client");
exports.cartOwnershipInclude = client_1.Prisma.validator()({
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
    branch: {
        select: {
            id: true,
            merchantId: true,
            status: true,
            merchant: {
                select: {
                    id: true,
                    status: true,
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
        },
    },
});
class CartOwnershipEntity {
}
exports.CartOwnershipEntity = CartOwnershipEntity;
function buildCartOwnership(cart) {
    return {
        cartId: cart.id,
        customerProfileId: cart.customerProfile.id,
        userId: cart.customerProfile.user.id,
        phone: cart.customerProfile.user.phone,
        role: cart.customerProfile.user.role,
        userStatus: cart.customerProfile.user.status,
        branchId: cart.branch.id,
        merchantId: cart.branch.merchant.id,
        merchantStatus: cart.branch.merchant.status,
        branchStatus: cart.branch.status,
        status: cart.status,
        totalQuantity: cart.totalQuantity,
        subtotalAmount: cart.subtotalAmount.toString(),
        totalAmount: cart.totalAmount.toString(),
    };
}
//# sourceMappingURL=cart-ownership.entity.js.map
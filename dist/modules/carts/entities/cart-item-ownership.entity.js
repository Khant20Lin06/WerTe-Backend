"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItemOwnershipEntity = exports.cartItemOwnershipInclude = void 0;
exports.buildCartItemOwnership = buildCartItemOwnership;
const client_1 = require("@prisma/client");
exports.cartItemOwnershipInclude = client_1.Prisma.validator()({
    cart: {
        select: {
            id: true,
            customerProfileId: true,
            branchId: true,
            status: true,
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
        },
    },
    menuItem: {
        select: {
            id: true,
            branchId: true,
            categoryId: true,
            name: true,
            basePrice: true,
            isAvailable: true,
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
        },
    },
});
class CartItemOwnershipEntity {
}
exports.CartItemOwnershipEntity = CartItemOwnershipEntity;
function buildCartItemOwnership(cartItem) {
    return {
        cartItemId: cartItem.id,
        cartId: cartItem.cart.id,
        customerProfileId: cartItem.cart.customerProfile.id,
        userId: cartItem.cart.customerProfile.user.id,
        phone: cartItem.cart.customerProfile.user.phone,
        role: cartItem.cart.customerProfile.user.role,
        userStatus: cartItem.cart.customerProfile.user.status,
        branchId: cartItem.cart.branch.id,
        cartStatus: cartItem.cart.status,
        branchStatus: cartItem.cart.branch.status,
        merchantId: cartItem.cart.branch.merchant.id,
        merchantStatus: cartItem.cart.branch.merchant.status,
        menuItemId: cartItem.menuItem.id,
        menuItemBranchId: cartItem.menuItem.branch.id,
        menuItemCategoryId: cartItem.menuItem.categoryId,
        menuItemName: cartItem.menuItem.name,
        menuItemBasePrice: cartItem.menuItem.basePrice.toString(),
        menuItemIsAvailable: cartItem.menuItem.isAvailable,
        quantity: cartItem.quantity,
        unitPriceSnapshot: cartItem.unitPriceSnapshot.toString(),
        lineTotal: cartItem.lineTotal.toString(),
    };
}
//# sourceMappingURL=cart-item-ownership.entity.js.map
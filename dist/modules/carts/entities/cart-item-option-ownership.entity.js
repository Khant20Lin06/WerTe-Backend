"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItemOptionOwnershipEntity = exports.cartItemOptionOwnershipInclude = void 0;
exports.buildCartItemOptionOwnership = buildCartItemOptionOwnership;
const client_1 = require("@prisma/client");
exports.cartItemOptionOwnershipInclude = client_1.Prisma.validator()({
    cartItem: {
        select: {
            id: true,
            cartId: true,
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
        },
    },
    itemOption: {
        select: {
            id: true,
            name: true,
            isActive: true,
            group: {
                select: {
                    id: true,
                    name: true,
                    isActive: true,
                    menuItem: {
                        select: {
                            id: true,
                            branchId: true,
                            name: true,
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
                },
            },
        },
    },
});
class CartItemOptionOwnershipEntity {
}
exports.CartItemOptionOwnershipEntity = CartItemOptionOwnershipEntity;
function buildCartItemOptionOwnership(cartItemOption) {
    return {
        cartItemOptionId: cartItemOption.id,
        cartItemId: cartItemOption.cartItem.id,
        cartId: cartItemOption.cartItem.cart.id,
        customerProfileId: cartItemOption.cartItem.cart.customerProfile.id,
        userId: cartItemOption.cartItem.cart.customerProfile.user.id,
        phone: cartItemOption.cartItem.cart.customerProfile.user.phone,
        role: cartItemOption.cartItem.cart.customerProfile.user.role,
        userStatus: cartItemOption.cartItem.cart.customerProfile.user.status,
        branchId: cartItemOption.cartItem.cart.branch.id,
        merchantId: cartItemOption.cartItem.cart.branch.merchant.id,
        merchantStatus: cartItemOption.cartItem.cart.branch.merchant.status,
        branchStatus: cartItemOption.cartItem.cart.branch.status,
        cartStatus: cartItemOption.cartItem.cart.status,
        itemOptionId: cartItemOption.itemOption.id,
        itemOptionName: cartItemOption.itemOption.name,
        itemOptionIsActive: cartItemOption.itemOption.isActive,
        optionGroupId: cartItemOption.itemOption.group.id,
        optionGroupName: cartItemOption.itemOption.group.name,
        optionGroupIsActive: cartItemOption.itemOption.group.isActive,
        menuItemId: cartItemOption.itemOption.group.menuItem.id,
        menuItemName: cartItemOption.itemOption.group.menuItem.name,
        menuItemIsAvailable: cartItemOption.itemOption.group.menuItem.isAvailable,
        nameSnapshot: cartItemOption.nameSnapshot,
        priceDeltaSnapshot: cartItemOption.priceDeltaSnapshot.toString(),
    };
}
//# sourceMappingURL=cart-item-option-ownership.entity.js.map
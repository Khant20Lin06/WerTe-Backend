"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartAggregateEntity = exports.CartAggregateItemEntity = exports.CartAggregateSelectedOptionEntity = exports.cartAggregateInclude = void 0;
exports.buildCartAggregate = buildCartAggregate;
exports.buildEmptyCartAggregate = buildEmptyCartAggregate;
const client_1 = require("@prisma/client");
exports.cartAggregateInclude = client_1.Prisma.validator()({
    customerProfile: {
        select: {
            id: true,
            userId: true,
        },
    },
    branch: {
        select: {
            id: true,
            merchantId: true,
            name: true,
            status: true,
            merchant: {
                select: {
                    id: true,
                    status: true,
                },
            },
        },
    },
    items: {
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        include: {
            menuItem: {
                select: {
                    id: true,
                    branchId: true,
                    categoryId: true,
                    name: true,
                    description: true,
                    imageUrl: true,
                    basePrice: true,
                    isAvailable: true,
                },
            },
            selectedOptions: {
                orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
                include: {
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
                                },
                            },
                        },
                    },
                },
            },
        },
    },
});
class CartAggregateSelectedOptionEntity {
}
exports.CartAggregateSelectedOptionEntity = CartAggregateSelectedOptionEntity;
class CartAggregateItemEntity {
}
exports.CartAggregateItemEntity = CartAggregateItemEntity;
class CartAggregateEntity {
}
exports.CartAggregateEntity = CartAggregateEntity;
function buildCartAggregate(cart) {
    return {
        cartId: cart.id,
        customerProfileId: cart.customerProfile.id,
        branchId: cart.branch.id,
        merchantId: cart.branch.merchant.id,
        branchName: cart.branch.name,
        branchStatus: cart.branch.status,
        merchantStatus: cart.branch.merchant.status,
        status: cart.status,
        totalQuantity: cart.totalQuantity,
        subtotalAmount: cart.subtotalAmount.toString(),
        totalAmount: cart.totalAmount.toString(),
        isEmpty: cart.items.length === 0,
        items: cart.items.map((item) => ({
            cartItemId: item.id,
            menuItemId: item.menuItem.id,
            branchId: item.menuItem.branchId,
            categoryId: item.menuItem.categoryId,
            menuItemName: item.menuItem.name,
            menuItemDescription: item.menuItem.description,
            menuItemImageUrl: item.menuItem.imageUrl,
            menuItemBasePrice: item.menuItem.basePrice.toString(),
            menuItemIsAvailable: item.menuItem.isAvailable,
            quantity: item.quantity,
            unitPriceSnapshot: item.unitPriceSnapshot.toString(),
            lineTotal: item.lineTotal.toString(),
            selectedOptions: item.selectedOptions.map((selectedOption) => ({
                cartItemOptionId: selectedOption.id,
                itemOptionId: selectedOption.itemOption.id,
                itemOptionName: selectedOption.itemOption.name,
                itemOptionIsActive: selectedOption.itemOption.isActive,
                optionGroupId: selectedOption.itemOption.group.id,
                optionGroupName: selectedOption.itemOption.group.name,
                optionGroupIsActive: selectedOption.itemOption.group.isActive,
                nameSnapshot: selectedOption.nameSnapshot,
                priceDeltaSnapshot: selectedOption.priceDeltaSnapshot.toString(),
            })),
        })),
    };
}
function buildEmptyCartAggregate(input) {
    return {
        cartId: null,
        customerProfileId: null,
        branchId: input.branchId,
        merchantId: null,
        branchName: null,
        branchStatus: null,
        merchantStatus: null,
        status: client_1.CartStatus.ACTIVE,
        totalQuantity: 0,
        subtotalAmount: '0',
        totalAmount: '0',
        isEmpty: true,
        items: [],
    };
}
//# sourceMappingURL=cart-aggregate.entity.js.map
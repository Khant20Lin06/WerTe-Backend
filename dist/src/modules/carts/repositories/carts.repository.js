"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartsRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const cart_aggregate_entity_1 = require("../entities/cart-aggregate.entity");
const cart_item_option_ownership_entity_1 = require("../entities/cart-item-option-ownership.entity");
const cart_item_ownership_entity_1 = require("../entities/cart-item-ownership.entity");
const cart_ownership_entity_1 = require("../entities/cart-ownership.entity");
let CartsRepository = class CartsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findCartById(id) {
        return this.prisma.cart.findUnique({
            where: { id },
            include: cart_ownership_entity_1.cartOwnershipInclude,
        });
    }
    findCartAggregateById(id) {
        return this.prisma.cart.findUnique({
            where: { id },
            include: cart_aggregate_entity_1.cartAggregateInclude,
        });
    }
    listCartsByCustomerProfileId(customerProfileId) {
        return this.prisma.cart.findMany({
            where: { customerProfileId },
            include: cart_ownership_entity_1.cartOwnershipInclude,
            orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findActiveCartByCustomerProfileIdAndBranchId(customerProfileId, branchId, client = this.prisma) {
        return client.cart.findFirst({
            where: {
                customerProfileId,
                branchId,
                status: client_1.CartStatus.ACTIVE,
            },
            include: cart_ownership_entity_1.cartOwnershipInclude,
            orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findActiveCartByUserIdAndBranchId(userId, branchId) {
        return this.prisma.cart.findFirst({
            where: {
                branchId,
                status: client_1.CartStatus.ACTIVE,
                customerProfile: {
                    is: {
                        userId,
                    },
                },
            },
            include: cart_ownership_entity_1.cartOwnershipInclude,
            orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findActiveCartAggregateByUserIdAndBranchId(userId, branchId) {
        return this.prisma.cart.findFirst({
            where: {
                branchId,
                status: client_1.CartStatus.ACTIVE,
                customerProfile: {
                    is: {
                        userId,
                    },
                },
            },
            include: cart_aggregate_entity_1.cartAggregateInclude,
            orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findCartItemById(id) {
        return this.prisma.cartItem.findUnique({
            where: { id },
            include: cart_item_ownership_entity_1.cartItemOwnershipInclude,
        });
    }
    listCartItemsByCartId(cartId) {
        return this.listCartItemsByCartIdWithClient(cartId, this.prisma);
    }
    listCartItemsByCartIdWithClient(cartId, client) {
        return client.cartItem.findMany({
            where: { cartId },
            include: cart_item_ownership_entity_1.cartItemOwnershipInclude,
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        });
    }
    findCartItemOptionById(id) {
        return this.prisma.cartItemOption.findUnique({
            where: { id },
            include: cart_item_option_ownership_entity_1.cartItemOptionOwnershipInclude,
        });
    }
    listCartItemOptionsByCartItemId(cartItemId) {
        return this.listCartItemOptionsByCartItemIdWithClient(cartItemId, this.prisma);
    }
    listCartItemOptionsByCartItemIdWithClient(cartItemId, client) {
        return client.cartItemOption.findMany({
            where: { cartItemId },
            include: cart_item_option_ownership_entity_1.cartItemOptionOwnershipInclude,
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        });
    }
    createCart(data, client = this.prisma) {
        return client.cart.create({
            data,
            include: cart_ownership_entity_1.cartOwnershipInclude,
        });
    }
    updateCart(id, data, client = this.prisma) {
        return client.cart.update({
            where: { id },
            data,
            include: cart_ownership_entity_1.cartOwnershipInclude,
        });
    }
    createCartItem(data, client = this.prisma) {
        return client.cartItem.create({
            data,
            include: cart_item_ownership_entity_1.cartItemOwnershipInclude,
        });
    }
    updateCartItem(id, data, client = this.prisma) {
        return client.cartItem.update({
            where: { id },
            data,
            include: cart_item_ownership_entity_1.cartItemOwnershipInclude,
        });
    }
    deleteCartItem(id, client = this.prisma) {
        return client.cartItem.delete({
            where: { id },
            select: {
                id: true,
            },
        });
    }
    deleteCartItemsByCartId(cartId, client = this.prisma) {
        return client.cartItem.deleteMany({
            where: { cartId },
        });
    }
    createCartItemOptions(data, client = this.prisma) {
        if (data.length === 0) {
            return Promise.resolve({ count: 0 });
        }
        return client.cartItemOption.createMany({
            data,
        });
    }
    deleteCartItemOptionsByCartItemId(cartItemId, client = this.prisma) {
        return client.cartItemOption.deleteMany({
            where: { cartItemId },
        });
    }
    deleteCartItemOptionsByCartId(cartId, client = this.prisma) {
        return client.cartItemOption.deleteMany({
            where: {
                cartItem: {
                    is: {
                        cartId,
                    },
                },
            },
        });
    }
};
exports.CartsRepository = CartsRepository;
exports.CartsRepository = CartsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartsRepository);
//# sourceMappingURL=carts.repository.js.map
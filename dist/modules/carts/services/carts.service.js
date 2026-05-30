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
exports.CartsService = void 0;
const common_1 = require("@nestjs/common");
const cart_item_option_ownership_entity_1 = require("../entities/cart-item-option-ownership.entity");
const cart_item_ownership_entity_1 = require("../entities/cart-item-ownership.entity");
const cart_ownership_entity_1 = require("../entities/cart-ownership.entity");
const carts_repository_1 = require("../repositories/carts.repository");
let CartsService = class CartsService {
    constructor(cartsRepository) {
        this.cartsRepository = cartsRepository;
    }
    findCartById(id) {
        return this.cartsRepository.findCartById(id);
    }
    listByCustomerProfileId(customerProfileId) {
        return this.cartsRepository.listCartsByCustomerProfileId(customerProfileId);
    }
    findActiveByCustomerProfileIdAndBranchId(customerProfileId, branchId) {
        return this.cartsRepository.findActiveCartByCustomerProfileIdAndBranchId(customerProfileId, branchId);
    }
    findActiveOwnedByUserIdAndBranchId(userId, branchId) {
        return this.cartsRepository.findActiveCartByUserIdAndBranchId(userId, branchId);
    }
    findCartItemById(id) {
        return this.cartsRepository.findCartItemById(id);
    }
    listCartItemsByCartId(cartId) {
        return this.cartsRepository.listCartItemsByCartId(cartId);
    }
    findCartItemOptionById(id) {
        return this.cartsRepository.findCartItemOptionById(id);
    }
    listCartItemOptionsByCartItemId(cartItemId) {
        return this.cartsRepository.listCartItemOptionsByCartItemId(cartItemId);
    }
    async findOwnedCartByUserId(userId, cartId) {
        const cart = await this.findCartById(cartId);
        if (cart === null || !this.belongsToUser(cart, userId)) {
            return null;
        }
        return cart;
    }
    async findOwnedCartItemByUserId(userId, cartItemId) {
        const cartItem = await this.findCartItemById(cartItemId);
        if (cartItem === null || !this.cartItemBelongsToUser(cartItem, userId)) {
            return null;
        }
        return cartItem;
    }
    async findOwnedCartItemOptionByUserId(userId, cartItemOptionId) {
        const cartItemOption = await this.findCartItemOptionById(cartItemOptionId);
        if (cartItemOption === null ||
            !this.cartItemOptionBelongsToUser(cartItemOption, userId)) {
            return null;
        }
        return cartItemOption;
    }
    buildCartOwnership(cart) {
        return (0, cart_ownership_entity_1.buildCartOwnership)(cart);
    }
    buildCartItemOwnership(cartItem) {
        return (0, cart_item_ownership_entity_1.buildCartItemOwnership)(cartItem);
    }
    buildCartItemOptionOwnership(cartItemOption) {
        return (0, cart_item_option_ownership_entity_1.buildCartItemOptionOwnership)(cartItemOption);
    }
    belongsToUser(cart, userId) {
        return cart.customerProfile.user.id === userId;
    }
    belongsToCustomerProfile(cart, customerProfileId) {
        return cart.customerProfile.id === customerProfileId;
    }
    belongsToBranch(cart, branchId) {
        return cart.branch.id === branchId;
    }
    cartItemBelongsToUser(cartItem, userId) {
        return cartItem.cart.customerProfile.user.id === userId;
    }
    cartItemBelongsToCart(cartItem, cartId) {
        return cartItem.cart.id === cartId;
    }
    cartItemOptionBelongsToUser(cartItemOption, userId) {
        return cartItemOption.cartItem.cart.customerProfile.user.id === userId;
    }
    cartItemOptionBelongsToCartItem(cartItemOption, cartItemId) {
        return cartItemOption.cartItem.id === cartItemId;
    }
};
exports.CartsService = CartsService;
exports.CartsService = CartsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [carts_repository_1.CartsRepository])
], CartsService);
//# sourceMappingURL=carts.service.js.map
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
exports.CartQueryService = void 0;
const common_1 = require("@nestjs/common");
const cart_aggregate_entity_1 = require("../entities/cart-aggregate.entity");
const carts_repository_1 = require("../repositories/carts.repository");
let CartQueryService = class CartQueryService {
    constructor(cartsRepository) {
        this.cartsRepository = cartsRepository;
    }
    findCartAggregateById(cartId) {
        return this.cartsRepository.findCartAggregateById(cartId);
    }
    async findOwnedCartAggregateByUserId(userId, cartId) {
        const cart = await this.findCartAggregateById(cartId);
        if (cart === null || !this.belongsToUser(cart, userId)) {
            return null;
        }
        return cart;
    }
    async getOwnedActiveCartAggregateOrEmpty(userId, branchId) {
        const cart = await this.cartsRepository.findActiveCartAggregateByUserIdAndBranchId(userId, branchId);
        if (cart === null) {
            return (0, cart_aggregate_entity_1.buildEmptyCartAggregate)({ branchId });
        }
        return (0, cart_aggregate_entity_1.buildCartAggregate)(cart);
    }
    buildCartAggregate(cart) {
        return (0, cart_aggregate_entity_1.buildCartAggregate)(cart);
    }
    buildEmptyCartAggregate(branchId) {
        return (0, cart_aggregate_entity_1.buildEmptyCartAggregate)({ branchId });
    }
    belongsToUser(cart, userId) {
        return cart.customerProfile.userId === userId;
    }
};
exports.CartQueryService = CartQueryService;
exports.CartQueryService = CartQueryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [carts_repository_1.CartsRepository])
], CartQueryService);
//# sourceMappingURL=cart-query.service.js.map
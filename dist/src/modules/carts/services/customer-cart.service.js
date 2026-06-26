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
exports.CustomerCartService = void 0;
const common_1 = require("@nestjs/common");
const cart_dto_1 = require("../dto/cart.dto");
const cart_mutation_service_1 = require("./cart-mutation.service");
const cart_query_service_1 = require("./cart-query.service");
let CustomerCartService = class CustomerCartService {
    constructor(cartQueryService, cartMutationService) {
        this.cartQueryService = cartQueryService;
        this.cartMutationService = cartMutationService;
    }
    async getCurrentCustomerCart(currentUser, branchId) {
        const cart = await this.cartQueryService.getOwnedActiveCartAggregateOrEmpty(currentUser.userId, branchId);
        return (0, cart_dto_1.toCartDto)(cart);
    }
    async addCurrentCustomerCartItem(currentUser, payload) {
        const cart = await this.cartMutationService.addCurrentCustomerCartItem(currentUser, payload.branchId, {
            menuItemId: payload.menuItemId,
            quantity: payload.quantity,
            selectedOptionIds: payload.selectedOptionIds,
        });
        return (0, cart_dto_1.toCartDto)(cart);
    }
    async updateCurrentCustomerCartItem(currentUser, cartItemId, payload) {
        const cart = await this.cartMutationService.updateCurrentCustomerCartItem(currentUser, cartItemId, {
            quantity: payload.quantity,
            selectedOptionIds: payload.selectedOptionIds,
        });
        return (0, cart_dto_1.toCartDto)(cart);
    }
    async removeCurrentCustomerCartItem(currentUser, cartItemId) {
        const cart = await this.cartMutationService.removeCurrentCustomerCartItem(currentUser, cartItemId);
        return (0, cart_dto_1.toCartDto)(cart);
    }
    async clearCurrentCustomerCart(currentUser, branchId) {
        const cart = await this.cartMutationService.clearCurrentCustomerBranchCart(currentUser, branchId);
        return (0, cart_dto_1.toCartDto)(cart);
    }
};
exports.CustomerCartService = CustomerCartService;
exports.CustomerCartService = CustomerCartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cart_query_service_1.CartQueryService,
        cart_mutation_service_1.CartMutationService])
], CustomerCartService);
//# sourceMappingURL=customer-cart.service.js.map
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
exports.CartPricingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const carts_repository_1 = require("../repositories/carts.repository");
let CartPricingService = class CartPricingService {
    constructor(cartsRepository) {
        this.cartsRepository = cartsRepository;
    }
    computeUnitPriceSnapshot(menuItem, selectedOptions) {
        return selectedOptions.reduce((total, option) => total.add(option.priceDelta), new client_1.Prisma.Decimal(menuItem.basePrice));
    }
    computeLineTotal(quantity, unitPriceSnapshot) {
        return unitPriceSnapshot.mul(quantity);
    }
    computeCartTotals(cartItems) {
        const subtotalAmount = cartItems.reduce((total, cartItem) => total.add(cartItem.lineTotal), new client_1.Prisma.Decimal(0));
        const totalQuantity = cartItems.reduce((total, cartItem) => total + cartItem.quantity, 0);
        return {
            totalQuantity,
            subtotalAmount,
            totalAmount: subtotalAmount,
        };
    }
    async recomputeCartTotals(cartId, tx) {
        const cartItems = await this.cartsRepository.listCartItemsByCartIdWithClient(cartId, tx);
        const totals = this.computeCartTotals(cartItems);
        await this.cartsRepository.updateCart(cartId, {
            totalQuantity: totals.totalQuantity,
            subtotalAmount: totals.subtotalAmount,
            totalAmount: totals.totalAmount,
        }, tx);
        return totals;
    }
};
exports.CartPricingService = CartPricingService;
exports.CartPricingService = CartPricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [carts_repository_1.CartsRepository])
], CartPricingService);
//# sourceMappingURL=cart-pricing.service.js.map
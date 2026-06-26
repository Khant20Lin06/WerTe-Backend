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
exports.CheckoutPricingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const checkout_preview_entity_1 = require("../entities/checkout-preview.entity");
const promotion_pricing_service_1 = require("../../promotions/services/promotion-pricing.service");
let CheckoutPricingService = class CheckoutPricingService {
    constructor(promotionPricingService) {
        this.promotionPricingService = promotionPricingService;
    }
    async buildPricingBreakdown(context, options) {
        const subtotalAmount = new client_1.Prisma.Decimal(context.cart.subtotalAmount);
        const promotionApplication = await this.promotionPricingService.evaluatePromotionForCheckout({
            branchId: context.branch.branchId,
            subtotalAmount,
            promotionCode: options?.promotionCode,
        });
        const discountAmount = promotionApplication?.discountAmount ?? new client_1.Prisma.Decimal(0);
        const isPickup = context.address === null;
        const deliveryFee = isPickup ? new client_1.Prisma.Decimal(0) : new client_1.Prisma.Decimal(1500);
        const totalAmount = subtotalAmount.sub(discountAmount).add(deliveryFee);
        return {
            subtotalAmount,
            discountAmount,
            deliveryFee,
            totalAmount,
            appliedPromotion: promotionApplication?.appliedPromotion ?? null,
        };
    }
    async buildCheckoutPreview(context, options) {
        const pricing = await this.buildPricingBreakdown(context, options);
        return (0, checkout_preview_entity_1.buildCheckoutPreview)({
            context,
            ...pricing,
        });
    }
};
exports.CheckoutPricingService = CheckoutPricingService;
exports.CheckoutPricingService = CheckoutPricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [promotion_pricing_service_1.PromotionPricingService])
], CheckoutPricingService);
//# sourceMappingURL=checkout-pricing.service.js.map
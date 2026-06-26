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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderDto = void 0;
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateOrderDto {
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch receiving the submitted checkout request.',
        example: 'branch_1',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Delivery type: DELIVERY (rider brings to address) or PICKUP (customer collects from branch). Defaults to DELIVERY.',
        enum: client_1.DeliveryType,
        example: client_1.DeliveryType.DELIVERY,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.DeliveryType),
    __metadata("design:type", typeof (_a = typeof client_1.DeliveryType !== "undefined" && client_1.DeliveryType) === "function" ? _a : Object)
], CreateOrderDto.prototype, "deliveryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Customer delivery address. Required when deliveryType is DELIVERY. Ignored for PICKUP orders.',
        example: 'addr_1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "addressId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Client-generated idempotency key used to safely retry checkout submission.',
        example: 'checkout-usr_1-20260419-001',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "idempotencyKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional payment method used to initialize the checkout payment intent. Defaults to CASH_ON_DELIVERY.',
        enum: client_1.PaymentMethod,
        example: client_1.PaymentMethod.CASH_ON_DELIVERY,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional payment provider hint for non-COD checkout payment intents.',
        enum: client_1.PaymentProvider,
        example: client_1.PaymentProvider.WAVE_PAY,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentProvider),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "paymentProvider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional promotion code applied to the submitted checkout when valid for the branch.',
        example: 'SAVE10',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "promotionCode", void 0);
//# sourceMappingURL=create-order.dto.js.map
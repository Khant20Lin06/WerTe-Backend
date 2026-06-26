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
exports.CheckoutPreviewDto = exports.CheckoutPreviewPricingDto = exports.CheckoutPreviewBranchDto = exports.CheckoutPreviewAddressDto = exports.CheckoutPreviewCustomerDto = void 0;
exports.toCheckoutPreviewDto = toCheckoutPreviewDto;
const swagger_1 = require("@nestjs/swagger");
const cart_dto_1 = require("../../carts/dto/cart.dto");
const applied_promotion_dto_1 = require("../../promotions/dto/applied-promotion.dto");
class CheckoutPreviewCustomerDto {
}
exports.CheckoutPreviewCustomerDto = CheckoutPreviewCustomerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer profile identifier.',
        example: 'cust_prof_1',
    }),
    __metadata("design:type", String)
], CheckoutPreviewCustomerDto.prototype, "customerProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Authenticated user identifier.',
        example: 'usr_1',
    }),
    __metadata("design:type", String)
], CheckoutPreviewCustomerDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer phone number.',
        example: '09123456789',
    }),
    __metadata("design:type", String)
], CheckoutPreviewCustomerDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer role.',
        example: 'CUSTOMER',
    }),
    __metadata("design:type", String)
], CheckoutPreviewCustomerDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer account status.',
        example: 'ACTIVE',
    }),
    __metadata("design:type", String)
], CheckoutPreviewCustomerDto.prototype, "userStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional customer display name.',
        example: 'Mg Mg',
    }),
    __metadata("design:type", Object)
], CheckoutPreviewCustomerDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional customer avatar URL.',
        example: 'https://cdn.example.com/customer/avatar.png',
    }),
    __metadata("design:type", Object)
], CheckoutPreviewCustomerDto.prototype, "avatarUrl", void 0);
class CheckoutPreviewAddressDto {
}
exports.CheckoutPreviewAddressDto = CheckoutPreviewAddressDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Delivery address identifier.',
        example: 'addr_1',
    }),
    __metadata("design:type", String)
], CheckoutPreviewAddressDto.prototype, "addressId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address label.',
        example: 'Home',
    }),
    __metadata("design:type", String)
], CheckoutPreviewAddressDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Primary address line.',
        example: 'No. 1, Main Road',
    }),
    __metadata("design:type", String)
], CheckoutPreviewAddressDto.prototype, "line1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Secondary address line.',
        example: 'Apartment 5B',
    }),
    __metadata("design:type", Object)
], CheckoutPreviewAddressDto.prototype, "line2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nearby landmark.',
        example: 'Near City Mart',
    }),
    __metadata("design:type", Object)
], CheckoutPreviewAddressDto.prototype, "landmark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Township for delivery routing.',
        example: 'Botahtaung',
    }),
    __metadata("design:type", String)
], CheckoutPreviewAddressDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'City name.',
        example: 'Yangon',
    }),
    __metadata("design:type", Object)
], CheckoutPreviewAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Postal code.',
        example: '11071',
    }),
    __metadata("design:type", Object)
], CheckoutPreviewAddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional delivery instructions.',
        example: 'Call before arrival',
    }),
    __metadata("design:type", Object)
], CheckoutPreviewAddressDto.prototype, "deliveryInstructions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Latitude serialized as a string.',
        example: '16.834',
    }),
    __metadata("design:type", String)
], CheckoutPreviewAddressDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Longitude serialized as a string.',
        example: '96.176',
    }),
    __metadata("design:type", String)
], CheckoutPreviewAddressDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this address is the default address.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CheckoutPreviewAddressDto.prototype, "isDefault", void 0);
class CheckoutPreviewBranchDto {
}
exports.CheckoutPreviewBranchDto = CheckoutPreviewBranchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], CheckoutPreviewBranchDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant identifier.',
        example: 'merchant_1',
    }),
    __metadata("design:type", String)
], CheckoutPreviewBranchDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant user identifier.',
        example: 'usr_merchant_1',
    }),
    __metadata("design:type", String)
], CheckoutPreviewBranchDto.prototype, "merchantUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant display name.',
        example: 'Merchant One',
    }),
    __metadata("design:type", String)
], CheckoutPreviewBranchDto.prototype, "merchantName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant operational status.',
        example: 'ACTIVE',
    }),
    __metadata("design:type", String)
], CheckoutPreviewBranchDto.prototype, "merchantStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch display name.',
        example: 'Downtown Branch',
    }),
    __metadata("design:type", String)
], CheckoutPreviewBranchDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch township.',
        example: 'Botahtaung',
    }),
    __metadata("design:type", String)
], CheckoutPreviewBranchDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch operational status.',
        example: 'ACTIVE',
    }),
    __metadata("design:type", String)
], CheckoutPreviewBranchDto.prototype, "branchStatus", void 0);
class CheckoutPreviewPricingDto {
}
exports.CheckoutPreviewPricingDto = CheckoutPreviewPricingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code for the checkout preview.',
        example: 'MMK',
    }),
    __metadata("design:type", String)
], CheckoutPreviewPricingDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Subtotal amount serialized as a string.',
        example: '6500',
    }),
    __metadata("design:type", String)
], CheckoutPreviewPricingDto.prototype, "subtotalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Discount amount serialized as a string.',
        example: '0',
    }),
    __metadata("design:type", String)
], CheckoutPreviewPricingDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Delivery fee serialized as a string.',
        example: '0',
    }),
    __metadata("design:type", String)
], CheckoutPreviewPricingDto.prototype, "deliveryFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Final total amount serialized as a string.',
        example: '6500',
    }),
    __metadata("design:type", String)
], CheckoutPreviewPricingDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Applied promotion summary when a valid promotion code affects pricing.',
        type: () => applied_promotion_dto_1.AppliedPromotionDto,
    }),
    __metadata("design:type", Object)
], CheckoutPreviewPricingDto.prototype, "appliedPromotion", void 0);
class CheckoutPreviewDto {
}
exports.CheckoutPreviewDto = CheckoutPreviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code for the checkout preview.',
        example: 'MMK',
    }),
    __metadata("design:type", String)
], CheckoutPreviewDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer context resolved for the checkout preview.',
        type: () => CheckoutPreviewCustomerDto,
    }),
    __metadata("design:type", CheckoutPreviewCustomerDto)
], CheckoutPreviewDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Delivery address used for the checkout preview. Null for PICKUP orders.',
        type: () => CheckoutPreviewAddressDto,
        nullable: true,
    }),
    __metadata("design:type", Object)
], CheckoutPreviewDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch context used for the checkout preview.',
        type: () => CheckoutPreviewBranchDto,
    }),
    __metadata("design:type", CheckoutPreviewBranchDto)
], CheckoutPreviewDto.prototype, "branch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Resolved active cart aggregate used for the checkout preview.',
        type: () => cart_dto_1.CartDto,
    }),
    __metadata("design:type", cart_dto_1.CartDto)
], CheckoutPreviewDto.prototype, "cart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pricing breakdown for the checkout preview.',
        type: () => CheckoutPreviewPricingDto,
    }),
    __metadata("design:type", CheckoutPreviewPricingDto)
], CheckoutPreviewDto.prototype, "pricing", void 0);
function toCheckoutPreviewDto(preview) {
    return {
        currencyCode: preview.currencyCode,
        customer: {
            customerProfileId: preview.customer.customerProfileId,
            userId: preview.customer.userId,
            phone: preview.customer.phone,
            role: preview.customer.role,
            userStatus: preview.customer.userStatus,
            fullName: preview.customer.fullName,
            avatarUrl: preview.customer.avatarUrl,
        },
        address: preview.address === null ? null : {
            addressId: preview.address.addressId,
            label: preview.address.label,
            line1: preview.address.line1,
            line2: preview.address.line2,
            landmark: preview.address.landmark,
            township: preview.address.township,
            city: preview.address.city,
            postalCode: preview.address.postalCode,
            deliveryInstructions: preview.address.deliveryInstructions,
            latitude: preview.address.latitude,
            longitude: preview.address.longitude,
            isDefault: preview.address.isDefault,
        },
        branch: {
            branchId: preview.branch.branchId,
            merchantId: preview.branch.merchantId,
            merchantUserId: preview.branch.merchantUserId,
            merchantName: preview.branch.merchantName,
            merchantStatus: preview.branch.merchantStatus,
            branchName: preview.branch.branchName,
            township: preview.branch.township,
            branchStatus: preview.branch.branchStatus,
        },
        cart: (0, cart_dto_1.toCartDto)(preview.cart),
        pricing: {
            currencyCode: preview.pricing.currencyCode,
            subtotalAmount: preview.pricing.subtotalAmount,
            discountAmount: preview.pricing.discountAmount,
            deliveryFee: preview.pricing.deliveryFee,
            totalAmount: preview.pricing.totalAmount,
            appliedPromotion: (0, applied_promotion_dto_1.toAppliedPromotionDto)(preview.pricing.appliedPromotion),
        },
    };
}
//# sourceMappingURL=checkout-preview.dto.js.map
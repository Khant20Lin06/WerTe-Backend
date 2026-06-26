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
exports.CartDto = exports.CartItemDto = exports.CartSelectedOptionDto = void 0;
exports.toCartDto = toCartDto;
const swagger_1 = require("@nestjs/swagger");
class CartSelectedOptionDto {
}
exports.CartSelectedOptionDto = CartSelectedOptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Selected cart item option identifier.',
        example: 'cart_item_option_1',
    }),
    __metadata("design:type", String)
], CartSelectedOptionDto.prototype, "cartItemOptionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Underlying menu option identifier.',
        example: 'option_1',
    }),
    __metadata("design:type", String)
], CartSelectedOptionDto.prototype, "itemOptionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Underlying menu option display name.',
        example: 'Extra fish cake',
    }),
    __metadata("design:type", String)
], CartSelectedOptionDto.prototype, "itemOptionName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the underlying menu option is still active.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CartSelectedOptionDto.prototype, "itemOptionIsActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group identifier.',
        example: 'group_1',
    }),
    __metadata("design:type", String)
], CartSelectedOptionDto.prototype, "optionGroupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group display name.',
        example: 'Choose extras',
    }),
    __metadata("design:type", String)
], CartSelectedOptionDto.prototype, "optionGroupName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the underlying option group is still active.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CartSelectedOptionDto.prototype, "optionGroupIsActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Snapshot option name persisted with the cart item.',
        example: 'Extra fish cake',
    }),
    __metadata("design:type", String)
], CartSelectedOptionDto.prototype, "nameSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Snapshot price delta persisted with the cart item.',
        example: '500',
    }),
    __metadata("design:type", String)
], CartSelectedOptionDto.prototype, "priceDeltaSnapshot", void 0);
class CartItemDto {
}
exports.CartItemDto = CartItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cart item identifier.',
        example: 'cart_item_1',
    }),
    __metadata("design:type", String)
], CartItemDto.prototype, "cartItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item identifier.',
        example: 'item_1',
    }),
    __metadata("design:type", String)
], CartItemDto.prototype, "menuItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier that owns the menu item.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], CartItemDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional category identifier for the cart item.',
        example: 'cat_1',
    }),
    __metadata("design:type", Object)
], CartItemDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item display name.',
        example: 'Mohinga',
    }),
    __metadata("design:type", String)
], CartItemDto.prototype, "menuItemName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional menu item description.',
        example: 'Signature breakfast item',
    }),
    __metadata("design:type", Object)
], CartItemDto.prototype, "menuItemDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional menu item image URL.',
        example: 'https://cdn.example.com/menu/mohinga.png',
    }),
    __metadata("design:type", Object)
], CartItemDto.prototype, "menuItemImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current base menu price serialized as a string.',
        example: '2500',
    }),
    __metadata("design:type", String)
], CartItemDto.prototype, "menuItemBasePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the underlying menu item is currently available.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CartItemDto.prototype, "menuItemIsAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested cart quantity.',
        example: 2,
    }),
    __metadata("design:type", Number)
], CartItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Persisted unit price snapshot including selected options.',
        example: '3000',
    }),
    __metadata("design:type", String)
], CartItemDto.prototype, "unitPriceSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Persisted line total for this cart item.',
        example: '6000',
    }),
    __metadata("design:type", String)
], CartItemDto.prototype, "lineTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Selected options persisted for this cart item.',
        type: () => CartSelectedOptionDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CartItemDto.prototype, "selectedOptions", void 0);
class CartDto {
}
exports.CartDto = CartDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Active cart identifier. Null when the cart is empty and has not been created yet.',
        example: 'cart_1',
    }),
    __metadata("design:type", Object)
], CartDto.prototype, "cartId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Customer profile identifier that owns the cart.',
        example: 'customer_1',
    }),
    __metadata("design:type", Object)
], CartDto.prototype, "customerProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier for the cart.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], CartDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Merchant identifier that owns the branch.',
        example: 'merchant_1',
    }),
    __metadata("design:type", Object)
], CartDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch display name when an active cart exists.',
        example: 'Downtown Branch',
    }),
    __metadata("design:type", Object)
], CartDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch operational status when available.',
        example: 'ACTIVE',
    }),
    __metadata("design:type", Object)
], CartDto.prototype, "branchStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Merchant operational status when available.',
        example: 'ACTIVE',
    }),
    __metadata("design:type", Object)
], CartDto.prototype, "merchantStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cart lifecycle status.',
        example: 'ACTIVE',
    }),
    __metadata("design:type", String)
], CartDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total quantity across all cart items.',
        example: 3,
    }),
    __metadata("design:type", Number)
], CartDto.prototype, "totalQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cart subtotal serialized as a string.',
        example: '6500',
    }),
    __metadata("design:type", String)
], CartDto.prototype, "subtotalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cart total serialized as a string.',
        example: '6500',
    }),
    __metadata("design:type", String)
], CartDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the cart currently contains no items.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], CartDto.prototype, "isEmpty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Persisted cart items in display order.',
        type: () => CartItemDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CartDto.prototype, "items", void 0);
function toCartSelectedOptionDto(option) {
    return {
        cartItemOptionId: option.cartItemOptionId,
        itemOptionId: option.itemOptionId,
        itemOptionName: option.itemOptionName,
        itemOptionIsActive: option.itemOptionIsActive,
        optionGroupId: option.optionGroupId,
        optionGroupName: option.optionGroupName,
        optionGroupIsActive: option.optionGroupIsActive,
        nameSnapshot: option.nameSnapshot,
        priceDeltaSnapshot: option.priceDeltaSnapshot,
    };
}
function toCartItemDto(item) {
    return {
        cartItemId: item.cartItemId,
        menuItemId: item.menuItemId,
        branchId: item.branchId,
        categoryId: item.categoryId,
        menuItemName: item.menuItemName,
        menuItemDescription: item.menuItemDescription,
        menuItemImageUrl: item.menuItemImageUrl,
        menuItemBasePrice: item.menuItemBasePrice,
        menuItemIsAvailable: item.menuItemIsAvailable,
        quantity: item.quantity,
        unitPriceSnapshot: item.unitPriceSnapshot,
        lineTotal: item.lineTotal,
        selectedOptions: item.selectedOptions.map((option) => toCartSelectedOptionDto(option)),
    };
}
function toCartDto(cart) {
    return {
        cartId: cart.cartId,
        customerProfileId: cart.customerProfileId,
        branchId: cart.branchId,
        merchantId: cart.merchantId,
        branchName: cart.branchName,
        branchStatus: cart.branchStatus,
        merchantStatus: cart.merchantStatus,
        status: cart.status,
        totalQuantity: cart.totalQuantity,
        subtotalAmount: cart.subtotalAmount,
        totalAmount: cart.totalAmount,
        isEmpty: cart.isEmpty,
        items: cart.items.map((item) => toCartItemDto(item)),
    };
}
//# sourceMappingURL=cart.dto.js.map
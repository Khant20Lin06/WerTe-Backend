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
exports.MerchantInventoryOverviewDto = exports.MerchantInventoryAttentionOptionDto = exports.MerchantInventoryAttentionItemDto = exports.MerchantInventoryOverviewTotalsDto = exports.MerchantInventoryAttentionLevel = void 0;
const swagger_1 = require("@nestjs/swagger");
var MerchantInventoryAttentionLevel;
(function (MerchantInventoryAttentionLevel) {
    MerchantInventoryAttentionLevel["LOW_STOCK"] = "LOW_STOCK";
    MerchantInventoryAttentionLevel["OUT_OF_STOCK"] = "OUT_OF_STOCK";
})(MerchantInventoryAttentionLevel || (exports.MerchantInventoryAttentionLevel = MerchantInventoryAttentionLevel = {}));
class MerchantInventoryOverviewTotalsDto {
}
exports.MerchantInventoryOverviewTotalsDto = MerchantInventoryOverviewTotalsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tracked menu items in the branch.',
        example: 14,
    }),
    __metadata("design:type", Number)
], MerchantInventoryOverviewTotalsDto.prototype, "trackedItemCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tracked menu items currently below or at threshold but still in stock.',
        example: 3,
    }),
    __metadata("design:type", Number)
], MerchantInventoryOverviewTotalsDto.prototype, "lowStockItemCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tracked menu items that are out of stock.',
        example: 1,
    }),
    __metadata("design:type", Number)
], MerchantInventoryOverviewTotalsDto.prototype, "outOfStockItemCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tracked item options in the branch.',
        example: 8,
    }),
    __metadata("design:type", Number)
], MerchantInventoryOverviewTotalsDto.prototype, "trackedOptionCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tracked item options currently below or at threshold but still in stock.',
        example: 2,
    }),
    __metadata("design:type", Number)
], MerchantInventoryOverviewTotalsDto.prototype, "lowStockOptionCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tracked item options that are out of stock.',
        example: 1,
    }),
    __metadata("design:type", Number)
], MerchantInventoryOverviewTotalsDto.prototype, "outOfStockOptionCount", void 0);
class MerchantInventoryAttentionItemDto {
}
exports.MerchantInventoryAttentionItemDto = MerchantInventoryAttentionItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Item identifier.',
        example: 'item_1',
    }),
    __metadata("design:type", String)
], MerchantInventoryAttentionItemDto.prototype, "itemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional category identifier.',
        example: 'cat_1',
    }),
    __metadata("design:type", Object)
], MerchantInventoryAttentionItemDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional category name.',
        example: 'Popular',
    }),
    __metadata("design:type", Object)
], MerchantInventoryAttentionItemDto.prototype, "categoryName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item display name.',
        example: 'Mohinga',
    }),
    __metadata("design:type", String)
], MerchantInventoryAttentionItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional item SKU.',
        example: 'SKU-MHG-001',
    }),
    __metadata("design:type", Object)
], MerchantInventoryAttentionItemDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current tracked stock quantity.',
        example: 2,
        nullable: true,
    }),
    __metadata("design:type", Object)
], MerchantInventoryAttentionItemDto.prototype, "stockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Low-stock threshold.',
        example: 3,
    }),
    __metadata("design:type", Object)
], MerchantInventoryAttentionItemDto.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Attention level derived from tracked stock state.',
        enum: MerchantInventoryAttentionLevel,
    }),
    __metadata("design:type", String)
], MerchantInventoryAttentionItemDto.prototype, "attentionLevel", void 0);
class MerchantInventoryAttentionOptionDto {
}
exports.MerchantInventoryAttentionOptionDto = MerchantInventoryAttentionOptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option identifier.',
        example: 'option_1',
    }),
    __metadata("design:type", String)
], MerchantInventoryAttentionOptionDto.prototype, "optionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Parent option group identifier.',
        example: 'group_1',
    }),
    __metadata("design:type", String)
], MerchantInventoryAttentionOptionDto.prototype, "optionGroupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Parent option group name.',
        example: 'Choose extras',
    }),
    __metadata("design:type", String)
], MerchantInventoryAttentionOptionDto.prototype, "optionGroupName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Parent menu item identifier.',
        example: 'item_1',
    }),
    __metadata("design:type", String)
], MerchantInventoryAttentionOptionDto.prototype, "menuItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Parent menu item display name.',
        example: 'Mohinga',
    }),
    __metadata("design:type", String)
], MerchantInventoryAttentionOptionDto.prototype, "menuItemName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option display name.',
        example: 'Extra fish cake',
    }),
    __metadata("design:type", String)
], MerchantInventoryAttentionOptionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current tracked stock quantity.',
        example: 0,
        nullable: true,
    }),
    __metadata("design:type", Object)
], MerchantInventoryAttentionOptionDto.prototype, "stockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Low-stock threshold.',
        example: 2,
    }),
    __metadata("design:type", Object)
], MerchantInventoryAttentionOptionDto.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Attention level derived from tracked stock state.',
        enum: MerchantInventoryAttentionLevel,
    }),
    __metadata("design:type", String)
], MerchantInventoryAttentionOptionDto.prototype, "attentionLevel", void 0);
class MerchantInventoryOverviewDto {
}
exports.MerchantInventoryOverviewDto = MerchantInventoryOverviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], MerchantInventoryOverviewDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch display name.',
        example: 'Downtown Branch',
    }),
    __metadata("design:type", String)
], MerchantInventoryOverviewDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch township.',
        example: 'Botahtaung',
    }),
    __metadata("design:type", String)
], MerchantInventoryOverviewDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tracked inventory totals and attention counts.',
        type: MerchantInventoryOverviewTotalsDto,
    }),
    __metadata("design:type", MerchantInventoryOverviewTotalsDto)
], MerchantInventoryOverviewDto.prototype, "totals", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tracked menu items requiring attention.',
        type: MerchantInventoryAttentionItemDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], MerchantInventoryOverviewDto.prototype, "attentionItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tracked item options requiring attention.',
        type: MerchantInventoryAttentionOptionDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], MerchantInventoryOverviewDto.prototype, "attentionOptions", void 0);
//# sourceMappingURL=merchant-inventory-overview.dto.js.map
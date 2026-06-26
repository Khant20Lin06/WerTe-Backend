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
exports.MerchantRestockSuggestionsDto = exports.MerchantRestockSuggestionOptionDto = exports.MerchantRestockSuggestionItemDto = exports.MerchantRestockSuggestionSummaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const merchant_inventory_overview_dto_1 = require("./merchant-inventory-overview.dto");
class MerchantRestockSuggestionSummaryDto {
}
exports.MerchantRestockSuggestionSummaryDto = MerchantRestockSuggestionSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total tracked menu items that currently need restocking.',
        example: 3,
    }),
    __metadata("design:type", Number)
], MerchantRestockSuggestionSummaryDto.prototype, "itemSuggestionCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total tracked item options that currently need restocking.',
        example: 2,
    }),
    __metadata("design:type", Number)
], MerchantRestockSuggestionSummaryDto.prototype, "optionSuggestionCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Combined suggestion count across items and options.',
        example: 5,
    }),
    __metadata("design:type", Number)
], MerchantRestockSuggestionSummaryDto.prototype, "totalSuggestionCount", void 0);
class MerchantRestockSuggestionItemDto {
}
exports.MerchantRestockSuggestionItemDto = MerchantRestockSuggestionItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item identifier.',
        example: 'item_1',
    }),
    __metadata("design:type", String)
], MerchantRestockSuggestionItemDto.prototype, "itemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional category identifier.',
        example: 'cat_1',
    }),
    __metadata("design:type", Object)
], MerchantRestockSuggestionItemDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional category name.',
        example: 'Popular',
    }),
    __metadata("design:type", Object)
], MerchantRestockSuggestionItemDto.prototype, "categoryName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item name.',
        example: 'Mohinga',
    }),
    __metadata("design:type", String)
], MerchantRestockSuggestionItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional merchant SKU.',
        example: 'SKU-MHG-001',
    }),
    __metadata("design:type", Object)
], MerchantRestockSuggestionItemDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current tracked stock quantity.',
        example: 2,
        nullable: true,
    }),
    __metadata("design:type", Object)
], MerchantRestockSuggestionItemDto.prototype, "currentStockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Configured low-stock threshold.',
        example: 3,
    }),
    __metadata("design:type", Object)
], MerchantRestockSuggestionItemDto.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Suggested target stock quantity after restocking.',
        example: 6,
    }),
    __metadata("design:type", Number)
], MerchantRestockSuggestionItemDto.prototype, "targetStockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Suggested quantity to add back into stock.',
        example: 4,
    }),
    __metadata("design:type", Number)
], MerchantRestockSuggestionItemDto.prototype, "suggestedRestockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current attention level for this inventory row.',
        enum: merchant_inventory_overview_dto_1.MerchantInventoryAttentionLevel,
    }),
    __metadata("design:type", String)
], MerchantRestockSuggestionItemDto.prototype, "attentionLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Most recent adjustment timestamp for this inventory row.',
        example: '2026-05-01T10:00:00.000Z',
    }),
    __metadata("design:type", Object)
], MerchantRestockSuggestionItemDto.prototype, "lastAdjustedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Most recent adjustment reason code for this inventory row.',
        example: 'manual_restock_after_return',
    }),
    __metadata("design:type", Object)
], MerchantRestockSuggestionItemDto.prototype, "lastAdjustmentReasonCode", void 0);
class MerchantRestockSuggestionOptionDto {
}
exports.MerchantRestockSuggestionOptionDto = MerchantRestockSuggestionOptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Item option identifier.',
        example: 'option_1',
    }),
    __metadata("design:type", String)
], MerchantRestockSuggestionOptionDto.prototype, "optionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Parent option group identifier.',
        example: 'group_1',
    }),
    __metadata("design:type", String)
], MerchantRestockSuggestionOptionDto.prototype, "optionGroupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Parent option group name.',
        example: 'Choose extras',
    }),
    __metadata("design:type", String)
], MerchantRestockSuggestionOptionDto.prototype, "optionGroupName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Parent menu item identifier.',
        example: 'item_1',
    }),
    __metadata("design:type", String)
], MerchantRestockSuggestionOptionDto.prototype, "menuItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Parent menu item name.',
        example: 'Mohinga',
    }),
    __metadata("design:type", String)
], MerchantRestockSuggestionOptionDto.prototype, "menuItemName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option display name.',
        example: 'Extra fish cake',
    }),
    __metadata("design:type", String)
], MerchantRestockSuggestionOptionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current tracked stock quantity.',
        example: 1,
        nullable: true,
    }),
    __metadata("design:type", Object)
], MerchantRestockSuggestionOptionDto.prototype, "currentStockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Configured low-stock threshold.',
        example: 2,
    }),
    __metadata("design:type", Object)
], MerchantRestockSuggestionOptionDto.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Suggested target stock quantity after restocking.',
        example: 4,
    }),
    __metadata("design:type", Number)
], MerchantRestockSuggestionOptionDto.prototype, "targetStockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Suggested quantity to add back into stock.',
        example: 3,
    }),
    __metadata("design:type", Number)
], MerchantRestockSuggestionOptionDto.prototype, "suggestedRestockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current attention level for this option inventory row.',
        enum: merchant_inventory_overview_dto_1.MerchantInventoryAttentionLevel,
    }),
    __metadata("design:type", String)
], MerchantRestockSuggestionOptionDto.prototype, "attentionLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Most recent adjustment timestamp for this option row.',
        example: '2026-05-01T10:00:00.000Z',
    }),
    __metadata("design:type", Object)
], MerchantRestockSuggestionOptionDto.prototype, "lastAdjustedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Most recent adjustment reason code for this option row.',
        example: 'manual_writeoff_damaged_stock',
    }),
    __metadata("design:type", Object)
], MerchantRestockSuggestionOptionDto.prototype, "lastAdjustmentReasonCode", void 0);
class MerchantRestockSuggestionsDto {
}
exports.MerchantRestockSuggestionsDto = MerchantRestockSuggestionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], MerchantRestockSuggestionsDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch display name.',
        example: 'Downtown Branch',
    }),
    __metadata("design:type", String)
], MerchantRestockSuggestionsDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp used when the suggestions were generated.',
        example: '2026-05-01T10:00:00.000Z',
    }),
    __metadata("design:type", String)
], MerchantRestockSuggestionsDto.prototype, "generatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Suggestion summary counts.',
        type: MerchantRestockSuggestionSummaryDto,
    }),
    __metadata("design:type", MerchantRestockSuggestionSummaryDto)
], MerchantRestockSuggestionsDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tracked menu item restock suggestions.',
        type: MerchantRestockSuggestionItemDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], MerchantRestockSuggestionsDto.prototype, "itemSuggestions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tracked item option restock suggestions.',
        type: MerchantRestockSuggestionOptionDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], MerchantRestockSuggestionsDto.prototype, "optionSuggestions", void 0);
//# sourceMappingURL=merchant-restock-suggestions.dto.js.map
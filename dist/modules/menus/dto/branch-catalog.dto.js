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
exports.BranchCatalogDto = exports.CatalogMenuCategoryDto = exports.CatalogMenuItemDto = exports.CatalogOptionGroupDto = exports.CatalogOptionDto = void 0;
exports.toBranchCatalogDto = toBranchCatalogDto;
const swagger_1 = require("@nestjs/swagger");
class CatalogOptionDto {
}
exports.CatalogOptionDto = CatalogOptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Catalog option identifier.',
        example: 'option_1',
    }),
    __metadata("design:type", String)
], CatalogOptionDto.prototype, "optionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option display name.',
        example: 'Thin rice noodle',
    }),
    __metadata("design:type", String)
], CatalogOptionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Price delta serialized as string.',
        example: '500',
    }),
    __metadata("design:type", String)
], CatalogOptionDto.prototype, "priceDelta", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option sort order within the option group.',
        example: 0,
    }),
    __metadata("design:type", Number)
], CatalogOptionDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the option is active.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CatalogOptionDto.prototype, "isActive", void 0);
class CatalogOptionGroupDto {
}
exports.CatalogOptionGroupDto = CatalogOptionGroupDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Catalog option group identifier.',
        example: 'group_1',
    }),
    __metadata("design:type", String)
], CatalogOptionGroupDto.prototype, "optionGroupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group display name.',
        example: 'Choose noodle type',
    }),
    __metadata("design:type", String)
], CatalogOptionGroupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional option group description.',
        example: 'Required selection',
    }),
    __metadata("design:type", Object)
], CatalogOptionGroupDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum required selections.',
        example: 1,
    }),
    __metadata("design:type", Number)
], CatalogOptionGroupDto.prototype, "minSelect", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum allowed selections.',
        example: 1,
    }),
    __metadata("design:type", Number)
], CatalogOptionGroupDto.prototype, "maxSelect", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group sort order within the menu item.',
        example: 0,
    }),
    __metadata("design:type", Number)
], CatalogOptionGroupDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the option group is active.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CatalogOptionGroupDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Visible options within the option group.',
        type: () => CatalogOptionDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CatalogOptionGroupDto.prototype, "options", void 0);
class CatalogMenuItemDto {
}
exports.CatalogMenuItemDto = CatalogMenuItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Catalog menu item identifier.',
        example: 'item_1',
    }),
    __metadata("design:type", String)
], CatalogMenuItemDto.prototype, "itemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional category identifier for the item.',
        example: 'cat_1',
    }),
    __metadata("design:type", Object)
], CatalogMenuItemDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item display name.',
        example: 'Mohinga',
    }),
    __metadata("design:type", String)
], CatalogMenuItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional item description.',
        example: 'Signature breakfast item',
    }),
    __metadata("design:type", Object)
], CatalogMenuItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional item image URL.',
        example: 'https://cdn.example.com/menu/mohinga.png',
    }),
    __metadata("design:type", Object)
], CatalogMenuItemDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Base price serialized as string.',
        example: '2500',
    }),
    __metadata("design:type", String)
], CatalogMenuItemDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Item sort order within the branch or category.',
        example: 1,
    }),
    __metadata("design:type", Number)
], CatalogMenuItemDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the item is currently available for ordering.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CatalogMenuItemDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Visible option groups within the item.',
        type: () => CatalogOptionGroupDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CatalogMenuItemDto.prototype, "optionGroups", void 0);
class CatalogMenuCategoryDto {
}
exports.CatalogMenuCategoryDto = CatalogMenuCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Catalog category identifier.',
        example: 'cat_1',
    }),
    __metadata("design:type", String)
], CatalogMenuCategoryDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category display name.',
        example: 'Popular',
    }),
    __metadata("design:type", String)
], CatalogMenuCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional category description.',
        example: 'Most ordered items',
    }),
    __metadata("design:type", Object)
], CatalogMenuCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category sort order within the branch.',
        example: 0,
    }),
    __metadata("design:type", Number)
], CatalogMenuCategoryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the category is active.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CatalogMenuCategoryDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Visible items in the category.',
        type: () => CatalogMenuItemDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CatalogMenuCategoryDto.prototype, "items", void 0);
class BranchCatalogDto {
}
exports.BranchCatalogDto = BranchCatalogDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], BranchCatalogDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant identifier that owns the branch.',
        example: 'merchant_1',
    }),
    __metadata("design:type", String)
], BranchCatalogDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant user identifier that owns the branch.',
        example: 'usr_merchant_1',
    }),
    __metadata("design:type", String)
], BranchCatalogDto.prototype, "merchantUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch display name.',
        example: 'Downtown Branch',
    }),
    __metadata("design:type", String)
], BranchCatalogDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch township for display and locality context.',
        example: 'Botahtaung',
    }),
    __metadata("design:type", String)
], BranchCatalogDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current branch status.',
        example: 'ACTIVE',
    }),
    __metadata("design:type", String)
], BranchCatalogDto.prototype, "branchStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Visible categories for the branch catalog.',
        type: () => CatalogMenuCategoryDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], BranchCatalogDto.prototype, "categories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Visible items without a category.',
        type: () => CatalogMenuItemDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], BranchCatalogDto.prototype, "uncategorizedItems", void 0);
function toCatalogOptionDto(option) {
    return {
        optionId: option.optionId,
        name: option.name,
        priceDelta: option.priceDelta,
        sortOrder: option.sortOrder,
        isActive: option.isActive,
    };
}
function toCatalogOptionGroupDto(group) {
    return {
        optionGroupId: group.optionGroupId,
        name: group.name,
        description: group.description,
        minSelect: group.minSelect,
        maxSelect: group.maxSelect,
        sortOrder: group.sortOrder,
        isActive: group.isActive,
        options: group.options.map((option) => toCatalogOptionDto(option)),
    };
}
function toCatalogMenuItemDto(item) {
    return {
        itemId: item.itemId,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        basePrice: item.basePrice,
        sortOrder: item.sortOrder,
        isAvailable: item.isAvailable,
        optionGroups: item.optionGroups.map((group) => toCatalogOptionGroupDto(group)),
    };
}
function toCatalogMenuCategoryDto(category) {
    return {
        categoryId: category.categoryId,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        items: category.items.map((item) => toCatalogMenuItemDto(item)),
    };
}
function toBranchCatalogDto(branchCatalog) {
    return {
        branchId: branchCatalog.branchId,
        merchantId: branchCatalog.merchantId,
        merchantUserId: branchCatalog.merchantUserId,
        branchName: branchCatalog.branchName,
        township: branchCatalog.township,
        branchStatus: branchCatalog.branchStatus,
        categories: branchCatalog.categories.map((category) => toCatalogMenuCategoryDto(category)),
        uncategorizedItems: branchCatalog.uncategorizedItems.map((item) => toCatalogMenuItemDto(item)),
    };
}
//# sourceMappingURL=branch-catalog.dto.js.map
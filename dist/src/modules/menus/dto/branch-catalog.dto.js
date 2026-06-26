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
exports.BranchCatalogDto = exports.CatalogMenuCategoryDto = exports.CatalogMenuItemDto = exports.CatalogVariantCombinationDto = exports.CatalogVariantCombinationSelectionDto = exports.CatalogOptionGroupDto = exports.CatalogOptionDto = void 0;
exports.toBranchCatalogDto = toBranchCatalogDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const menu_scoped_store_type_dto_1 = require("./menu-scoped-store-type.dto");
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
        description: 'Whether stock is tracked for the option-level variant or add-on.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CatalogOptionDto.prototype, "isStockTracked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current option stock quantity when tracking is enabled.',
        example: 4,
        nullable: true,
    }),
    __metadata("design:type", Object)
], CatalogOptionDto.prototype, "stockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Low-stock threshold when tracking is enabled.',
        example: 1,
        nullable: true,
    }),
    __metadata("design:type", Object)
], CatalogOptionDto.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the option has stock available or is not tracked.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CatalogOptionDto.prototype, "isInStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the tracked quantity is at or below the threshold.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], CatalogOptionDto.prototype, "isLowStock", void 0);
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
        description: 'Whether the option group behaves as an add-on picker or variant selector.',
        enum: client_1.ItemOptionGroupKind,
        example: client_1.ItemOptionGroupKind.VARIANT_SELECTOR,
    }),
    __metadata("design:type", String)
], CatalogOptionGroupDto.prototype, "kind", void 0);
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
class CatalogVariantCombinationSelectionDto {
}
exports.CatalogVariantCombinationSelectionDto = CatalogVariantCombinationSelectionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option identifier that participates in the variant combination.',
        example: 'option_size_s',
    }),
    __metadata("design:type", String)
], CatalogVariantCombinationSelectionDto.prototype, "optionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Selected option display name.',
        example: 'Small',
    }),
    __metadata("design:type", String)
], CatalogVariantCombinationSelectionDto.prototype, "optionName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option sort order within its option group.',
        example: 0,
    }),
    __metadata("design:type", Number)
], CatalogVariantCombinationSelectionDto.prototype, "optionSortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group identifier for the selected option.',
        example: 'group_size',
    }),
    __metadata("design:type", String)
], CatalogVariantCombinationSelectionDto.prototype, "optionGroupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group display name.',
        example: 'Size',
    }),
    __metadata("design:type", String)
], CatalogVariantCombinationSelectionDto.prototype, "optionGroupName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group sort order within the menu item.',
        example: 0,
    }),
    __metadata("design:type", Number)
], CatalogVariantCombinationSelectionDto.prototype, "optionGroupSortOrder", void 0);
class CatalogVariantCombinationDto {
}
exports.CatalogVariantCombinationDto = CatalogVariantCombinationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Variant combination identifier.',
        example: 'variant_combo_1',
    }),
    __metadata("design:type", String)
], CatalogVariantCombinationDto.prototype, "combinationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant-facing combination label.',
        example: 'Small / Red / Cotton',
    }),
    __metadata("design:type", String)
], CatalogVariantCombinationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional branch-local SKU for the combination.',
        example: 'SKU-TSHIRT-S-RED-COTTON',
    }),
    __metadata("design:type", Object)
], CatalogVariantCombinationDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether stock is tracked for the full variant combination.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CatalogVariantCombinationDto.prototype, "isStockTracked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current tracked stock quantity when enabled.',
        example: 6,
        nullable: true,
    }),
    __metadata("design:type", Object)
], CatalogVariantCombinationDto.prototype, "stockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Low-stock threshold when combination-level stock tracking is enabled.',
        example: 2,
        nullable: true,
    }),
    __metadata("design:type", Object)
], CatalogVariantCombinationDto.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the combination has stock available or is not tracked.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CatalogVariantCombinationDto.prototype, "isInStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the tracked quantity is at or below the threshold.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], CatalogVariantCombinationDto.prototype, "isLowStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Combination sort order within the menu item.',
        example: 0,
    }),
    __metadata("design:type", Number)
], CatalogVariantCombinationDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the combination is active.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CatalogVariantCombinationDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Selected variant options that make up the combination.',
        type: () => CatalogVariantCombinationSelectionDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CatalogVariantCombinationDto.prototype, "selectedOptions", void 0);
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
        description: 'Additional product image URLs.',
        example: ['https://cdn.example.com/products/cleanser-front.png'],
        type: [String],
    }),
    __metadata("design:type", Array)
], CatalogMenuItemDto.prototype, "imageUrls", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch-local stock keeping unit.',
        example: 'SKU-CLEANSER-100ML',
    }),
    __metadata("design:type", Object)
], CatalogMenuItemDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Barcode, UPC, EAN, or local scan code.',
        example: '8851234567890',
    }),
    __metadata("design:type", Object)
], CatalogMenuItemDto.prototype, "barcode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Product brand.',
        example: 'Glow Lab',
    }),
    __metadata("design:type", Object)
], CatalogMenuItemDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Flexible product attributes.',
        example: {
            size: '100ml',
            skinType: 'oily',
        },
        type: Object,
    }),
    __metadata("design:type", Object)
], CatalogMenuItemDto.prototype, "attributes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Base price serialized as string.',
        example: '2500',
    }),
    __metadata("design:type", String)
], CatalogMenuItemDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether branch-level stock tracking is enabled for this item.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CatalogMenuItemDto.prototype, "isStockTracked", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Current stock quantity when stock tracking is enabled.',
        example: 24,
    }),
    __metadata("design:type", Object)
], CatalogMenuItemDto.prototype, "stockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Low-stock alert threshold for merchant operations.',
        example: 5,
    }),
    __metadata("design:type", Object)
], CatalogMenuItemDto.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the item has stock available or is not stock-tracked.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CatalogMenuItemDto.prototype, "isInStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the tracked stock quantity is at or below the threshold.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], CatalogMenuItemDto.prototype, "isLowStock", void 0);
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
        description: 'Approved store types this item is scoped to. An empty array means the item is visible across all approved store types for the branch.',
        type: () => menu_scoped_store_type_dto_1.MenuScopedStoreTypeDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CatalogMenuItemDto.prototype, "storeTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Visible option groups within the item.',
        type: () => CatalogOptionGroupDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CatalogMenuItemDto.prototype, "optionGroups", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Visible full variant combinations defined for the item.',
        type: () => CatalogVariantCombinationDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CatalogMenuItemDto.prototype, "variantCombinations", void 0);
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
        description: 'Approved store types this category is scoped to. An empty array means the category is visible across all approved store types for the branch.',
        type: () => menu_scoped_store_type_dto_1.MenuScopedStoreTypeDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CatalogMenuCategoryDto.prototype, "storeTypes", void 0);
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
        isStockTracked: option.isStockTracked,
        stockQuantity: option.stockQuantity ?? null,
        lowStockThreshold: option.lowStockThreshold ?? null,
        isInStock: option.isInStock,
        isLowStock: option.isLowStock,
        sortOrder: option.sortOrder,
        isActive: option.isActive,
    };
}
function toCatalogOptionGroupDto(group) {
    return {
        optionGroupId: group.optionGroupId,
        name: group.name,
        description: group.description,
        kind: group.kind,
        minSelect: group.minSelect,
        maxSelect: group.maxSelect,
        sortOrder: group.sortOrder,
        isActive: group.isActive,
        options: group.options.map((option) => toCatalogOptionDto(option)),
    };
}
function toCatalogVariantCombinationSelectionDto(selectedOption) {
    return {
        optionId: selectedOption.optionId,
        optionName: selectedOption.optionName,
        optionSortOrder: selectedOption.optionSortOrder,
        optionGroupId: selectedOption.optionGroupId,
        optionGroupName: selectedOption.optionGroupName,
        optionGroupSortOrder: selectedOption.optionGroupSortOrder,
    };
}
function toCatalogVariantCombinationDto(combination) {
    return {
        combinationId: combination.combinationId,
        name: combination.name,
        sku: combination.sku,
        isStockTracked: combination.isStockTracked,
        stockQuantity: combination.stockQuantity ?? null,
        lowStockThreshold: combination.lowStockThreshold ?? null,
        isInStock: combination.isInStock,
        isLowStock: combination.isLowStock,
        sortOrder: combination.sortOrder,
        isActive: combination.isActive,
        selectedOptions: combination.selectedOptions.map((selectedOption) => toCatalogVariantCombinationSelectionDto(selectedOption)),
    };
}
function toCatalogMenuItemDto(item) {
    return {
        itemId: item.itemId,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        imageUrls: item.imageUrls,
        sku: item.sku,
        barcode: item.barcode,
        brand: item.brand,
        attributes: item.attributes,
        basePrice: item.basePrice,
        isStockTracked: item.isStockTracked,
        stockQuantity: item.stockQuantity,
        lowStockThreshold: item.lowStockThreshold,
        isInStock: item.isInStock,
        isLowStock: item.isLowStock,
        sortOrder: item.sortOrder,
        isAvailable: item.isAvailable,
        storeTypes: item.scopedStoreTypes.map((storeType) => ({
            id: storeType.id,
            code: storeType.code,
            name: storeType.name,
            sortOrder: storeType.sortOrder,
        })),
        optionGroups: item.optionGroups.map((group) => toCatalogOptionGroupDto(group)),
        variantCombinations: item.variantCombinations.map((combination) => toCatalogVariantCombinationDto(combination)),
    };
}
function toCatalogMenuCategoryDto(category) {
    return {
        categoryId: category.categoryId,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        storeTypes: category.scopedStoreTypes.map((storeType) => ({
            id: storeType.id,
            code: storeType.code,
            name: storeType.name,
            sortOrder: storeType.sortOrder,
        })),
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
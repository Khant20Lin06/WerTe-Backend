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
exports.MerchantMenuScopeOverviewDto = exports.MerchantMenuItemScopeSummaryDto = exports.MerchantMenuCategoryScopeSummaryDto = exports.MerchantMenuScopeUsageDto = exports.MerchantMenuScopeTotalsDto = exports.MerchantMenuScopeMode = void 0;
exports.toMerchantMenuScopeOverviewDto = toMerchantMenuScopeOverviewDto;
const swagger_1 = require("@nestjs/swagger");
const menu_scoped_store_type_dto_1 = require("./menu-scoped-store-type.dto");
var MerchantMenuScopeMode;
(function (MerchantMenuScopeMode) {
    MerchantMenuScopeMode["ALL_APPROVED_STORE_TYPES"] = "ALL_APPROVED_STORE_TYPES";
    MerchantMenuScopeMode["SELECTED_STORE_TYPES"] = "SELECTED_STORE_TYPES";
})(MerchantMenuScopeMode || (exports.MerchantMenuScopeMode = MerchantMenuScopeMode = {}));
class MerchantMenuScopeTotalsDto {
}
exports.MerchantMenuScopeTotalsDto = MerchantMenuScopeTotalsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total categories in the branch catalog.',
        example: 4,
    }),
    __metadata("design:type", Number)
], MerchantMenuScopeTotalsDto.prototype, "totalCategories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Categories explicitly scoped to selected store types.',
        example: 2,
    }),
    __metadata("design:type", Number)
], MerchantMenuScopeTotalsDto.prototype, "scopedCategories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Categories visible across all approved store types.',
        example: 2,
    }),
    __metadata("design:type", Number)
], MerchantMenuScopeTotalsDto.prototype, "unscopedCategories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total items in the branch catalog.',
        example: 12,
    }),
    __metadata("design:type", Number)
], MerchantMenuScopeTotalsDto.prototype, "totalItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Items explicitly scoped to selected store types.',
        example: 5,
    }),
    __metadata("design:type", Number)
], MerchantMenuScopeTotalsDto.prototype, "scopedItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Items visible across all approved store types.',
        example: 7,
    }),
    __metadata("design:type", Number)
], MerchantMenuScopeTotalsDto.prototype, "unscopedItems", void 0);
class MerchantMenuScopeUsageDto {
}
exports.MerchantMenuScopeUsageDto = MerchantMenuScopeUsageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Approved branch store type.',
        type: menu_scoped_store_type_dto_1.MenuScopedStoreTypeDto,
    }),
    __metadata("design:type", menu_scoped_store_type_dto_1.MenuScopedStoreTypeDto)
], MerchantMenuScopeUsageDto.prototype, "storeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of categories explicitly scoped to this store type.',
        example: 2,
    }),
    __metadata("design:type", Number)
], MerchantMenuScopeUsageDto.prototype, "scopedCategoryCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items explicitly scoped to this store type.',
        example: 5,
    }),
    __metadata("design:type", Number)
], MerchantMenuScopeUsageDto.prototype, "scopedItemCount", void 0);
class MerchantMenuCategoryScopeSummaryDto {
}
exports.MerchantMenuCategoryScopeSummaryDto = MerchantMenuCategoryScopeSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category identifier.',
        example: 'cat_1',
    }),
    __metadata("design:type", String)
], MerchantMenuCategoryScopeSummaryDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category display name.',
        example: 'Popular',
    }),
    __metadata("design:type", String)
], MerchantMenuCategoryScopeSummaryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category sort order.',
        example: 0,
    }),
    __metadata("design:type", Number)
], MerchantMenuCategoryScopeSummaryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the category is active.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], MerchantMenuCategoryScopeSummaryDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the category is visible to all approved store types or a selected subset.',
        enum: MerchantMenuScopeMode,
    }),
    __metadata("design:type", String)
], MerchantMenuCategoryScopeSummaryDto.prototype, "scopeMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Selected approved store types when the category is explicitly scoped. Empty means visible across all approved store types.',
        type: menu_scoped_store_type_dto_1.MenuScopedStoreTypeDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], MerchantMenuCategoryScopeSummaryDto.prototype, "storeTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items currently attached to the category.',
        example: 3,
    }),
    __metadata("design:type", Number)
], MerchantMenuCategoryScopeSummaryDto.prototype, "itemCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of attached items with explicit store type scopes.',
        example: 2,
    }),
    __metadata("design:type", Number)
], MerchantMenuCategoryScopeSummaryDto.prototype, "scopedItemCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of attached items visible across all approved store types.',
        example: 1,
    }),
    __metadata("design:type", Number)
], MerchantMenuCategoryScopeSummaryDto.prototype, "unscopedItemCount", void 0);
class MerchantMenuItemScopeSummaryDto {
}
exports.MerchantMenuItemScopeSummaryDto = MerchantMenuItemScopeSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item identifier.',
        example: 'item_1',
    }),
    __metadata("design:type", String)
], MerchantMenuItemScopeSummaryDto.prototype, "itemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional category identifier.',
        example: 'cat_1',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MerchantMenuItemScopeSummaryDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional category display name.',
        example: 'Popular',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MerchantMenuItemScopeSummaryDto.prototype, "categoryName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item display name.',
        example: 'Mohinga',
    }),
    __metadata("design:type", String)
], MerchantMenuItemScopeSummaryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item sort order.',
        example: 1,
    }),
    __metadata("design:type", Number)
], MerchantMenuItemScopeSummaryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the item is currently available.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], MerchantMenuItemScopeSummaryDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether stock tracking is enabled for the item.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], MerchantMenuItemScopeSummaryDto.prototype, "isStockTracked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the item is currently in stock.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], MerchantMenuItemScopeSummaryDto.prototype, "isInStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the tracked quantity is currently low.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], MerchantMenuItemScopeSummaryDto.prototype, "isLowStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the item is visible to all approved store types or a selected subset.',
        enum: MerchantMenuScopeMode,
    }),
    __metadata("design:type", String)
], MerchantMenuItemScopeSummaryDto.prototype, "scopeMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Selected approved store types when the item is explicitly scoped. Empty means visible across all approved store types.',
        type: menu_scoped_store_type_dto_1.MenuScopedStoreTypeDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], MerchantMenuItemScopeSummaryDto.prototype, "storeTypes", void 0);
class MerchantMenuScopeOverviewDto {
}
exports.MerchantMenuScopeOverviewDto = MerchantMenuScopeOverviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], MerchantMenuScopeOverviewDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch display name.',
        example: 'Downtown Branch',
    }),
    __metadata("design:type", String)
], MerchantMenuScopeOverviewDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch township for operational context.',
        example: 'Botahtaung',
    }),
    __metadata("design:type", String)
], MerchantMenuScopeOverviewDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Approved active store types that can be used for scoping in this branch.',
        type: menu_scoped_store_type_dto_1.MenuScopedStoreTypeDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], MerchantMenuScopeOverviewDto.prototype, "approvedStoreTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'High-level scope totals across categories and items.',
        type: MerchantMenuScopeTotalsDto,
    }),
    __metadata("design:type", MerchantMenuScopeTotalsDto)
], MerchantMenuScopeOverviewDto.prototype, "totals", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Explicit scope usage counts per approved store type.',
        type: MerchantMenuScopeUsageDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], MerchantMenuScopeOverviewDto.prototype, "storeTypeUsage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category-level scope summary rows for merchant management screens.',
        type: MerchantMenuCategoryScopeSummaryDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], MerchantMenuScopeOverviewDto.prototype, "categories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Item-level scope summary rows for merchant management screens.',
        type: MerchantMenuItemScopeSummaryDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], MerchantMenuScopeOverviewDto.prototype, "items", void 0);
function toMerchantMenuScopeOverviewDto(branchCatalog) {
    const approvedStoreTypes = branchCatalog.approvedStoreTypes.map((storeType) => ({
        id: storeType.id,
        code: storeType.code,
        name: storeType.name,
        sortOrder: storeType.sortOrder,
    }));
    const categories = branchCatalog.categories.map((category) => {
        const scopedItemCount = category.items.filter((item) => item.scopedStoreTypes.length > 0).length;
        return {
            categoryId: category.categoryId,
            name: category.name,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
            scopeMode: toScopeMode(category.scopedStoreTypes),
            storeTypes: category.scopedStoreTypes.map((storeType) => ({
                id: storeType.id,
                code: storeType.code,
                name: storeType.name,
                sortOrder: storeType.sortOrder,
            })),
            itemCount: category.items.length,
            scopedItemCount,
            unscopedItemCount: category.items.length - scopedItemCount,
        };
    });
    const items = [
        ...branchCatalog.categories.flatMap((category) => category.items.map((item) => ({
            itemId: item.itemId,
            categoryId: category.categoryId,
            categoryName: category.name,
            name: item.name,
            sortOrder: item.sortOrder,
            isAvailable: item.isAvailable,
            isStockTracked: item.isStockTracked,
            isInStock: item.isInStock,
            isLowStock: item.isLowStock,
            scopeMode: toScopeMode(item.scopedStoreTypes),
            storeTypes: item.scopedStoreTypes.map((storeType) => ({
                id: storeType.id,
                code: storeType.code,
                name: storeType.name,
                sortOrder: storeType.sortOrder,
            })),
        }))),
        ...branchCatalog.uncategorizedItems.map((item) => ({
            itemId: item.itemId,
            categoryId: null,
            categoryName: null,
            name: item.name,
            sortOrder: item.sortOrder,
            isAvailable: item.isAvailable,
            isStockTracked: item.isStockTracked,
            isInStock: item.isInStock,
            isLowStock: item.isLowStock,
            scopeMode: toScopeMode(item.scopedStoreTypes),
            storeTypes: item.scopedStoreTypes.map((storeType) => ({
                id: storeType.id,
                code: storeType.code,
                name: storeType.name,
                sortOrder: storeType.sortOrder,
            })),
        })),
    ];
    const totalCategories = categories.length;
    const scopedCategories = categories.filter((category) => category.scopeMode === MerchantMenuScopeMode.SELECTED_STORE_TYPES).length;
    const totalItems = items.length;
    const scopedItems = items.filter((item) => item.scopeMode === MerchantMenuScopeMode.SELECTED_STORE_TYPES).length;
    const storeTypeUsage = approvedStoreTypes.map((storeType) => ({
        storeType,
        scopedCategoryCount: categories.filter((category) => category.storeTypes.some((assignedStoreType) => assignedStoreType.id === storeType.id)).length,
        scopedItemCount: items.filter((item) => item.storeTypes.some((assignedStoreType) => assignedStoreType.id === storeType.id)).length,
    }));
    return {
        branchId: branchCatalog.branchId,
        branchName: branchCatalog.branchName,
        township: branchCatalog.township,
        approvedStoreTypes,
        totals: {
            totalCategories,
            scopedCategories,
            unscopedCategories: totalCategories - scopedCategories,
            totalItems,
            scopedItems,
            unscopedItems: totalItems - scopedItems,
        },
        storeTypeUsage,
        categories,
        items,
    };
}
function toScopeMode(storeTypes) {
    return storeTypes.length === 0
        ? MerchantMenuScopeMode.ALL_APPROVED_STORE_TYPES
        : MerchantMenuScopeMode.SELECTED_STORE_TYPES;
}
//# sourceMappingURL=merchant-menu-scope-overview.dto.js.map
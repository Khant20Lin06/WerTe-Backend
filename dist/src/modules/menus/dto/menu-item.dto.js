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
exports.MenuItemDto = void 0;
exports.toMenuItemDto = toMenuItemDto;
const swagger_1 = require("@nestjs/swagger");
const menu_scoped_store_type_dto_1 = require("./menu-scoped-store-type.dto");
class MenuItemDto {
}
exports.MenuItemDto = MenuItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item identifier.',
        example: 'item_1',
    }),
    __metadata("design:type", String)
], MenuItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier that owns the item.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], MenuItemDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional category identifier for the item.',
        example: 'cat_1',
    }),
    __metadata("design:type", Object)
], MenuItemDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item display name.',
        example: 'Mohinga',
    }),
    __metadata("design:type", String)
], MenuItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional menu item description.',
        example: 'Signature breakfast item',
    }),
    __metadata("design:type", Object)
], MenuItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional image URL for the item.',
        example: 'https://cdn.example.com/menu/mohinga.png',
    }),
    __metadata("design:type", Object)
], MenuItemDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional product image URLs.',
        example: ['https://cdn.example.com/products/cleanser-front.png'],
        type: [String],
    }),
    __metadata("design:type", Array)
], MenuItemDto.prototype, "imageUrls", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch-local stock keeping unit.',
        example: 'SKU-CLEANSER-100ML',
    }),
    __metadata("design:type", Object)
], MenuItemDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Barcode, UPC, EAN, or local scan code.',
        example: '8851234567890',
    }),
    __metadata("design:type", Object)
], MenuItemDto.prototype, "barcode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Product brand.',
        example: 'Glow Lab',
    }),
    __metadata("design:type", Object)
], MenuItemDto.prototype, "brand", void 0);
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
], MenuItemDto.prototype, "attributes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Base price serialized as string.',
        example: '2500',
    }),
    __metadata("design:type", String)
], MenuItemDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether branch-level stock tracking is enabled for this item.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], MenuItemDto.prototype, "isStockTracked", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Current stock quantity when stock tracking is enabled.',
        example: 24,
    }),
    __metadata("design:type", Object)
], MenuItemDto.prototype, "stockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Low-stock alert threshold for merchant operations.',
        example: 5,
    }),
    __metadata("design:type", Object)
], MenuItemDto.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the item has stock available or is not stock-tracked.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], MenuItemDto.prototype, "isInStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the tracked stock quantity is at or below the threshold.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], MenuItemDto.prototype, "isLowStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch-local sort order for the item.',
        example: 1,
    }),
    __metadata("design:type", Number)
], MenuItemDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the item is available for ordering.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], MenuItemDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Approved store types this item is scoped to. An empty array means the item is visible across all approved store types for the branch.',
        type: menu_scoped_store_type_dto_1.MenuScopedStoreTypeDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], MenuItemDto.prototype, "storeTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Item creation timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], MenuItemDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Item last update timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], MenuItemDto.prototype, "updatedAt", void 0);
function toMenuItemDto(item) {
    return {
        id: item.id,
        branchId: item.branch.id,
        categoryId: item.category?.id ?? null,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        imageUrls: toStringArray(item.imageUrlsJson),
        sku: item.sku,
        barcode: item.barcode,
        brand: item.brand,
        attributes: toJsonObject(item.attributesJson),
        basePrice: item.basePrice.toString(),
        isStockTracked: item.isStockTracked,
        stockQuantity: item.stockQuantity,
        lowStockThreshold: item.lowStockThreshold,
        isInStock: isInStock(item),
        isLowStock: isLowStock(item),
        sortOrder: item.sortOrder,
        isAvailable: item.isAvailable,
        storeTypes: item.storeTypes.map((assignment) => ({
            id: assignment.storeType.id,
            code: assignment.storeType.code,
            name: assignment.storeType.name,
            sortOrder: assignment.storeType.sortOrder,
        })),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    };
}
function isInStock(item) {
    if (!item.isStockTracked) {
        return true;
    }
    return (item.stockQuantity ?? 0) > 0;
}
function isLowStock(item) {
    if (!item.isStockTracked || item.stockQuantity === null || item.lowStockThreshold === null) {
        return false;
    }
    return item.stockQuantity <= item.lowStockThreshold;
}
function toStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item) => typeof item === 'string');
}
function toJsonObject(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    return value;
}
//# sourceMappingURL=menu-item.dto.js.map
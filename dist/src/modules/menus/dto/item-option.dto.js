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
exports.ItemOptionDto = void 0;
exports.toItemOptionDto = toItemOptionDto;
const swagger_1 = require("@nestjs/swagger");
class ItemOptionDto {
}
exports.ItemOptionDto = ItemOptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Item option identifier.',
        example: 'option_1',
    }),
    __metadata("design:type", String)
], ItemOptionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier that owns the option.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], ItemOptionDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item identifier that owns the option.',
        example: 'item_1',
    }),
    __metadata("design:type", String)
], ItemOptionDto.prototype, "menuItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group identifier that owns the option.',
        example: 'group_1',
    }),
    __metadata("design:type", String)
], ItemOptionDto.prototype, "optionGroupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option display name.',
        example: 'Thin rice noodle',
    }),
    __metadata("design:type", String)
], ItemOptionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Price delta serialized as string.',
        example: '0',
    }),
    __metadata("design:type", String)
], ItemOptionDto.prototype, "priceDelta", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether option-level stock tracking is enabled.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], ItemOptionDto.prototype, "isStockTracked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current option stock quantity when tracking is enabled.',
        example: 8,
        nullable: true,
    }),
    __metadata("design:type", Object)
], ItemOptionDto.prototype, "stockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Low-stock threshold when tracking is enabled.',
        example: 2,
        nullable: true,
    }),
    __metadata("design:type", Object)
], ItemOptionDto.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the option has stock available or is not tracked.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], ItemOptionDto.prototype, "isInStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the tracked quantity is at or below the threshold.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], ItemOptionDto.prototype, "isLowStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option-group-local sort order for the option.',
        example: 0,
    }),
    __metadata("design:type", Number)
], ItemOptionDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the option is active.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], ItemOptionDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option creation timestamp.',
        example: '2026-04-19T09:00:00.000Z',
    }),
    __metadata("design:type", String)
], ItemOptionDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option last update timestamp.',
        example: '2026-04-19T09:00:00.000Z',
    }),
    __metadata("design:type", String)
], ItemOptionDto.prototype, "updatedAt", void 0);
function toItemOptionDto(option) {
    return {
        id: option.id,
        branchId: option.group.menuItem.branch.id,
        menuItemId: option.group.menuItem.id,
        optionGroupId: option.group.id,
        name: option.name,
        priceDelta: option.priceDelta.toString(),
        isStockTracked: option.isStockTracked,
        stockQuantity: option.stockQuantity ?? null,
        lowStockThreshold: option.lowStockThreshold ?? null,
        isInStock: isInStock(option),
        isLowStock: isLowStock(option),
        sortOrder: option.sortOrder,
        isActive: option.isActive,
        createdAt: option.createdAt.toISOString(),
        updatedAt: option.updatedAt.toISOString(),
    };
}
function isInStock(option) {
    if (!option.isStockTracked) {
        return true;
    }
    return (option.stockQuantity ?? 0) > 0;
}
function isLowStock(option) {
    if (!option.isStockTracked ||
        option.stockQuantity === null ||
        option.lowStockThreshold === null) {
        return false;
    }
    return option.stockQuantity <= option.lowStockThreshold;
}
//# sourceMappingURL=item-option.dto.js.map
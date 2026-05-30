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
        description: 'Base price serialized as string.',
        example: '2500',
    }),
    __metadata("design:type", String)
], MenuItemDto.prototype, "basePrice", void 0);
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
        basePrice: item.basePrice.toString(),
        sortOrder: item.sortOrder,
        isAvailable: item.isAvailable,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=menu-item.dto.js.map
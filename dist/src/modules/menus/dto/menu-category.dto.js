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
exports.MenuCategoryDto = void 0;
exports.toMenuCategoryDto = toMenuCategoryDto;
const swagger_1 = require("@nestjs/swagger");
const menu_scoped_store_type_dto_1 = require("./menu-scoped-store-type.dto");
class MenuCategoryDto {
}
exports.MenuCategoryDto = MenuCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu category identifier.',
        example: 'cat_1',
    }),
    __metadata("design:type", String)
], MenuCategoryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier that owns the category.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], MenuCategoryDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category display name.',
        example: 'Popular',
    }),
    __metadata("design:type", String)
], MenuCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional category description.',
        example: 'Most ordered items',
    }),
    __metadata("design:type", Object)
], MenuCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category ordering value within the branch catalog.',
        example: 1,
    }),
    __metadata("design:type", Number)
], MenuCategoryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the category is visible in active catalog reads.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], MenuCategoryDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Approved store types this category is scoped to. An empty array means the category is visible across all approved store types for the branch.',
        type: menu_scoped_store_type_dto_1.MenuScopedStoreTypeDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], MenuCategoryDto.prototype, "storeTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category creation timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], MenuCategoryDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category last update timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], MenuCategoryDto.prototype, "updatedAt", void 0);
function toMenuCategoryDto(category) {
    return {
        id: category.id,
        branchId: category.branch.id,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        storeTypes: category.storeTypes.map((assignment) => ({
            id: assignment.storeType.id,
            code: assignment.storeType.code,
            name: assignment.storeType.name,
            sortOrder: assignment.storeType.sortOrder,
        })),
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=menu-category.dto.js.map
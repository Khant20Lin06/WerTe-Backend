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
exports.ItemVariantCombinationDto = exports.ItemVariantCombinationSelectedOptionDto = void 0;
exports.toItemVariantCombinationDto = toItemVariantCombinationDto;
const swagger_1 = require("@nestjs/swagger");
const item_variant_combination_ownership_entity_1 = require("../entities/item-variant-combination-ownership.entity");
class ItemVariantCombinationSelectedOptionDto {
}
exports.ItemVariantCombinationSelectedOptionDto = ItemVariantCombinationSelectedOptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Item option identifier that participates in the combination.',
        example: 'option_size_s',
    }),
    __metadata("design:type", String)
], ItemVariantCombinationSelectedOptionDto.prototype, "optionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Selected option display name.',
        example: 'Small',
    }),
    __metadata("design:type", String)
], ItemVariantCombinationSelectedOptionDto.prototype, "optionName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option sort order within its option group.',
        example: 0,
    }),
    __metadata("design:type", Number)
], ItemVariantCombinationSelectedOptionDto.prototype, "optionSortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group identifier that owns the selected option.',
        example: 'group_size',
    }),
    __metadata("design:type", String)
], ItemVariantCombinationSelectedOptionDto.prototype, "optionGroupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group display name.',
        example: 'Size',
    }),
    __metadata("design:type", String)
], ItemVariantCombinationSelectedOptionDto.prototype, "optionGroupName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group sort order within the menu item.',
        example: 0,
    }),
    __metadata("design:type", Number)
], ItemVariantCombinationSelectedOptionDto.prototype, "optionGroupSortOrder", void 0);
class ItemVariantCombinationDto {
}
exports.ItemVariantCombinationDto = ItemVariantCombinationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Variant combination identifier.',
        example: 'variant_combo_1',
    }),
    __metadata("design:type", String)
], ItemVariantCombinationDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier that owns the combination.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], ItemVariantCombinationDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item identifier that owns the combination.',
        example: 'item_1',
    }),
    __metadata("design:type", String)
], ItemVariantCombinationDto.prototype, "menuItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant-facing combination label.',
        example: 'Small / Red / Cotton',
    }),
    __metadata("design:type", String)
], ItemVariantCombinationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional branch-local SKU for the combination.',
        example: 'SKU-TSHIRT-S-RED-COTTON',
    }),
    __metadata("design:type", Object)
], ItemVariantCombinationDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether stock is tracked at the full combination level.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], ItemVariantCombinationDto.prototype, "isStockTracked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current tracked stock quantity when enabled.',
        example: 6,
        nullable: true,
    }),
    __metadata("design:type", Object)
], ItemVariantCombinationDto.prototype, "stockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Low-stock threshold when combination stock tracking is enabled.',
        example: 2,
        nullable: true,
    }),
    __metadata("design:type", Object)
], ItemVariantCombinationDto.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the combination has stock available or is not stock-tracked.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], ItemVariantCombinationDto.prototype, "isInStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the tracked stock quantity is at or below the threshold.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], ItemVariantCombinationDto.prototype, "isLowStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu-item-local sort order for the combination.',
        example: 0,
    }),
    __metadata("design:type", Number)
], ItemVariantCombinationDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the combination is active.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], ItemVariantCombinationDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Selected variant options that make up the combination.',
        type: () => ItemVariantCombinationSelectedOptionDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], ItemVariantCombinationDto.prototype, "selectedOptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Combination creation timestamp.',
        example: '2026-05-02T10:00:00.000Z',
    }),
    __metadata("design:type", String)
], ItemVariantCombinationDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Combination last update timestamp.',
        example: '2026-05-02T10:00:00.000Z',
    }),
    __metadata("design:type", String)
], ItemVariantCombinationDto.prototype, "updatedAt", void 0);
function toItemVariantCombinationDto(combination) {
    const entity = (0, item_variant_combination_ownership_entity_1.buildItemVariantCombinationOwnership)(combination);
    return {
        id: combination.id,
        branchId: entity.branchId,
        menuItemId: entity.menuItemId,
        name: entity.name,
        sku: entity.sku ?? null,
        isStockTracked: entity.isStockTracked,
        stockQuantity: entity.stockQuantity ?? null,
        lowStockThreshold: entity.lowStockThreshold ?? null,
        isInStock: entity.isInStock,
        isLowStock: entity.isLowStock,
        sortOrder: entity.sortOrder,
        isActive: entity.isActive,
        selectedOptions: entity.selectedOptions.map((selectedOption) => ({
            optionId: selectedOption.optionId,
            optionName: selectedOption.optionName,
            optionSortOrder: selectedOption.optionSortOrder,
            optionGroupId: selectedOption.optionGroupId,
            optionGroupName: selectedOption.optionGroupName,
            optionGroupSortOrder: selectedOption.optionGroupSortOrder,
        })),
        createdAt: combination.createdAt.toISOString(),
        updatedAt: combination.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=item-variant-combination.dto.js.map
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
exports.ItemOptionGroupDto = void 0;
exports.toItemOptionGroupDto = toItemOptionGroupDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class ItemOptionGroupDto {
}
exports.ItemOptionGroupDto = ItemOptionGroupDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Item option group identifier.',
        example: 'group_1',
    }),
    __metadata("design:type", String)
], ItemOptionGroupDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier that owns the option group.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], ItemOptionGroupDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item identifier that owns the option group.',
        example: 'item_1',
    }),
    __metadata("design:type", String)
], ItemOptionGroupDto.prototype, "menuItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group display name.',
        example: 'Choose noodle type',
    }),
    __metadata("design:type", String)
], ItemOptionGroupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional option group description.',
        example: 'Required for all noodle dishes',
    }),
    __metadata("design:type", Object)
], ItemOptionGroupDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this group behaves as an add-on picker or variant selector.',
        enum: client_1.ItemOptionGroupKind,
        example: client_1.ItemOptionGroupKind.ADD_ON,
    }),
    __metadata("design:type", String)
], ItemOptionGroupDto.prototype, "kind", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum required selections.',
        example: 1,
    }),
    __metadata("design:type", Number)
], ItemOptionGroupDto.prototype, "minSelect", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum allowed selections.',
        example: 1,
    }),
    __metadata("design:type", Number)
], ItemOptionGroupDto.prototype, "maxSelect", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu-item-local sort order for the option group.',
        example: 0,
    }),
    __metadata("design:type", Number)
], ItemOptionGroupDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the option group is active.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], ItemOptionGroupDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group creation timestamp.',
        example: '2026-04-19T09:00:00.000Z',
    }),
    __metadata("design:type", String)
], ItemOptionGroupDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group last update timestamp.',
        example: '2026-04-19T09:00:00.000Z',
    }),
    __metadata("design:type", String)
], ItemOptionGroupDto.prototype, "updatedAt", void 0);
function toItemOptionGroupDto(group) {
    return {
        id: group.id,
        branchId: group.menuItem.branch.id,
        menuItemId: group.menuItem.id,
        name: group.name,
        description: group.description,
        kind: group.kind,
        minSelect: group.minSelect,
        maxSelect: group.maxSelect,
        sortOrder: group.sortOrder,
        isActive: group.isActive,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=item-option-group.dto.js.map
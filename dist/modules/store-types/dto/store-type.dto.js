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
exports.StoreTypeDto = void 0;
exports.toStoreTypeDto = toStoreTypeDto;
const swagger_1 = require("@nestjs/swagger");
class StoreTypeDto {
}
exports.StoreTypeDto = StoreTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store type identifier.',
        example: 'store_type_restaurant',
    }),
    __metadata("design:type", String)
], StoreTypeDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Short unique code used across catalog and branch workflows.',
        example: 'restaurant',
    }),
    __metadata("design:type", String)
], StoreTypeDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Human-readable store type name.',
        example: 'Restaurant',
    }),
    __metadata("design:type", String)
], StoreTypeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional store type description.',
        example: 'Prepared food and beverage merchants.',
    }),
    __metadata("design:type", Object)
], StoreTypeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional store type icon url.',
        example: 'https://cdn.example.com/icons/restaurant.svg',
    }),
    __metadata("design:type", Object)
], StoreTypeDto.prototype, "iconUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this store type is currently available for assignment.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], StoreTypeDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this store type is part of the system seed registry.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], StoreTypeDto.prototype, "isSystem", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Presentation sort order.',
        example: 10,
    }),
    __metadata("design:type", Number)
], StoreTypeDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of branch store type assignments referencing this store type.',
        example: 24,
    }),
    __metadata("design:type", Number)
], StoreTypeDto.prototype, "branchAssignmentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of branches currently using this store type as primary.',
        example: 8,
    }),
    __metadata("design:type", Number)
], StoreTypeDto.prototype, "branchPrimaryCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of merchants currently using this store type as primary.',
        example: 4,
    }),
    __metadata("design:type", Number)
], StoreTypeDto.prototype, "merchantPrimaryCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Soft-delete timestamp when archived.',
        example: '2026-04-30T08:00:00.000Z',
    }),
    __metadata("design:type", Object)
], StoreTypeDto.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp.',
        example: '2026-04-30T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], StoreTypeDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp.',
        example: '2026-04-30T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], StoreTypeDto.prototype, "updatedAt", void 0);
function toStoreTypeDto(storeType) {
    return {
        id: storeType.id,
        code: storeType.code,
        name: storeType.name,
        description: storeType.description,
        iconUrl: storeType.iconUrl,
        isActive: storeType.isActive,
        isSystem: storeType.isSystem,
        sortOrder: storeType.sortOrder,
        branchAssignmentCount: storeType._count.branchAssignments,
        branchPrimaryCount: storeType._count.branchPrimaries,
        merchantPrimaryCount: storeType._count.merchantPrimaries,
        deletedAt: storeType.deletedAt ? new Date(storeType.deletedAt).toISOString() : null,
        createdAt: new Date(storeType.createdAt).toISOString(),
        updatedAt: new Date(storeType.updatedAt).toISOString(),
    };
}
//# sourceMappingURL=store-type.dto.js.map
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
exports.AvailableStoreTypeDto = void 0;
exports.toAvailableStoreTypeDto = toAvailableStoreTypeDto;
const swagger_1 = require("@nestjs/swagger");
class AvailableStoreTypeDto {
}
exports.AvailableStoreTypeDto = AvailableStoreTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store type identifier.',
        example: 'store_type_grocery',
    }),
    __metadata("design:type", String)
], AvailableStoreTypeDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Short unique store type code.',
        example: 'grocery',
    }),
    __metadata("design:type", String)
], AvailableStoreTypeDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Human-readable store type name.',
        example: 'Grocery',
    }),
    __metadata("design:type", String)
], AvailableStoreTypeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional store type description.',
        example: 'Retail grocery and pantry storefronts.',
    }),
    __metadata("design:type", Object)
], AvailableStoreTypeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional store type icon url.',
        example: 'https://cdn.example.com/icons/grocery.svg',
    }),
    __metadata("design:type", Object)
], AvailableStoreTypeDto.prototype, "iconUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Presentation sort order.',
        example: 20,
    }),
    __metadata("design:type", Number)
], AvailableStoreTypeDto.prototype, "sortOrder", void 0);
function toAvailableStoreTypeDto(storeType) {
    return {
        id: storeType.id,
        code: storeType.code,
        name: storeType.name,
        description: storeType.description,
        iconUrl: storeType.iconUrl,
        sortOrder: storeType.sortOrder,
    };
}
//# sourceMappingURL=available-store-type.dto.js.map
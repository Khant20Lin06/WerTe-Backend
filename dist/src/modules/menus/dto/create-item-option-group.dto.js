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
exports.CreateItemOptionGroupDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateItemOptionGroupDto {
}
exports.CreateItemOptionGroupDto = CreateItemOptionGroupDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option group display name.',
        example: 'Choose noodle type',
        maxLength: 160,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], CreateItemOptionGroupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional option group description.',
        example: 'Required for all noodle dishes',
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateItemOptionGroupDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Group behavior. Use VARIANT_SELECTOR for size, shade, pack size, or similar sellable variants.',
        enum: client_1.ItemOptionGroupKind,
        example: client_1.ItemOptionGroupKind.VARIANT_SELECTOR,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ItemOptionGroupKind),
    __metadata("design:type", String)
], CreateItemOptionGroupDto.prototype, "kind", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum required selections.',
        example: 1,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateItemOptionGroupDto.prototype, "minSelect", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum allowed selections.',
        example: 1,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateItemOptionGroupDto.prototype, "maxSelect", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Explicit sort order within the menu item. When omitted, the next slot is assigned automatically.',
        example: 2,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateItemOptionGroupDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the option group is active.',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateItemOptionGroupDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-item-option-group.dto.js.map
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
exports.AddCartItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class AddCartItemDto {
}
exports.AddCartItemDto = AddCartItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier that owns the cart and menu item.',
        example: 'branch_1',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], AddCartItemDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Menu item identifier to add into the cart.',
        example: 'item_1',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], AddCartItemDto.prototype, "menuItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested quantity for the cart item.',
        example: 2,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AddCartItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional item option identifiers selected for the cart item.',
        example: ['option_1', 'option_2'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(191, { each: true }),
    __metadata("design:type", Array)
], AddCartItemDto.prototype, "selectedOptionIds", void 0);
//# sourceMappingURL=add-cart-item.dto.js.map
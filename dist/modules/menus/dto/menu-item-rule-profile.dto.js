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
exports.MenuItemRuleProfileDto = void 0;
exports.toMenuItemRuleProfileDto = toMenuItemRuleProfileDto;
const swagger_1 = require("@nestjs/swagger");
class MenuItemRuleProfileDto {
}
exports.MenuItemRuleProfileDto = MenuItemRuleProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'store_type_pharmacy' }),
    __metadata("design:type", String)
], MenuItemRuleProfileDto.prototype, "storeTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'pharmacy' }),
    __metadata("design:type", String)
], MenuItemRuleProfileDto.prototype, "storeTypeCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pharmacy' }),
    __metadata("design:type", String)
], MenuItemRuleProfileDto.prototype, "storeTypeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20 }),
    __metadata("design:type", Number)
], MenuItemRuleProfileDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['sku', 'brand'],
        type: [String],
    }),
    __metadata("design:type", Array)
], MenuItemRuleProfileDto.prototype, "requiredFields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], MenuItemRuleProfileDto.prototype, "requiresStockTracking", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['dosageStrength', 'dosageForm', 'packSize'],
        type: [String],
    }),
    __metadata("design:type", Array)
], MenuItemRuleProfileDto.prototype, "requiredAttributeKeysAnyOf", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['Pharmacy items should identify dosage or pack metadata before they are published.'],
        type: [String],
    }),
    __metadata("design:type", Array)
], MenuItemRuleProfileDto.prototype, "notes", void 0);
function toMenuItemRuleProfileDto(profile) {
    return {
        storeTypeId: profile.storeTypeId,
        storeTypeCode: profile.storeTypeCode,
        storeTypeName: profile.storeTypeName,
        sortOrder: profile.sortOrder,
        requiredFields: profile.requiredFields,
        requiresStockTracking: profile.requiresStockTracking,
        requiredAttributeKeysAnyOf: profile.requiredAttributeKeysAnyOf,
        notes: profile.notes,
    };
}
//# sourceMappingURL=menu-item-rule-profile.dto.js.map
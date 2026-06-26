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
exports.UpdateMerchantInventoryAlertPreferenceDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
function transformOptionalBoolean(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true') {
            return true;
        }
        if (normalized === 'false') {
            return false;
        }
    }
    return undefined;
}
function transformOptionalString(value) {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value !== 'string') {
        return undefined;
    }
    const normalized = value.trim();
    return normalized.length === 0 ? '' : normalized;
}
class UpdateMerchantInventoryAlertPreferenceDto {
}
exports.UpdateMerchantInventoryAlertPreferenceDto = UpdateMerchantInventoryAlertPreferenceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: true,
        description: 'When false, merchant inventory alert push deliveries are disabled and in-app remains the only active channel.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => transformOptionalBoolean(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMerchantInventoryAlertPreferenceDto.prototype, "inventoryAlertPushEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: true,
        description: 'When true, quiet hours are evaluated before queueing merchant inventory alert push deliveries.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => transformOptionalBoolean(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMerchantInventoryAlertPreferenceDto.prototype, "inventoryAlertQuietHoursEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '22:00',
        description: 'Quiet-hours local start time in HH:mm format.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => transformOptionalString(value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/),
    __metadata("design:type", String)
], UpdateMerchantInventoryAlertPreferenceDto.prototype, "inventoryAlertQuietHoursStartLocalTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '06:00',
        description: 'Quiet-hours local end time in HH:mm format.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => transformOptionalString(value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/),
    __metadata("design:type", String)
], UpdateMerchantInventoryAlertPreferenceDto.prototype, "inventoryAlertQuietHoursEndLocalTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Asia/Bangkok',
        description: 'IANA timezone used to evaluate the quiet-hours local window.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => transformOptionalString(value)),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMerchantInventoryAlertPreferenceDto.prototype, "inventoryAlertQuietHoursTimezone", void 0);
//# sourceMappingURL=update-merchant-inventory-alert-preference.dto.js.map
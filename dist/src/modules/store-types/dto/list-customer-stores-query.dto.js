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
exports.ListCustomerStoresQueryDto = exports.CustomerStoreSortBy = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var CustomerStoreSortBy;
(function (CustomerStoreSortBy) {
    CustomerStoreSortBy["NAME_ASC"] = "NAME_ASC";
    CustomerStoreSortBy["NAME_DESC"] = "NAME_DESC";
    CustomerStoreSortBy["TOWNSHIP_ASC"] = "TOWNSHIP_ASC";
    CustomerStoreSortBy["TOWNSHIP_DESC"] = "TOWNSHIP_DESC";
    CustomerStoreSortBy["MERCHANT_NAME_ASC"] = "MERCHANT_NAME_ASC";
})(CustomerStoreSortBy || (exports.CustomerStoreSortBy = CustomerStoreSortBy = {}));
function toOptionalStringArray(value) {
    if (value === undefined || value === null) {
        return undefined;
    }
    const values = Array.isArray(value) ? value : [value];
    const normalizedValues = values
        .flatMap((entry) => typeof entry === 'string' ? entry.split(',') : [])
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    return normalizedValues.length > 0 ? normalizedValues : undefined;
}
class ListCustomerStoresQueryDto {
}
exports.ListCustomerStoresQueryDto = ListCustomerStoresQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional dynamic store type code filter.',
        example: 'grocery',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], ListCustomerStoresQueryDto.prototype, "storeTypeCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional multi-select dynamic store type codes. Accepts repeated query params or comma-separated values.',
        example: ['grocery', 'pharmacy'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => toOptionalStringArray(value)),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(80, { each: true }),
    __metadata("design:type", Array)
], ListCustomerStoresQueryDto.prototype, "storeTypeCodes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional township filter.',
        example: 'Kamaryut',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], ListCustomerStoresQueryDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional keyword filter applied to branch, merchant, and township names.',
        example: 'city mart',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], ListCustomerStoresQueryDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional merchant identifier filter.',
        example: 'merchant_1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], ListCustomerStoresQueryDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional branch identifier filter.',
        example: 'branch_1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], ListCustomerStoresQueryDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional discovery sort mode.',
        enum: CustomerStoreSortBy,
        example: CustomerStoreSortBy.NAME_ASC,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CustomerStoreSortBy),
    __metadata("design:type", String)
], ListCustomerStoresQueryDto.prototype, "sortBy", void 0);
//# sourceMappingURL=list-customer-stores-query.dto.js.map
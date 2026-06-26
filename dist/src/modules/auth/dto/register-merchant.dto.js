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
exports.RegisterMerchantDto = exports.VALID_STORE_TYPE_CODES = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
exports.VALID_STORE_TYPE_CODES = [
    'restaurant',
    'grocery',
    'pharmacy',
    'beauty',
    'fashion',
];
class RegisterMerchantDto {
}
exports.RegisterMerchantDto = RegisterMerchantDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant owner phone number used for authentication.',
        example: '+959123456780',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\+?[0-9]{7,15}$/, {
        message: 'phone must be a valid phone number (7-15 digits, optional + prefix)',
    }),
    (0, class_validator_1.MaxLength)(16),
    __metadata("design:type", String)
], RegisterMerchantDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Password credential for the merchant owner account.',
        example: 'Merchant@1234',
        minLength: 6,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], RegisterMerchantDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant business display name.',
        example: 'Tea House',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], RegisterMerchantDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Merchant support phone number.',
        example: '+95942000000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(32),
    __metadata("design:type", String)
], RegisterMerchantDto.prototype, "supportPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Requested primary store type code.',
        enum: exports.VALID_STORE_TYPE_CODES,
        example: 'restaurant',
        default: 'restaurant',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([...exports.VALID_STORE_TYPE_CODES], {
        message: `storeType must be one of: ${exports.VALID_STORE_TYPE_CODES.join(', ')}`,
    }),
    __metadata("design:type", String)
], RegisterMerchantDto.prototype, "storeType", void 0);
//# sourceMappingURL=register-merchant.dto.js.map
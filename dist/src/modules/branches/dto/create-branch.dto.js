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
exports.CreateBranchDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const register_merchant_dto_1 = require("../../auth/dto/register-merchant.dto");
class CreateBranchDto {
}
exports.CreateBranchDto = CreateBranchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch display name.',
        example: 'Downtown Branch',
        maxLength: 160,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch contact phone number.',
        example: '0942000000',
        maxLength: 32,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(32),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "contactPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Primary branch address line.',
        example: 'No. 10, Merchant Street',
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "line1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch township.',
        example: 'Botahtaung',
        maxLength: 120,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch latitude coordinate.',
        example: 16.7792,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBranchDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch longitude coordinate.',
        example: 96.1735,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBranchDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dynamic store type code for this branch. Defaults to the merchant store type when omitted.',
        enum: register_merchant_dto_1.VALID_STORE_TYPE_CODES,
        example: 'restaurant',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([...register_merchant_dto_1.VALID_STORE_TYPE_CODES], {
        message: `storeType must be one of: ${register_merchant_dto_1.VALID_STORE_TYPE_CODES.join(', ')}`,
    }),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "storeType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch operational status.',
        enum: client_1.BranchStatus,
        example: client_1.BranchStatus.INACTIVE,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.BranchStatus),
    __metadata("design:type", String)
], CreateBranchDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Zone identifiers assigned to this branch.',
        example: ['zone_1', 'zone_2'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateBranchDto.prototype, "zoneIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Weekly operating hours. Keys are lowercase weekday names (mon–sun). ' +
            'Each value has open (bool), openTime and closeTime as "HH:mm" strings.',
        example: {
            mon: { open: true, openTime: '09:00', closeTime: '22:00' },
            sun: { open: false },
        },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateBranchDto.prototype, "operatingHours", void 0);
//# sourceMappingURL=create-branch.dto.js.map
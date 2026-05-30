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
exports.MerchantProfileDto = void 0;
exports.toMerchantProfileDto = toMerchantProfileDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class MerchantProfileDto {
}
exports.MerchantProfileDto = MerchantProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant identifier.',
        example: 'merchant_1',
    }),
    __metadata("design:type", String)
], MerchantProfileDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant business display name.',
        example: 'Tea House',
    }),
    __metadata("design:type", String)
], MerchantProfileDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Primary merchant account phone number.',
        example: '0999999999',
    }),
    __metadata("design:type", String)
], MerchantProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Merchant support phone number.',
        example: '0942000000',
    }),
    __metadata("design:type", Object)
], MerchantProfileDto.prototype, "supportPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant onboarding or operational status.',
        enum: client_1.MerchantStatus,
        example: client_1.MerchantStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], MerchantProfileDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant creation timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], MerchantProfileDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant last update timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], MerchantProfileDto.prototype, "updatedAt", void 0);
function toMerchantProfileDto(merchant) {
    return {
        id: merchant.id,
        name: merchant.name,
        phone: merchant.user.phone,
        supportPhone: merchant.supportPhone,
        status: merchant.status,
        createdAt: merchant.createdAt.toISOString(),
        updatedAt: merchant.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=merchant-profile.dto.js.map
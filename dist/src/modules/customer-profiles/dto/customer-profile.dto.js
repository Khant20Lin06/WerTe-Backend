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
exports.CustomerProfileDto = void 0;
exports.toCustomerProfileDto = toCustomerProfileDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CustomerProfileDto {
}
exports.CustomerProfileDto = CustomerProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer profile identifier.',
        example: 'cust_prof_1',
    }),
    __metadata("design:type", String)
], CustomerProfileDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Primary customer phone number.',
        example: '09123456789',
    }),
    __metadata("design:type", String)
], CustomerProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Customer display name.',
        example: 'Mg Mg',
    }),
    __metadata("design:type", Object)
], CustomerProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Customer avatar URL.',
        example: 'https://cdn.example.com/avatar/customer-1.png',
    }),
    __metadata("design:type", Object)
], CustomerProfileDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current account status of the customer.',
        enum: client_1.UserStatus,
        example: client_1.UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], CustomerProfileDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Profile creation timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], CustomerProfileDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Profile last update timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], CustomerProfileDto.prototype, "updatedAt", void 0);
function toCustomerProfileDto(profile) {
    return {
        id: profile.id,
        phone: profile.user.phone,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        status: profile.user.status,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=customer-profile.dto.js.map
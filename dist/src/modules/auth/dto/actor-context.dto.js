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
exports.ActorContextDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class ActorContextDto {
}
exports.ActorContextDto = ActorContextDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Authenticated user identifier.',
        example: 'usr_1',
    }),
    __metadata("design:type", String)
], ActorContextDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Primary phone number for the authenticated actor.',
        example: '09123456789',
    }),
    __metadata("design:type", String)
], ActorContextDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Resolved role for the authenticated actor.',
        enum: client_1.UserRole,
        example: client_1.UserRole.CUSTOMER,
    }),
    __metadata("design:type", String)
], ActorContextDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current account status for the authenticated actor.',
        enum: client_1.UserStatus,
        example: client_1.UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], ActorContextDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Customer profile identifier when the actor is a customer.',
        example: 'cust_prof_1',
    }),
    __metadata("design:type", String)
], ActorContextDto.prototype, "customerProfileId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Rider identifier when the actor is a rider.',
        example: 'rider_1',
    }),
    __metadata("design:type", String)
], ActorContextDto.prototype, "riderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Rider onboarding status. Present only for RIDER actors.',
        enum: client_1.RiderStatus,
        example: client_1.RiderStatus.PENDING,
    }),
    __metadata("design:type", String)
], ActorContextDto.prototype, "riderStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Merchant identifier when the actor is a merchant user.',
        example: 'merchant_1',
    }),
    __metadata("design:type", String)
], ActorContextDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Merchant onboarding status. Present only for MERCHANT actors.',
        enum: client_1.MerchantStatus,
        example: client_1.MerchantStatus.PENDING,
    }),
    __metadata("design:type", String)
], ActorContextDto.prototype, "merchantStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Staff member identifier. Present only for MERCHANT_STAFF actors.',
        example: 'staff_1',
    }),
    __metadata("design:type", String)
], ActorContextDto.prototype, "staffMemberId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Staff role. Present only for MERCHANT_STAFF actors.',
        enum: client_1.MerchantStaffRole,
        example: client_1.MerchantStaffRole.CASHIER,
    }),
    __metadata("design:type", String)
], ActorContextDto.prototype, "staffRole", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Staff account status. Present only for MERCHANT_STAFF actors.',
        enum: client_1.StaffStatus,
        example: client_1.StaffStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], ActorContextDto.prototype, "staffStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch IDs this staff member is assigned to.',
        type: [String],
        example: ['branch_1', 'branch_2'],
    }),
    __metadata("design:type", Array)
], ActorContextDto.prototype, "staffBranchIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Merchant identifier for staff members.',
        example: 'merchant_1',
    }),
    __metadata("design:type", String)
], ActorContextDto.prototype, "staffMerchantId", void 0);
//# sourceMappingURL=actor-context.dto.js.map
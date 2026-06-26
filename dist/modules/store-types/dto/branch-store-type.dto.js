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
exports.BranchStoreTypeDto = void 0;
exports.toBranchStoreTypeDto = toBranchStoreTypeDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class BranchStoreTypeDto {
}
exports.BranchStoreTypeDto = BranchStoreTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], BranchStoreTypeDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch display name.',
        example: 'Downtown Branch',
    }),
    __metadata("design:type", String)
], BranchStoreTypeDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant identifier.',
        example: 'merchant_1',
    }),
    __metadata("design:type", String)
], BranchStoreTypeDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant display name.',
        example: 'Tea House',
    }),
    __metadata("design:type", String)
], BranchStoreTypeDto.prototype, "merchantName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch operational status.',
        enum: client_1.BranchStatus,
        example: client_1.BranchStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], BranchStoreTypeDto.prototype, "branchStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store type identifier.',
        example: 'store_type_restaurant',
    }),
    __metadata("design:type", String)
], BranchStoreTypeDto.prototype, "storeTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store type code.',
        example: 'restaurant',
    }),
    __metadata("design:type", String)
], BranchStoreTypeDto.prototype, "storeTypeCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store type display name.',
        example: 'Restaurant',
    }),
    __metadata("design:type", String)
], BranchStoreTypeDto.prototype, "storeTypeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the referenced store type is active globally.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], BranchStoreTypeDto.prototype, "storeTypeIsActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the referenced store type belongs to the seed registry.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BranchStoreTypeDto.prototype, "storeTypeIsSystem", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current admin approval status for this branch store type assignment.',
        enum: client_1.BranchStoreTypeStatus,
        example: client_1.BranchStoreTypeStatus.APPROVED,
    }),
    __metadata("design:type", String)
], BranchStoreTypeDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this is the primary approved store type for the branch.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], BranchStoreTypeDto.prototype, "isPrimary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Presentation sort order within the branch.',
        example: 0,
    }),
    __metadata("design:type", Number)
], BranchStoreTypeDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User identifier that originated the request.',
        example: 'usr_merchant_1',
    }),
    __metadata("design:type", Object)
], BranchStoreTypeDto.prototype, "requestedByUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Role of the user that originated the request.',
        enum: client_1.UserRole,
        example: client_1.UserRole.MERCHANT,
    }),
    __metadata("design:type", Object)
], BranchStoreTypeDto.prototype, "requestedByUserRole", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User identifier that last approved the assignment.',
        example: 'usr_admin_1',
    }),
    __metadata("design:type", Object)
], BranchStoreTypeDto.prototype, "approvedByUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Role of the user that last approved the assignment.',
        enum: client_1.UserRole,
        example: client_1.UserRole.ADMIN,
    }),
    __metadata("design:type", Object)
], BranchStoreTypeDto.prototype, "approvedByUserRole", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Approval timestamp when applicable.',
        example: '2026-04-30T08:00:00.000Z',
    }),
    __metadata("design:type", Object)
], BranchStoreTypeDto.prototype, "approvedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Rejection timestamp when applicable.',
        example: '2026-04-30T08:00:00.000Z',
    }),
    __metadata("design:type", Object)
], BranchStoreTypeDto.prototype, "rejectedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Hidden timestamp when applicable.',
        example: '2026-04-30T08:00:00.000Z',
    }),
    __metadata("design:type", Object)
], BranchStoreTypeDto.prototype, "hiddenAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional admin note explaining the current status.',
        example: 'Approved for launch week.',
    }),
    __metadata("design:type", Object)
], BranchStoreTypeDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp.',
        example: '2026-04-30T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], BranchStoreTypeDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp.',
        example: '2026-04-30T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], BranchStoreTypeDto.prototype, "updatedAt", void 0);
function toBranchStoreTypeDto(assignment) {
    return {
        branchId: assignment.branch.id,
        branchName: assignment.branch.name,
        merchantId: assignment.branch.merchant.id,
        merchantName: assignment.branch.merchant.name,
        branchStatus: assignment.branch.status,
        storeTypeId: assignment.storeType.id,
        storeTypeCode: assignment.storeType.code,
        storeTypeName: assignment.storeType.name,
        storeTypeIsActive: assignment.storeType.isActive,
        storeTypeIsSystem: assignment.storeType.isSystem,
        status: assignment.status,
        isPrimary: assignment.isPrimary,
        sortOrder: assignment.sortOrder,
        requestedByUserId: assignment.requestedBy?.id ?? null,
        requestedByUserRole: assignment.requestedBy?.role ?? null,
        approvedByUserId: assignment.approvedBy?.id ?? null,
        approvedByUserRole: assignment.approvedBy?.role ?? null,
        approvedAt: assignment.approvedAt?.toISOString() ?? null,
        rejectedAt: assignment.rejectedAt?.toISOString() ?? null,
        hiddenAt: assignment.hiddenAt?.toISOString() ?? null,
        reason: assignment.reason,
        createdAt: assignment.createdAt.toISOString(),
        updatedAt: assignment.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=branch-store-type.dto.js.map
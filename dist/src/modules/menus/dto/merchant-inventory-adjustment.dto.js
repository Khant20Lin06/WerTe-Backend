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
exports.MerchantInventoryAdjustmentDto = exports.MerchantInventoryAdjustmentActorDto = void 0;
exports.toMerchantInventoryAdjustmentDto = toMerchantInventoryAdjustmentDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class MerchantInventoryAdjustmentActorDto {
}
exports.MerchantInventoryAdjustmentActorDto = MerchantInventoryAdjustmentActorDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Actor user identifier.',
        example: 'usr_merchant_1',
    }),
    __metadata("design:type", String)
], MerchantInventoryAdjustmentActorDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Actor role for the inventory adjustment.',
        enum: client_1.UserRole,
    }),
    __metadata("design:type", String)
], MerchantInventoryAdjustmentActorDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Actor phone number.',
        example: '0999999999',
    }),
    __metadata("design:type", String)
], MerchantInventoryAdjustmentActorDto.prototype, "phone", void 0);
class MerchantInventoryAdjustmentDto {
}
exports.MerchantInventoryAdjustmentDto = MerchantInventoryAdjustmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Audit log identifier for the adjustment event.',
        example: 'audit_1',
    }),
    __metadata("design:type", String)
], MerchantInventoryAdjustmentDto.prototype, "auditLogId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Adjusted resource type.',
        enum: client_1.AuditResourceType,
    }),
    __metadata("design:type", String)
], MerchantInventoryAdjustmentDto.prototype, "resourceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Adjusted resource identifier.',
        example: 'item_1',
    }),
    __metadata("design:type", String)
], MerchantInventoryAdjustmentDto.prototype, "resourceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Adjusted resource display label.',
        example: 'Mohinga',
    }),
    __metadata("design:type", Object)
], MerchantInventoryAdjustmentDto.prototype, "resourceLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Signed inventory delta that was applied.',
        example: -2,
    }),
    __metadata("design:type", Number)
], MerchantInventoryAdjustmentDto.prototype, "delta", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Structured reason code recorded for the adjustment.',
        example: 'manual_writeoff_damaged_stock',
    }),
    __metadata("design:type", Object)
], MerchantInventoryAdjustmentDto.prototype, "reasonCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional adjustment note.',
        example: 'Two damaged units were removed from inventory.',
    }),
    __metadata("design:type", Object)
], MerchantInventoryAdjustmentDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Stock quantity before the adjustment.',
        example: 10,
    }),
    __metadata("design:type", Object)
], MerchantInventoryAdjustmentDto.prototype, "beforeStockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Stock quantity after the adjustment.',
        example: 8,
    }),
    __metadata("design:type", Object)
], MerchantInventoryAdjustmentDto.prototype, "afterStockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Low-stock threshold at the time of adjustment.',
        example: 3,
    }),
    __metadata("design:type", Object)
], MerchantInventoryAdjustmentDto.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Actor summary when available.',
        type: MerchantInventoryAdjustmentActorDto,
    }),
    __metadata("design:type", Object)
], MerchantInventoryAdjustmentDto.prototype, "actor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Adjustment timestamp.',
        example: '2026-05-01T10:00:00.000Z',
    }),
    __metadata("design:type", String)
], MerchantInventoryAdjustmentDto.prototype, "createdAt", void 0);
function toMerchantInventoryAdjustmentDto(auditLog) {
    const metadata = toMetadataRecord(auditLog.metadata);
    return {
        auditLogId: auditLog.auditLogId,
        resourceType: auditLog.resourceType,
        resourceId: auditLog.resourceId,
        resourceLabel: auditLog.resourceLabel,
        delta: readMetadataNumber(metadata, 'delta') ?? 0,
        reasonCode: readMetadataString(metadata, 'reasonCode'),
        note: readMetadataString(metadata, 'note'),
        beforeStockQuantity: readMetadataNumber(metadata, 'beforeStockQuantity'),
        afterStockQuantity: readMetadataNumber(metadata, 'afterStockQuantity'),
        lowStockThreshold: readMetadataNumber(metadata, 'lowStockThreshold'),
        actor: auditLog.actorUser === null
            ? null
            : {
                userId: auditLog.actorUser.userId,
                role: auditLog.actorUser.role,
                phone: auditLog.actorUser.phone,
            },
        createdAt: auditLog.createdAt,
    };
}
function toMetadataRecord(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    return value;
}
function readMetadataString(metadata, key) {
    if (metadata === null) {
        return null;
    }
    const value = metadata[key];
    return typeof value === 'string' ? value : null;
}
function readMetadataNumber(metadata, key) {
    if (metadata === null) {
        return null;
    }
    const value = metadata[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
//# sourceMappingURL=merchant-inventory-adjustment.dto.js.map
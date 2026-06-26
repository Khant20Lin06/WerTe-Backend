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
exports.BranchDto = exports.BranchZoneDto = void 0;
exports.toBranchDto = toBranchDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class BranchZoneDto {
}
exports.BranchZoneDto = BranchZoneDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Zone identifier assigned to the branch.',
        example: 'zone_1',
    }),
    __metadata("design:type", String)
], BranchZoneDto.prototype, "zoneId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Zone code.',
        example: 'YGN-DT',
    }),
    __metadata("design:type", String)
], BranchZoneDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Zone display name.',
        example: 'Downtown',
    }),
    __metadata("design:type", String)
], BranchZoneDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Zone status.',
        enum: client_1.ZoneStatus,
        example: client_1.ZoneStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], BranchZoneDto.prototype, "status", void 0);
class BranchDto {
}
exports.BranchDto = BranchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], BranchDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Parent merchant identifier.',
        example: 'merchant_1',
    }),
    __metadata("design:type", String)
], BranchDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch display name.',
        example: 'Downtown Branch',
    }),
    __metadata("design:type", String)
], BranchDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch contact phone number.',
        example: '0942000000',
    }),
    __metadata("design:type", Object)
], BranchDto.prototype, "contactPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Primary address line for the branch.',
        example: 'No. 10, Merchant Street',
    }),
    __metadata("design:type", Object)
], BranchDto.prototype, "line1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch township.',
        example: 'Botahtaung',
    }),
    __metadata("design:type", String)
], BranchDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch latitude serialized as string when available.',
        example: '16.7792',
    }),
    __metadata("design:type", Object)
], BranchDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch longitude serialized as string when available.',
        example: '96.1735',
    }),
    __metadata("design:type", Object)
], BranchDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Dynamic store type code used by this branch.',
        example: 'restaurant',
    }),
    __metadata("design:type", String)
], BranchDto.prototype, "storeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch operational status.',
        enum: client_1.BranchStatus,
        example: client_1.BranchStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], BranchDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Zones assigned to the branch.',
        type: BranchZoneDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], BranchDto.prototype, "zones", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Weekly operating hours keyed by lowercase weekday (mon–sun).',
        example: {
            mon: { open: true, openTime: '09:00', closeTime: '22:00' },
            sun: { open: false },
        },
    }),
    __metadata("design:type", Object)
], BranchDto.prototype, "operatingHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch creation timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], BranchDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch last update timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], BranchDto.prototype, "updatedAt", void 0);
function toBranchDto(branch) {
    return {
        id: branch.id,
        merchantId: branch.merchant.id,
        name: branch.name,
        contactPhone: branch.contactPhone,
        line1: branch.line1,
        township: branch.township,
        latitude: branch.latitude?.toString() ?? null,
        longitude: branch.longitude?.toString() ?? null,
        storeType: branch.storeType,
        status: branch.status,
        operatingHours: branch.operatingHours,
        zones: branch.branchZones.map((branchZone) => ({
            zoneId: branchZone.zone.id,
            code: branchZone.zone.code,
            name: branchZone.zone.name,
            status: branchZone.zone.status,
        })),
        createdAt: new Date(branch.createdAt).toISOString(),
        updatedAt: new Date(branch.updatedAt).toISOString(),
    };
}
//# sourceMappingURL=branch.dto.js.map
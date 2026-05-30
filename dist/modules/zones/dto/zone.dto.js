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
exports.ZoneDto = void 0;
exports.toZoneDto = toZoneDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class ZoneDto {
}
exports.ZoneDto = ZoneDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Zone identifier.',
        example: 'zone_1',
    }),
    __metadata("design:type", String)
], ZoneDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Zone code.',
        example: 'YGN-DT',
    }),
    __metadata("design:type", String)
], ZoneDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Zone display name.',
        example: 'Downtown',
    }),
    __metadata("design:type", String)
], ZoneDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional zone description.',
        example: 'Central Yangon delivery zone',
    }),
    __metadata("design:type", Object)
], ZoneDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Zone status.',
        enum: client_1.ZoneStatus,
        example: client_1.ZoneStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], ZoneDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of branches currently mapped to the zone.',
        example: 3,
    }),
    __metadata("design:type", Number)
], ZoneDto.prototype, "branchCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Zone creation timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], ZoneDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Zone last update timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], ZoneDto.prototype, "updatedAt", void 0);
function toZoneDto(zone) {
    return {
        id: zone.id,
        code: zone.code,
        name: zone.name,
        description: zone.description,
        status: zone.status,
        branchCount: '_count' in zone ? zone._count.branchZones : undefined,
        createdAt: zone.createdAt.toISOString(),
        updatedAt: zone.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=zone.dto.js.map
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
exports.CreateZoneDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateZoneDto {
}
exports.CreateZoneDto = CreateZoneDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Short unique zone code used across admin and dispatch workflows.',
        example: 'YGN-DT',
        maxLength: 32,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(32),
    (0, class_validator_1.Matches)(/^[A-Z0-9-]+$/),
    __metadata("design:type", String)
], CreateZoneDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Human-readable zone name.',
        example: 'Downtown',
        maxLength: 120,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateZoneDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional zone description.',
        example: 'Central Yangon delivery zone',
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateZoneDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Initial zone status.',
        enum: client_1.ZoneStatus,
        example: client_1.ZoneStatus.ACTIVE,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ZoneStatus),
    __metadata("design:type", String)
], CreateZoneDto.prototype, "status", void 0);
//# sourceMappingURL=create-zone.dto.js.map
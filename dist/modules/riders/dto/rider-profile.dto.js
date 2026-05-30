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
exports.RiderProfileDto = void 0;
exports.toRiderProfileDto = toRiderProfileDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class RiderProfileDto {
}
exports.RiderProfileDto = RiderProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rider identifier.',
        example: 'rider_1',
    }),
    __metadata("design:type", String)
], RiderProfileDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Primary rider account phone number.',
        example: '0977777777',
    }),
    __metadata("design:type", String)
], RiderProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rider display name.',
        example: 'Ko Aung',
    }),
    __metadata("design:type", String)
], RiderProfileDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle type used by the rider.',
        example: 'bike',
    }),
    __metadata("design:type", String)
], RiderProfileDto.prototype, "vehicleType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Current operating township for the rider.',
        example: 'Kamaryut',
    }),
    __metadata("design:type", Object)
], RiderProfileDto.prototype, "currentTownship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rider operational status.',
        enum: client_1.RiderStatus,
        example: client_1.RiderStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], RiderProfileDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Underlying account status for the rider user.',
        enum: client_1.UserStatus,
        example: client_1.UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], RiderProfileDto.prototype, "accountStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rider profile creation timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], RiderProfileDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rider profile last update timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], RiderProfileDto.prototype, "updatedAt", void 0);
function toRiderProfileDto(rider) {
    return {
        id: rider.id,
        phone: rider.user.phone,
        displayName: rider.displayName,
        vehicleType: rider.vehicleType,
        currentTownship: rider.currentTownship,
        status: rider.status,
        accountStatus: rider.user.status,
        createdAt: rider.createdAt.toISOString(),
        updatedAt: rider.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=rider-profile.dto.js.map
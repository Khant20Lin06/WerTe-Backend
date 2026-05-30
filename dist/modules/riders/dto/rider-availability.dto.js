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
exports.RiderAvailabilityDto = void 0;
exports.isRiderDispatchEligible = isRiderDispatchEligible;
exports.toRiderAvailabilityDto = toRiderAvailabilityDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class RiderAvailabilityDto {
}
exports.RiderAvailabilityDto = RiderAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rider identifier.',
        example: 'rider_1',
    }),
    __metadata("design:type", String)
], RiderAvailabilityDto.prototype, "riderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rider operational status.',
        enum: client_1.RiderStatus,
        example: client_1.RiderStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], RiderAvailabilityDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Underlying account status of the rider.',
        enum: client_1.UserStatus,
        example: client_1.UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], RiderAvailabilityDto.prototype, "accountStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Current operating township for rider dispatch context.',
        example: 'Kamaryut',
    }),
    __metadata("design:type", Object)
], RiderAvailabilityDto.prototype, "currentTownship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the rider is currently online.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], RiderAvailabilityDto.prototype, "isOnline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the rider is currently marked available for dispatch.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], RiderAvailabilityDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the rider can currently receive dispatch work.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], RiderAvailabilityDto.prototype, "isDispatchEligible", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last time the rider availability state changed.',
        example: '2026-04-19T08:10:00.000Z',
    }),
    __metadata("design:type", Object)
], RiderAvailabilityDto.prototype, "lastStatusChangedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last time the current availability snapshot was updated.',
        example: '2026-04-19T08:10:00.000Z',
    }),
    __metadata("design:type", String)
], RiderAvailabilityDto.prototype, "updatedAt", void 0);
function isRiderDispatchEligible(rider) {
    return (rider.status === client_1.RiderStatus.ACTIVE &&
        rider.user.status === client_1.UserStatus.ACTIVE &&
        rider.availability?.isOnline === true &&
        rider.availability?.isAvailable === true);
}
function toRiderAvailabilityDto(rider) {
    return {
        riderId: rider.id,
        status: rider.status,
        accountStatus: rider.user.status,
        currentTownship: rider.currentTownship,
        isOnline: rider.availability?.isOnline ?? false,
        isAvailable: rider.availability?.isAvailable ?? false,
        isDispatchEligible: isRiderDispatchEligible(rider),
        lastStatusChangedAt: rider.availability?.lastStatusChangedAt.toISOString() ?? null,
        updatedAt: rider.availability?.updatedAt.toISOString() ?? rider.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=rider-availability.dto.js.map
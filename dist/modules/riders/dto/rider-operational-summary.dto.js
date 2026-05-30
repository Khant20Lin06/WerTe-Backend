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
exports.RiderOperationalSummaryDto = void 0;
exports.toRiderOperationalSummaryDto = toRiderOperationalSummaryDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const rider_availability_dto_1 = require("./rider-availability.dto");
class RiderOperationalSummaryDto {
}
exports.RiderOperationalSummaryDto = RiderOperationalSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rider identifier.',
        example: 'rider_1',
    }),
    __metadata("design:type", String)
], RiderOperationalSummaryDto.prototype, "riderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rider operational status.',
        enum: client_1.RiderStatus,
        example: client_1.RiderStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], RiderOperationalSummaryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Underlying account status of the rider.',
        enum: client_1.UserStatus,
        example: client_1.UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], RiderOperationalSummaryDto.prototype, "accountStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle type used by the rider.',
        example: 'bike',
    }),
    __metadata("design:type", String)
], RiderOperationalSummaryDto.prototype, "vehicleType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Current operating township used for dispatch context.',
        example: 'Kamaryut',
    }),
    __metadata("design:type", Object)
], RiderOperationalSummaryDto.prototype, "currentTownship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the rider is currently eligible for later dispatch workflows.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], RiderOperationalSummaryDto.prototype, "isDispatchEligible", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the rider is currently online.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], RiderOperationalSummaryDto.prototype, "isOnline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the rider is currently available for dispatch work.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], RiderOperationalSummaryDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last time the availability state changed.',
        example: '2026-04-19T08:10:00.000Z',
    }),
    __metadata("design:type", Object)
], RiderOperationalSummaryDto.prototype, "lastStatusChangedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Snapshot timestamp based on the rider record update time.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], RiderOperationalSummaryDto.prototype, "updatedAt", void 0);
function toRiderOperationalSummaryDto(rider) {
    return {
        riderId: rider.id,
        status: rider.status,
        accountStatus: rider.user.status,
        vehicleType: rider.vehicleType,
        currentTownship: rider.currentTownship,
        isDispatchEligible: (0, rider_availability_dto_1.isRiderDispatchEligible)(rider),
        isOnline: rider.availability?.isOnline ?? false,
        isAvailable: rider.availability?.isAvailable ?? false,
        lastStatusChangedAt: rider.availability?.lastStatusChangedAt.toISOString() ?? null,
        updatedAt: rider.availability?.updatedAt.toISOString() ?? rider.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=rider-operational-summary.dto.js.map
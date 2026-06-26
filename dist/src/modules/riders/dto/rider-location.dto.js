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
exports.RiderLocationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class RiderLocationDto {
}
exports.RiderLocationDto = RiderLocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'rider_1' }),
    __metadata("design:type", String)
], RiderLocationDto.prototype, "riderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'delivery_1' }),
    __metadata("design:type", Object)
], RiderLocationDto.prototype, "deliveryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '16.834' }),
    __metadata("design:type", String)
], RiderLocationDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '96.176' }),
    __metadata("design:type", String)
], RiderLocationDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '90' }),
    __metadata("design:type", Object)
], RiderLocationDto.prototype, "heading", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '14.5' }),
    __metadata("design:type", Object)
], RiderLocationDto.prototype, "speed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '5.2' }),
    __metadata("design:type", Object)
], RiderLocationDto.prototype, "accuracyMeters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-19T10:12:00.000Z' }),
    __metadata("design:type", String)
], RiderLocationDto.prototype, "recordedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the request matched the current stored snapshot and skipped writes.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], RiderLocationDto.prototype, "duplicate", void 0);
//# sourceMappingURL=rider-location.dto.js.map
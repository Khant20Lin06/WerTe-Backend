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
exports.IngestRiderLocationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class IngestRiderLocationDto {
}
exports.IngestRiderLocationDto = IngestRiderLocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Latitude captured from the rider device.',
        example: 16.834,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IngestRiderLocationDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Longitude captured from the rider device.',
        example: 96.176,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IngestRiderLocationDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional heading in degrees from the rider device.',
        example: 90,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IngestRiderLocationDto.prototype, "heading", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional current speed captured from the rider device.',
        example: 14.5,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IngestRiderLocationDto.prototype, "speed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional location accuracy in meters.',
        example: 5.2,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IngestRiderLocationDto.prototype, "accuracyMeters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the location was recorded on device.',
        example: '2026-04-19T10:12:00.000Z',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], IngestRiderLocationDto.prototype, "recordedAt", void 0);
//# sourceMappingURL=ingest-rider-location.dto.js.map
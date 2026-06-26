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
exports.PushTokenResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class PushTokenResponseDto {
}
exports.PushTokenResponseDto = PushTokenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Push token record identifier.',
        example: 'pt_1',
    }),
    __metadata("design:type", String)
], PushTokenResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Owner user id for the registered push token.',
        example: 'usr_1',
    }),
    __metadata("design:type", String)
], PushTokenResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Client-provided stable device identifier.',
        example: 'android-device-001',
    }),
    __metadata("design:type", String)
], PushTokenResponseDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Registered platform for this token.',
        enum: client_1.DevicePlatform,
        example: client_1.DevicePlatform.ANDROID,
    }),
    __metadata("design:type", String)
], PushTokenResponseDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Stored push token.',
        example: 'fcm-token-abc-123',
    }),
    __metadata("design:type", String)
], PushTokenResponseDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last time this token was seen or refreshed.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", Date)
], PushTokenResponseDto.prototype, "lastSeenAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp for the token record.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", Date)
], PushTokenResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp for the token record.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", Date)
], PushTokenResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=push-token-response.dto.js.map
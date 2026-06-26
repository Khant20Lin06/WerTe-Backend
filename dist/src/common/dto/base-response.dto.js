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
exports.PaginatedMetaDto = exports.BaseErrorResponseDto = exports.BaseResponseDto = exports.ResponseMetaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ResponseMetaDto {
}
exports.ResponseMetaDto = ResponseMetaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'req_01hwz3k2x8f9g' }),
    __metadata("design:type", String)
], ResponseMetaDto.prototype, "requestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-06-01T10:00:00.000Z' }),
    __metadata("design:type", String)
], ResponseMetaDto.prototype, "timestamp", void 0);
class BaseResponseDto {
}
exports.BaseResponseDto = BaseResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BaseResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], BaseResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => ResponseMetaDto }),
    __metadata("design:type", ResponseMetaDto)
], BaseResponseDto.prototype, "meta", void 0);
class BaseErrorResponseDto {
}
exports.BaseErrorResponseDto = BaseErrorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], BaseErrorResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: null,
        },
    }),
    __metadata("design:type", Object)
], BaseErrorResponseDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => ResponseMetaDto }),
    __metadata("design:type", ResponseMetaDto)
], BaseErrorResponseDto.prototype, "meta", void 0);
class PaginatedMetaDto extends ResponseMetaDto {
}
exports.PaginatedMetaDto = PaginatedMetaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], PaginatedMetaDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20 }),
    __metadata("design:type", Number)
], PaginatedMetaDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    __metadata("design:type", Number)
], PaginatedMetaDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], PaginatedMetaDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    __metadata("design:type", Boolean)
], PaginatedMetaDto.prototype, "hasNext", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    __metadata("design:type", Boolean)
], PaginatedMetaDto.prototype, "hasPrev", void 0);
//# sourceMappingURL=base-response.dto.js.map
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingDto = exports.CreateRatingDto = void 0;
exports.toRatingDto = toRatingDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateRatingDto {
}
exports.CreateRatingDto = CreateRatingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.RatingTargetType }),
    (0, class_validator_1.IsEnum)(client_1.RatingTargetType),
    __metadata("design:type", typeof (_a = typeof client_1.RatingTargetType !== "undefined" && client_1.RatingTargetType) === "function" ? _a : Object)
], CreateRatingDto.prototype, "targetType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRatingDto.prototype, "targetId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 1, maximum: 5 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateRatingDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateRatingDto.prototype, "comment", void 0);
class RatingDto {
}
exports.RatingDto = RatingDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RatingDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RatingDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.RaterType }),
    __metadata("design:type", typeof (_b = typeof client_1.RaterType !== "undefined" && client_1.RaterType) === "function" ? _b : Object)
], RatingDto.prototype, "raterType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RatingDto.prototype, "raterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.RatingTargetType }),
    __metadata("design:type", typeof (_c = typeof client_1.RatingTargetType !== "undefined" && client_1.RatingTargetType) === "function" ? _c : Object)
], RatingDto.prototype, "targetType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RatingDto.prototype, "targetId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RatingDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], RatingDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], RatingDto.prototype, "createdAt", void 0);
function toRatingDto(r) {
    return {
        id: r.id,
        orderId: r.orderId,
        raterType: r.raterType,
        raterId: r.raterId,
        targetType: r.targetType,
        targetId: r.targetId,
        score: r.score,
        comment: r.comment,
        createdAt: r.createdAt,
    };
}
//# sourceMappingURL=create-rating.dto.js.map
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
exports.AssignRiderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class AssignRiderDto {
}
exports.AssignRiderDto = AssignRiderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rider identifier to assign to the order.',
        example: 'rider_1',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], AssignRiderDto.prototype, "riderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional delivery ETA in minutes attached at assignment time.',
        example: 18,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AssignRiderDto.prototype, "etaMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional structured reason code supplied by the dispatch assignment flow.',
        example: 'admin_assigned_rider_manual_dispatch',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], AssignRiderDto.prototype, "reasonCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional dispatch note attached to the assignment action.',
        example: 'Dispatcher manually assigned the nearest rider.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], AssignRiderDto.prototype, "note", void 0);
//# sourceMappingURL=assign-rider.dto.js.map
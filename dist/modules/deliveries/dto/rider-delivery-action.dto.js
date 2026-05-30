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
exports.RiderDeliveryActionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class RiderDeliveryActionDto {
}
exports.RiderDeliveryActionDto = RiderDeliveryActionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional structured reason code supplied by the rider delivery workflow.',
        example: 'rider_rejected_assignment',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], RiderDeliveryActionDto.prototype, "reasonCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional rider note attached to the delivery action.',
        example: 'Traffic conditions make this assignment unreachable.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], RiderDeliveryActionDto.prototype, "note", void 0);
//# sourceMappingURL=rider-delivery-action.dto.js.map
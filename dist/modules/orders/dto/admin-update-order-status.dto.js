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
exports.AdminUpdateOrderStatusDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class AdminUpdateOrderStatusDto {
}
exports.AdminUpdateOrderStatusDto = AdminUpdateOrderStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New order status requested by the admin control plane.',
        enum: client_1.OrderStatus,
        enumName: 'OrderStatus',
        example: client_1.OrderStatus.RIDER_ASSIGNED,
    }),
    (0, class_validator_1.IsEnum)(client_1.OrderStatus),
    __metadata("design:type", String)
], AdminUpdateOrderStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Required structured reason code explaining why the admin override is being performed.',
        example: 'admin_override_manual_reassignment',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], AdminUpdateOrderStatusDto.prototype, "reasonCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional administrative note attached to the status override action.',
        example: 'Dispatcher is manually moving this order back into assignment.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], AdminUpdateOrderStatusDto.prototype, "note", void 0);
//# sourceMappingURL=admin-update-order-status.dto.js.map
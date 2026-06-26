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
exports.AdminUpdateRiderStatusDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class AdminUpdateRiderStatusDto {
}
exports.AdminUpdateRiderStatusDto = AdminUpdateRiderStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New rider status. PENDING cannot be set by admin.',
        enum: [client_1.RiderStatus.ACTIVE, client_1.RiderStatus.SUSPENDED],
        example: client_1.RiderStatus.ACTIVE,
    }),
    (0, class_validator_1.IsEnum)(client_1.RiderStatus),
    (0, class_validator_1.IsNotIn)([client_1.RiderStatus.PENDING], {
        message: 'Cannot set status back to PENDING.',
    }),
    __metadata("design:type", Object)
], AdminUpdateRiderStatusDto.prototype, "status", void 0);
//# sourceMappingURL=admin-update-rider-status.dto.js.map
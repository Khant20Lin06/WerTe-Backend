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
exports.MarkMessageReadRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class MarkMessageReadRequestDto {
}
exports.MarkMessageReadRequestDto = MarkMessageReadRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message identifier to mark as read in the realtime channel.',
        example: 'msg_123',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MarkMessageReadRequestDto.prototype, "messageId", void 0);
//# sourceMappingURL=mark-message-read-request.dto.js.map
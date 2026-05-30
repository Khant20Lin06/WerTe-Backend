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
exports.MarkReadDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class MarkReadDto {
}
exports.MarkReadDto = MarkReadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Conversation containing the message that was marked as read.',
        example: 'con_123',
    }),
    __metadata("design:type", String)
], MarkReadDto.prototype, "conversationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message identifier that advanced the participant read position.',
        example: 'msg_123',
    }),
    __metadata("design:type", String)
], MarkReadDto.prototype, "messageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ISO timestamp when the read position was recorded.',
        example: '2026-04-20T10:30:00.000Z',
    }),
    __metadata("design:type", String)
], MarkReadDto.prototype, "readAt", void 0);
//# sourceMappingURL=mark-read.dto.js.map
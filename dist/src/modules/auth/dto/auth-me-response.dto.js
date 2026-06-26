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
exports.AuthMeResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const actor_context_dto_1 = require("./actor-context.dto");
class AuthMeResponseDto {
}
exports.AuthMeResponseDto = AuthMeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Authenticated user identifier.',
        example: 'usr_1',
    }),
    __metadata("design:type", String)
], AuthMeResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current session identifier.',
        example: '8e6f237c-2f7b-4d76-b77b-c86393c8d8e8',
    }),
    __metadata("design:type", String)
], AuthMeResponseDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Resolved role for the current session.',
        enum: client_1.UserRole,
        example: client_1.UserRole.CUSTOMER,
    }),
    __metadata("design:type", String)
], AuthMeResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Actor context resolved from the authenticated session.',
        type: actor_context_dto_1.ActorContextDto,
    }),
    __metadata("design:type", actor_context_dto_1.ActorContextDto)
], AuthMeResponseDto.prototype, "actorContext", void 0);
//# sourceMappingURL=auth-me-response.dto.js.map
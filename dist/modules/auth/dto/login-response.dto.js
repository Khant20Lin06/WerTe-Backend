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
exports.LoginResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const actor_context_dto_1 = require("./actor-context.dto");
class LoginResponseDto {
}
exports.LoginResponseDto = LoginResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Short-lived access token used for authenticated API requests.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access',
    }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Long-lived refresh token used to rotate the access token.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
    }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Server-side session identifier backing the token pair.',
        example: '8e6f237c-2f7b-4d76-b77b-c86393c8d8e8',
    }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Authenticated user identifier.',
        example: 'usr_1',
    }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Resolved actor context for the authenticated session.',
        type: actor_context_dto_1.ActorContextDto,
    }),
    __metadata("design:type", actor_context_dto_1.ActorContextDto)
], LoginResponseDto.prototype, "actorContext", void 0);
//# sourceMappingURL=login-response.dto.js.map
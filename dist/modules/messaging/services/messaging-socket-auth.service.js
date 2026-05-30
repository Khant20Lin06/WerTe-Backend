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
exports.MessagingSocketAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const auth_repository_1 = require("../../auth/repositories/auth.repository");
const users_service_1 = require("../../users/services/users.service");
let MessagingSocketAuthService = class MessagingSocketAuthService {
    constructor(configService, jwtService, authRepository, usersService) {
        this.configService = configService;
        this.jwtService = jwtService;
        this.authRepository = authRepository;
        this.usersService = usersService;
    }
    async authenticateClient(client) {
        const accessToken = this.extractAccessToken(client);
        if (accessToken === null) {
            throw new app_exception_1.AppException('Missing access token.', common_1.HttpStatus.UNAUTHORIZED, {
                code: error_codes_1.ErrorCodes.invalidToken,
            });
        }
        const payload = await this.verifyAccessToken(accessToken);
        const session = await this.authRepository.findSessionById(payload.sessionId);
        if (session === null || session.userId !== payload.sub) {
            throw new app_exception_1.AppException('Invalid access token.', common_1.HttpStatus.UNAUTHORIZED, {
                code: error_codes_1.ErrorCodes.invalidToken,
            });
        }
        if (session.revokedAt !== null) {
            throw new app_exception_1.AppException('This session has been revoked.', common_1.HttpStatus.UNAUTHORIZED, {
                code: error_codes_1.ErrorCodes.sessionRevoked,
            });
        }
        if (session.expiresAt.getTime() <= Date.now()) {
            throw new app_exception_1.AppException('This session has expired.', common_1.HttpStatus.UNAUTHORIZED, {
                code: error_codes_1.ErrorCodes.sessionExpired,
            });
        }
        if (this.usersService.isSuspended(session.user)) {
            throw new app_exception_1.AppException('This account is suspended.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.accountSuspended,
            });
        }
        if (this.usersService.isPending(session.user)) {
            throw new app_exception_1.AppException('This account is pending activation.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.accountPending,
            });
        }
        return {
            userId: session.user.id,
            sessionId: session.id,
            role: session.user.role,
            tokenType: payload.type,
            actorContext: this.usersService.buildActorContext(session.user),
        };
    }
    extractAccessToken(client) {
        const authToken = client.handshake.auth?.token;
        if (typeof authToken === 'string' && authToken.trim().length > 0) {
            return authToken.startsWith('Bearer ')
                ? authToken.slice(7).trim()
                : authToken.trim();
        }
        const headerValue = client.handshake.headers.authorization;
        if (typeof headerValue === 'string' && headerValue.startsWith('Bearer ')) {
            return headerValue.slice(7).trim();
        }
        return null;
    }
    async verifyAccessToken(accessToken) {
        try {
            const payload = await this.jwtService.verifyAsync(accessToken, {
                secret: this.configService.getOrThrow('jwt.accessSecret'),
                issuer: this.configService.getOrThrow('jwt.issuer'),
                audience: this.configService.getOrThrow('jwt.audience'),
            });
            if (payload.type !== 'access') {
                throw new app_exception_1.AppException('Invalid access token.', common_1.HttpStatus.UNAUTHORIZED, {
                    code: error_codes_1.ErrorCodes.invalidToken,
                });
            }
            return payload;
        }
        catch (error) {
            if (error instanceof app_exception_1.AppException) {
                throw error;
            }
            throw new app_exception_1.AppException('Invalid access token.', common_1.HttpStatus.UNAUTHORIZED, {
                code: error_codes_1.ErrorCodes.invalidToken,
            });
        }
    }
};
exports.MessagingSocketAuthService = MessagingSocketAuthService;
exports.MessagingSocketAuthService = MessagingSocketAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        auth_repository_1.AuthRepository,
        users_service_1.UsersService])
], MessagingSocketAuthService);
//# sourceMappingURL=messaging-socket-auth.service.js.map
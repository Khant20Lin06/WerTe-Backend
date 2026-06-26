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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const users_service_1 = require("../../users/services/users.service");
const auth_repository_1 = require("../repositories/auth.repository");
const session_cache_service_1 = require("../services/session-cache.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, authRepository, usersService, sessionCache) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('jwt.accessSecret'),
            issuer: configService.getOrThrow('jwt.issuer'),
            audience: configService.getOrThrow('jwt.audience'),
        });
        this.authRepository = authRepository;
        this.usersService = usersService;
        this.sessionCache = sessionCache;
    }
    async validate(payload) {
        if (payload.type !== 'access') {
            throw new app_exception_1.AppException('Invalid access token.', common_1.HttpStatus.UNAUTHORIZED, {
                code: error_codes_1.ErrorCodes.invalidToken,
            });
        }
        const cached = await this.sessionCache.get(payload.sessionId);
        if (cached !== null) {
            return this.validateCached(payload, cached);
        }
        return this.validateFromDb(payload);
    }
    validateCached(payload, cached) {
        if (cached.userId !== payload.sub) {
            throw new app_exception_1.AppException('Invalid access token.', common_1.HttpStatus.UNAUTHORIZED, {
                code: error_codes_1.ErrorCodes.invalidToken,
            });
        }
        if (cached.revokedAt !== null) {
            throw new app_exception_1.AppException('This session has been revoked.', common_1.HttpStatus.UNAUTHORIZED, {
                code: error_codes_1.ErrorCodes.sessionRevoked,
            });
        }
        if (new Date(cached.expiresAt).getTime() <= Date.now()) {
            throw new app_exception_1.AppException('This session has expired.', common_1.HttpStatus.UNAUTHORIZED, {
                code: error_codes_1.ErrorCodes.sessionExpired,
            });
        }
        if (this.usersService.isSuspended(cached.user)) {
            throw new app_exception_1.AppException('This account is suspended.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.accountSuspended,
            });
        }
        if (this.usersService.isPending(cached.user)) {
            throw new app_exception_1.AppException('This account is pending activation.', common_1.HttpStatus.FORBIDDEN, { code: error_codes_1.ErrorCodes.accountPending });
        }
        return this.sessionCache.buildAuthenticatedUser(payload, cached);
    }
    async validateFromDb(payload) {
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
            throw new app_exception_1.AppException('This account is pending activation.', common_1.HttpStatus.FORBIDDEN, { code: error_codes_1.ErrorCodes.accountPending });
        }
        const MAX_CACHE_TTL_SECONDS = 300;
        const tokenTtlSeconds = payload.exp !== undefined
            ? payload.exp - Math.floor(Date.now() / 1_000)
            : MAX_CACHE_TTL_SECONDS;
        const ttlSeconds = Math.min(tokenTtlSeconds, MAX_CACHE_TTL_SECONDS);
        await this.sessionCache.set(payload.sessionId, {
            userId: session.userId,
            revokedAt: null,
            expiresAt: session.expiresAt.toISOString(),
            user: session.user,
        }, ttlSeconds);
        return {
            userId: session.user.id,
            sessionId: session.id,
            role: session.user.role,
            tokenType: payload.type,
            actorContext: this.usersService.buildActorContext(session.user),
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        auth_repository_1.AuthRepository,
        users_service_1.UsersService,
        session_cache_service_1.SessionCacheService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map
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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const users_service_1 = require("../../users/services/users.service");
const auth_repository_1 = require("../repositories/auth.repository");
const password_service_1 = require("./password.service");
let AuthService = class AuthService {
    constructor(configService, jwtService, usersService, authRepository, passwordService) {
        this.configService = configService;
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.authRepository = authRepository;
        this.passwordService = passwordService;
    }
    async login(payload, metadata = {}) {
        const user = await this.usersService.findByPhone(payload.phone);
        if (user === null) {
            throw this.invalidCredentialsException();
        }
        const passwordMatches = await this.passwordService.compare(payload.password, user.passwordHash);
        if (!passwordMatches) {
            throw this.invalidCredentialsException();
        }
        if (this.usersService.isSuspended(user)) {
            throw new app_exception_1.AppException('This account is suspended.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.accountSuspended,
            });
        }
        if (this.usersService.isPending(user)) {
            throw new app_exception_1.AppException('This account is pending activation.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.accountPending,
            });
        }
        const tokens = await this.issueSession(user, metadata);
        await this.authRepository.touchLastLogin(user.id);
        const actorContext = this.usersService.buildActorContext(user);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            sessionId: tokens.sessionId,
            userId: user.id,
            actorContext,
        };
    }
    async refreshSession(refreshToken, metadata = {}) {
        const payload = await this.verifyRefreshToken(refreshToken);
        const session = await this.authRepository.findSessionById(payload.sessionId);
        if (session === null || session.userId !== payload.sub) {
            throw this.invalidTokenException();
        }
        this.assertSessionIsActive(session);
        const tokenMatches = await this.passwordService.compare(refreshToken, session.refreshTokenHash);
        if (!tokenMatches) {
            throw this.invalidTokenException();
        }
        const user = session.user;
        if (this.usersService.isSuspended(user)) {
            throw new app_exception_1.AppException('This account is suspended.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.accountSuspended,
            });
        }
        if (this.usersService.isPending(user)) {
            throw new app_exception_1.AppException('This account is pending activation.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.accountPending,
            });
        }
        const tokens = await this.rotateSession(user, session.id, metadata);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            sessionId: tokens.sessionId,
            userId: user.id,
            actorContext: this.usersService.buildActorContext(user),
        };
    }
    async revokeSession(sessionId) {
        await this.authRepository.revokeSession(sessionId);
    }
    async logout(currentUser, payload = {}) {
        const targetSessionId = await this.resolveTargetSessionId(currentUser, payload);
        const targetSession = await this.authRepository.findSessionById(targetSessionId);
        if (targetSession !== null && targetSession.userId !== currentUser.userId) {
            throw new app_exception_1.AppException('You are not allowed to revoke this session.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        await this.authRepository.revokeSession(targetSessionId);
        return {
            revokedSessionId: targetSessionId,
        };
    }
    getCurrentSession(currentUser) {
        return {
            userId: currentUser.userId,
            sessionId: currentUser.sessionId,
            role: currentUser.role,
            actorContext: currentUser.actorContext,
        };
    }
    registerPushToken(currentUser, payload) {
        return this.authRepository.registerPushToken({
            userId: currentUser.userId,
            deviceId: payload.deviceId,
            platform: payload.platform,
            token: payload.token,
        });
    }
    invalidCredentialsException() {
        return new app_exception_1.AppException('Invalid phone number or password.', common_1.HttpStatus.UNAUTHORIZED, {
            code: error_codes_1.ErrorCodes.invalidCredentials,
        });
    }
    invalidTokenException() {
        return new app_exception_1.AppException('Invalid refresh token.', common_1.HttpStatus.UNAUTHORIZED, {
            code: error_codes_1.ErrorCodes.invalidToken,
        });
    }
    revokedSessionException() {
        return new app_exception_1.AppException('This session has been revoked.', common_1.HttpStatus.UNAUTHORIZED, {
            code: error_codes_1.ErrorCodes.sessionRevoked,
        });
    }
    expiredSessionException() {
        return new app_exception_1.AppException('This session has expired.', common_1.HttpStatus.UNAUTHORIZED, {
            code: error_codes_1.ErrorCodes.sessionExpired,
        });
    }
    async issueSession(user, metadata) {
        const sessionId = (0, crypto_1.randomUUID)();
        const accessToken = await this.signToken(user, sessionId, 'access');
        const refreshToken = await this.signToken(user, sessionId, 'refresh');
        const refreshTokenHash = await this.passwordService.hash(refreshToken);
        const refreshTokenExpiresAt = this.extractExpiryDate(refreshToken);
        await this.authRepository.createSession({
            id: sessionId,
            userId: user.id,
            refreshTokenHash,
            expiresAt: refreshTokenExpiresAt,
            deviceId: metadata.deviceId,
            userAgent: metadata.userAgent,
            ipAddress: metadata.ipAddress,
        });
        return {
            accessToken,
            refreshToken,
            sessionId,
        };
    }
    async rotateSession(user, sessionId, metadata) {
        const accessToken = await this.signToken(user, sessionId, 'access');
        const refreshToken = await this.signToken(user, sessionId, 'refresh');
        const refreshTokenHash = await this.passwordService.hash(refreshToken);
        const refreshTokenExpiresAt = this.extractExpiryDate(refreshToken);
        await this.authRepository.rotateSession(sessionId, refreshTokenHash, refreshTokenExpiresAt, metadata);
        return {
            accessToken,
            refreshToken,
            sessionId,
        };
    }
    async signToken(user, sessionId, type) {
        const expiresIn = (type === 'access'
            ? this.configService.getOrThrow('jwt.accessExpiresIn')
            : this.configService.getOrThrow('jwt.refreshExpiresIn'));
        return this.jwtService.signAsync({
            sub: user.id,
            role: user.role,
            sessionId,
            type,
        }, {
            secret: type === 'access'
                ? this.configService.getOrThrow('jwt.accessSecret')
                : this.configService.getOrThrow('jwt.refreshSecret'),
            issuer: this.configService.getOrThrow('jwt.issuer'),
            audience: this.configService.getOrThrow('jwt.audience'),
            expiresIn,
        });
    }
    extractExpiryDate(token) {
        const decodedToken = this.jwtService.decode(token);
        const tokenPayload = decodedToken !== null && typeof decodedToken === 'object'
            ? decodedToken
            : null;
        if (tokenPayload === null || typeof tokenPayload.exp !== 'number') {
            throw new app_exception_1.AppException('Unable to resolve token expiry.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
            });
        }
        return new Date(tokenPayload.exp * 1000);
    }
    async verifyRefreshToken(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.getOrThrow('jwt.refreshSecret'),
                issuer: this.configService.getOrThrow('jwt.issuer'),
                audience: this.configService.getOrThrow('jwt.audience'),
            });
            if (payload.type !== 'refresh') {
                throw this.invalidTokenException();
            }
            return payload;
        }
        catch (error) {
            if (error instanceof app_exception_1.AppException) {
                throw error;
            }
            throw this.invalidTokenException();
        }
    }
    assertSessionIsActive(session) {
        if (session.revokedAt !== null) {
            throw this.revokedSessionException();
        }
        if (session.expiresAt.getTime() <= Date.now()) {
            throw this.expiredSessionException();
        }
    }
    async resolveTargetSessionId(currentUser, payload) {
        if (payload.refreshToken !== undefined) {
            const refreshPayload = await this.verifyRefreshToken(payload.refreshToken);
            if (refreshPayload.sub !== currentUser.userId) {
                throw new app_exception_1.AppException('You are not allowed to revoke this session.', common_1.HttpStatus.FORBIDDEN, {
                    code: error_codes_1.ErrorCodes.forbidden,
                });
            }
            return refreshPayload.sessionId;
        }
        if (payload.sessionId !== undefined) {
            return payload.sessionId;
        }
        return currentUser.sessionId;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        users_service_1.UsersService,
        auth_repository_1.AuthRepository,
        password_service_1.PasswordService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
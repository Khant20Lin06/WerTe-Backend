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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../../common/decorators/public.decorator");
const auth_me_response_dto_1 = require("../dto/auth-me-response.dto");
const login_dto_1 = require("../dto/login.dto");
const login_response_dto_1 = require("../dto/login-response.dto");
const logout_dto_1 = require("../dto/logout.dto");
const logout_response_dto_1 = require("../dto/logout-response.dto");
const push_token_response_dto_1 = require("../dto/push-token-response.dto");
const register_customer_dto_1 = require("../dto/register-customer.dto");
const register_merchant_dto_1 = require("../dto/register-merchant.dto");
const register_push_token_dto_1 = require("../dto/register-push-token.dto");
const register_rider_dto_1 = require("../dto/register-rider.dto");
const refresh_token_dto_1 = require("../dto/refresh-token.dto");
const unregister_push_token_response_dto_1 = require("../dto/unregister-push-token-response.dto");
const authenticated_user_entity_1 = require("../entities/authenticated-user.entity");
const auth_service_1 = require("../services/auth.service");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    login(body, request, appClient) {
        return this.authService.login(body, this.buildSessionMetadata(request), appClient);
    }
    registerCustomer(body, request) {
        return this.authService.registerCustomer(body, this.buildSessionMetadata(request));
    }
    registerMerchant(body, request) {
        return this.authService.registerMerchant(body, this.buildSessionMetadata(request));
    }
    registerRider(body, request) {
        return this.authService.registerRider(body, this.buildSessionMetadata(request));
    }
    refresh(body, request) {
        return this.authService.refreshSession(body.refreshToken, this.buildSessionMetadata(request));
    }
    logout(currentUser, body = {}) {
        return this.authService.logout(currentUser, body);
    }
    me(currentUser) {
        return this.authService.getCurrentSession(currentUser);
    }
    registerPushToken(currentUser, body) {
        return this.authService.registerPushToken(currentUser, body);
    }
    unregisterPushToken(currentUser, deviceId) {
        return this.authService.unregisterPushToken(currentUser, deviceId);
    }
    getHeaderValue(request, name) {
        const headerValue = request.headers[name];
        if (typeof headerValue === 'string' && headerValue.trim().length > 0) {
            return headerValue;
        }
        return null;
    }
    buildSessionMetadata(request) {
        return {
            deviceId: this.getHeaderValue(request, 'x-device-id'),
            userAgent: this.getHeaderValue(request, 'user-agent'),
            ipAddress: request.ip ?? null,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'login',
        summary: 'Authenticate user and issue tokens',
    }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns access token, refresh token, and actor context for the authenticated user.',
        type: login_response_dto_1.LoginResponseDto,
    }),
    (0, throttler_1.Throttle)({ short: { ttl: 60000, limit: 30 }, medium: { ttl: 900000, limit: 100 } }),
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('x-app-client')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'registerCustomer',
        summary: 'Register a customer account and issue tokens',
    }),
    (0, swagger_1.ApiBody)({ type: register_customer_dto_1.RegisterCustomerDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Creates a customer user/profile and returns a token pair for the new account.',
        type: login_response_dto_1.LoginResponseDto,
    }),
    (0, throttler_1.Throttle)({ short: { ttl: 60000, limit: 30 }, medium: { ttl: 900000, limit: 100 } }),
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register/customer'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_customer_dto_1.RegisterCustomerDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registerCustomer", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'registerMerchant',
        summary: 'Register a merchant account and issue tokens',
    }),
    (0, swagger_1.ApiBody)({ type: register_merchant_dto_1.RegisterMerchantDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Creates a merchant user/profile in pending onboarding state and returns a token pair.',
        type: login_response_dto_1.LoginResponseDto,
    }),
    (0, throttler_1.Throttle)({ short: { ttl: 60000, limit: 30 }, medium: { ttl: 900000, limit: 100 } }),
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register/merchant'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_merchant_dto_1.RegisterMerchantDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registerMerchant", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'registerRider',
        summary: 'Register a rider account and issue tokens',
    }),
    (0, swagger_1.ApiBody)({ type: register_rider_dto_1.RegisterRiderDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Creates a rider user/profile in pending onboarding state and returns a token pair.',
        type: login_response_dto_1.LoginResponseDto,
    }),
    (0, throttler_1.Throttle)({ short: { ttl: 60000, limit: 30 }, medium: { ttl: 900000, limit: 100 } }),
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register/rider'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_rider_dto_1.RegisterRiderDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registerRider", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'refreshToken',
        summary: 'Rotate an existing refresh token into a new token pair',
    }),
    (0, swagger_1.ApiBody)({ type: refresh_token_dto_1.RefreshTokenDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns a newly rotated access token, refresh token, and actor context.',
        type: login_response_dto_1.LoginResponseDto,
    }),
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'logout',
        summary: 'Revoke the current session or another owned session',
    }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiBody)({ type: logout_dto_1.LogoutDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Revokes the target session and returns the revoked session id.',
        type: logout_response_dto_1.LogoutResponseDto,
    }),
    (0, common_1.Post)('logout'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        logout_dto_1.LogoutDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getCurrentAuthSession',
        summary: 'Return the current authenticated actor context',
    }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the current session id, user id, role, and actor context.',
        type: auth_me_response_dto_1.AuthMeResponseDto,
    }),
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'registerPushToken',
        summary: 'Register or refresh a push token for the authenticated actor',
    }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiBody)({ type: register_push_token_dto_1.RegisterPushTokenDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Registers the device push token, refreshing last-seen metadata and reassigning stale tokens when needed.',
        type: push_token_response_dto_1.PushTokenResponseDto,
    }),
    (0, common_1.Post)('push-tokens'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        register_push_token_dto_1.RegisterPushTokenDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registerPushToken", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'unregisterPushToken',
        summary: 'Unregister a push token for the authenticated actor device',
    }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Removes the stored push token registration for the requested device identifier.',
        type: unregister_push_token_response_dto_1.UnregisterPushTokenResponseDto,
    }),
    (0, common_1.Delete)('push-tokens/:deviceId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "unregisterPushToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
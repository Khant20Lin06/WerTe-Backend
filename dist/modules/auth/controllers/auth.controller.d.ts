import { Request } from 'express';
import { LoginDto } from '../dto/login.dto';
import { LogoutDto } from '../dto/logout.dto';
import { RegisterCustomerDto } from '../dto/register-customer.dto';
import { RegisterMerchantDto } from '../dto/register-merchant.dto';
import { RegisterPushTokenDto } from '../dto/register-push-token.dto';
import { RegisterRiderDto } from '../dto/register-rider.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthenticatedUserEntity } from '../entities/authenticated-user.entity';
import { AuthService } from '../services/auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto, request: Request, appClient?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        userId: string;
        actorContext: import("../../users/entities/actor-context.entity").ActorContextEntity;
    }>;
    registerCustomer(body: RegisterCustomerDto, request: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        userId: string;
        actorContext: import("../../users/entities/actor-context.entity").ActorContextEntity;
    }>;
    registerMerchant(body: RegisterMerchantDto, request: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        userId: string;
        actorContext: import("../../users/entities/actor-context.entity").ActorContextEntity;
    }>;
    registerRider(body: RegisterRiderDto, request: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        userId: string;
        actorContext: import("../../users/entities/actor-context.entity").ActorContextEntity;
    }>;
    refresh(body: RefreshTokenDto, request: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: string;
        userId: string;
        actorContext: import("../../users/entities/actor-context.entity").ActorContextEntity;
    }>;
    logout(currentUser: AuthenticatedUserEntity, body?: LogoutDto): Promise<{
        revokedSessionId: string;
    }>;
    me(currentUser: AuthenticatedUserEntity): {
        userId: string;
        sessionId: string;
        role: import(".prisma/client").$Enums.UserRole;
        actorContext: import("../../users/entities/actor-context.entity").ActorContextEntity;
    };
    registerPushToken(currentUser: AuthenticatedUserEntity, body: RegisterPushTokenDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deviceId: string;
        platform: import(".prisma/client").$Enums.DevicePlatform;
        token: string;
        lastSeenAt: Date;
    }>;
    unregisterPushToken(currentUser: AuthenticatedUserEntity, deviceId: string): Promise<{
        deviceId: string;
    }>;
    private getHeaderValue;
    private buildSessionMetadata;
}

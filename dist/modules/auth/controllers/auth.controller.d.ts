import { Request } from 'express';
import { LoginDto } from '../dto/login.dto';
import { LogoutDto } from '../dto/logout.dto';
import { RegisterPushTokenDto } from '../dto/register-push-token.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthenticatedUserEntity } from '../entities/authenticated-user.entity';
import { AuthService } from '../services/auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto, request: Request): Promise<{
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
        userId: string;
        id: string;
        token: string;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string;
        platform: import(".prisma/client").$Enums.DevicePlatform;
        lastSeenAt: Date;
    }>;
    private getHeaderValue;
    private buildSessionMetadata;
}

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterPushTokenDto } from '../dto/register-push-token.dto';
import { AuthenticatedUserEntity } from '../entities/authenticated-user.entity';
import { AuthRepository } from '../repositories/auth.repository';
import { PasswordService } from './password.service';
export type SessionRequestMetadata = {
    deviceId?: string | null;
    userAgent?: string | null;
    ipAddress?: string | null;
};
export declare class AuthService {
    private readonly configService;
    private readonly jwtService;
    private readonly usersService;
    private readonly authRepository;
    private readonly passwordService;
    constructor(configService: ConfigService, jwtService: JwtService, usersService: UsersService, authRepository: AuthRepository, passwordService: PasswordService);
    login(payload: LoginDto, metadata?: SessionRequestMetadata): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        userId: string;
        actorContext: import("../../users/entities/actor-context.entity").ActorContextEntity;
    }>;
    refreshSession(refreshToken: string, metadata?: SessionRequestMetadata): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: string;
        userId: string;
        actorContext: import("../../users/entities/actor-context.entity").ActorContextEntity;
    }>;
    revokeSession(sessionId: string): Promise<void>;
    logout(currentUser: AuthenticatedUserEntity, payload?: {
        sessionId?: string;
        refreshToken?: string;
    }): Promise<{
        revokedSessionId: string;
    }>;
    getCurrentSession(currentUser: AuthenticatedUserEntity): {
        userId: string;
        sessionId: string;
        role: import(".prisma/client").$Enums.UserRole;
        actorContext: import("../../users/entities/actor-context.entity").ActorContextEntity;
    };
    registerPushToken(currentUser: AuthenticatedUserEntity, payload: RegisterPushTokenDto): Promise<{
        userId: string;
        id: string;
        token: string;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string;
        platform: import(".prisma/client").$Enums.DevicePlatform;
        lastSeenAt: Date;
    }>;
    private invalidCredentialsException;
    private invalidTokenException;
    private revokedSessionException;
    private expiredSessionException;
    private issueSession;
    private rotateSession;
    private signToken;
    private extractExpiryDate;
    private verifyRefreshToken;
    private assertSessionIsActive;
    private resolveTargetSessionId;
}

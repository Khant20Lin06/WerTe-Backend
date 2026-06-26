import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterCustomerDto } from '../dto/register-customer.dto';
import { RegisterMerchantDto } from '../dto/register-merchant.dto';
import { RegisterPushTokenDto } from '../dto/register-push-token.dto';
import { RegisterRiderDto } from '../dto/register-rider.dto';
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
    login(payload: LoginDto, metadata?: SessionRequestMetadata, appClient?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        userId: string;
        actorContext: import("../../users/entities/actor-context.entity").ActorContextEntity;
    }>;
    registerCustomer(payload: RegisterCustomerDto, metadata?: SessionRequestMetadata): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        userId: string;
        actorContext: import("../../users/entities/actor-context.entity").ActorContextEntity;
    }>;
    registerMerchant(payload: RegisterMerchantDto, metadata?: SessionRequestMetadata): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        userId: string;
        actorContext: import("../../users/entities/actor-context.entity").ActorContextEntity;
    }>;
    registerRider(payload: RegisterRiderDto, metadata?: SessionRequestMetadata): Promise<{
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
    private invalidCredentialsException;
    private assertPhoneIsAvailable;
    private invalidTokenException;
    private revokedSessionException;
    private expiredSessionException;
    private issueSession;
    private issueRegistrationSession;
    private rotateSession;
    private signToken;
    private normalizePhone;
    private normalizeRequiredString;
    private normalizeOptionalString;
    private normalizeStoreTypeCode;
    private extractExpiryDate;
    private verifyRefreshToken;
    private assertSessionIsActive;
    private resolveTargetSessionId;
}

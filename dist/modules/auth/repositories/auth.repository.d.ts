import { DevicePlatform, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
export declare const userSessionInclude: {
    user: {
        include: {
            customerProfile: {
                select: {
                    id: true;
                };
            };
            riderProfile: {
                select: {
                    id: true;
                };
            };
            merchantProfile: {
                select: {
                    id: true;
                };
            };
        };
    };
};
export type UserSessionRecord = Prisma.UserSessionGetPayload<{
    include: typeof userSessionInclude;
}>;
type CreateSessionParams = {
    id: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    deviceId?: string | null;
    userAgent?: string | null;
    ipAddress?: string | null;
};
type RegisterPushTokenParams = {
    userId: string;
    deviceId: string;
    platform: DevicePlatform;
    token: string;
};
export declare class AuthRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    touchLastLogin(userId: string): Prisma.Prisma__UserClient<{
        status: import(".prisma/client").$Enums.UserStatus;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        passwordHash: string;
        lastLoginAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    createSession(params: CreateSessionParams): Prisma.Prisma__UserSessionClient<{
        user: {
            customerProfile: {
                id: string;
            } | null;
            riderProfile: {
                id: string;
            } | null;
            merchantProfile: {
                id: string;
            } | null;
        } & {
            status: import(".prisma/client").$Enums.UserStatus;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            passwordHash: string;
            lastLoginAt: Date | null;
        };
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        deviceId: string | null;
        refreshTokenHash: string;
        expiresAt: Date;
        revokedAt: Date | null;
        lastUsedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findSessionById(sessionId: string): Promise<UserSessionRecord | null>;
    rotateSession(sessionId: string, refreshTokenHash: string, expiresAt: Date, metadata?: {
        deviceId?: string | null;
        userAgent?: string | null;
        ipAddress?: string | null;
    }): Prisma.Prisma__UserSessionClient<{
        user: {
            customerProfile: {
                id: string;
            } | null;
            riderProfile: {
                id: string;
            } | null;
            merchantProfile: {
                id: string;
            } | null;
        } & {
            status: import(".prisma/client").$Enums.UserStatus;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            passwordHash: string;
            lastLoginAt: Date | null;
        };
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        deviceId: string | null;
        refreshTokenHash: string;
        expiresAt: Date;
        revokedAt: Date | null;
        lastUsedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    revokeSession(sessionId: string): Prisma.PrismaPromise<Prisma.BatchPayload>;
    registerPushToken(params: RegisterPushTokenParams): Promise<{
        userId: string;
        id: string;
        token: string;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string;
        platform: import(".prisma/client").$Enums.DevicePlatform;
        lastSeenAt: Date;
    }>;
}
export {};

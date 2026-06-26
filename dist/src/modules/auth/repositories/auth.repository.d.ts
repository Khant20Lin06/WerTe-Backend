import { DevicePlatform, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { UserIdentityRecord } from '../../users/entities/actor-context.entity';
import { SessionCacheService } from '../services/session-cache.service';
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
                    status: true;
                };
            };
            merchantProfile: {
                select: {
                    id: true;
                    status: true;
                };
            };
            staffProfile: {
                select: {
                    id: true;
                    merchantId: true;
                    role: true;
                    status: true;
                    branchAssignments: {
                        select: {
                            branchId: true;
                        };
                    };
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
type CreateCustomerAccountParams = {
    phone: string;
    passwordHash: string;
    fullName?: string | null;
    avatarUrl?: string | null;
};
type CreateMerchantAccountParams = {
    phone: string;
    passwordHash: string;
    name: string;
    supportPhone?: string | null;
    storeType: string;
};
type CreateRiderAccountParams = {
    phone: string;
    passwordHash: string;
    displayName: string;
    vehicleType: string;
    currentTownship?: string | null;
};
export declare class AuthRepository {
    private readonly prisma;
    private readonly sessionCache;
    constructor(prisma: PrismaService, sessionCache: SessionCacheService);
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
    createCustomerAccount(params: CreateCustomerAccountParams): Promise<UserIdentityRecord>;
    createMerchantAccount(params: CreateMerchantAccountParams): Promise<UserIdentityRecord>;
    createRiderAccount(params: CreateRiderAccountParams): Promise<UserIdentityRecord>;
    createSession(params: CreateSessionParams): Prisma.Prisma__UserSessionClient<{
        user: {
            customerProfile: {
                id: string;
            } | null;
            riderProfile: {
                status: import(".prisma/client").$Enums.RiderStatus;
                id: string;
            } | null;
            merchantProfile: {
                status: import(".prisma/client").$Enums.MerchantStatus;
                id: string;
            } | null;
            staffProfile: {
                status: import(".prisma/client").$Enums.StaffStatus;
                role: import(".prisma/client").$Enums.MerchantStaffRole;
                id: string;
                merchantId: string;
                branchAssignments: {
                    branchId: string;
                }[];
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
        deviceId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
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
    }): Promise<{
        user: {
            customerProfile: {
                id: string;
            } | null;
            riderProfile: {
                status: import(".prisma/client").$Enums.RiderStatus;
                id: string;
            } | null;
            merchantProfile: {
                status: import(".prisma/client").$Enums.MerchantStatus;
                id: string;
            } | null;
            staffProfile: {
                status: import(".prisma/client").$Enums.StaffStatus;
                role: import(".prisma/client").$Enums.MerchantStaffRole;
                id: string;
                merchantId: string;
                branchAssignments: {
                    branchId: string;
                }[];
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
        deviceId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        refreshTokenHash: string;
        expiresAt: Date;
        revokedAt: Date | null;
        lastUsedAt: Date | null;
    }>;
    revokeSession(sessionId: string): Promise<Prisma.BatchPayload>;
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
    unregisterPushToken(userId: string, deviceId: string): Prisma.PrismaPromise<Prisma.BatchPayload>;
}
export {};

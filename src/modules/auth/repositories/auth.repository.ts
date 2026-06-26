import { Injectable } from '@nestjs/common';
import {
  DevicePlatform,
  MerchantStatus,
  Prisma,
  RiderStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  UserIdentityRecord,
  userIdentityInclude,
} from '../../users/entities/actor-context.entity';
import { SessionCacheService } from '../services/session-cache.service';

export const userSessionInclude = Prisma.validator<Prisma.UserSessionInclude>()({
  user: {
    include: userIdentityInclude,
  },
});

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

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionCache: SessionCacheService,
  ) {}

  touchLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  createCustomerAccount(
    params: CreateCustomerAccountParams,
  ): Promise<UserIdentityRecord> {
    return this.prisma.user.create({
      data: {
        phone: params.phone,
        passwordHash: params.passwordHash,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfile: {
          create: {
            fullName: params.fullName ?? null,
            avatarUrl: params.avatarUrl ?? null,
          },
        },
      },
      include: userIdentityInclude,
    });
  }

  createMerchantAccount(
    params: CreateMerchantAccountParams,
  ): Promise<UserIdentityRecord> {
    return this.prisma.user.create({
      data: {
        phone: params.phone,
        passwordHash: params.passwordHash,
        role: UserRole.MERCHANT,
        status: UserStatus.ACTIVE,
        merchantProfile: {
          create: {
            name: params.name,
            supportPhone: params.supportPhone ?? null,
            storeType: params.storeType,
            status: MerchantStatus.PENDING,
          },
        },
      },
      include: userIdentityInclude,
    });
  }

  createRiderAccount(
    params: CreateRiderAccountParams,
  ): Promise<UserIdentityRecord> {
    return this.prisma.user.create({
      data: {
        phone: params.phone,
        passwordHash: params.passwordHash,
        role: UserRole.RIDER,
        status: UserStatus.ACTIVE,
        riderProfile: {
          create: {
            displayName: params.displayName,
            vehicleType: params.vehicleType,
            currentTownship: params.currentTownship ?? null,
            status: RiderStatus.PENDING,
            availability: {
              create: {
                isOnline: false,
                isAvailable: false,
              },
            },
          },
        },
      },
      include: userIdentityInclude,
    });
  }

  createSession(params: CreateSessionParams) {
    return this.prisma.userSession.create({
      data: {
        id: params.id,
        userId: params.userId,
        refreshTokenHash: params.refreshTokenHash,
        expiresAt: params.expiresAt,
        deviceId: params.deviceId ?? null,
        userAgent: params.userAgent ?? null,
        ipAddress: params.ipAddress ?? null,
        lastUsedAt: new Date(),
      },
      include: userSessionInclude,
    });
  }

  findSessionById(sessionId: string): Promise<UserSessionRecord | null> {
    return this.prisma.userSession.findUnique({
      where: { id: sessionId },
      include: userSessionInclude,
    });
  }

  async rotateSession(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
    metadata?: {
      deviceId?: string | null;
      userAgent?: string | null;
      ipAddress?: string | null;
    },
  ) {
    const [session] = await Promise.all([
      this.prisma.userSession.update({
        where: { id: sessionId },
        data: {
          refreshTokenHash,
          expiresAt,
          lastUsedAt: new Date(),
          deviceId: metadata?.deviceId ?? undefined,
          userAgent: metadata?.userAgent ?? undefined,
          ipAddress: metadata?.ipAddress ?? undefined,
        },
        include: userSessionInclude,
      }),
      // Invalidate so the next access-token request re-populates with fresh data.
      this.sessionCache.invalidate(sessionId),
    ]);
    return session;
  }

  async revokeSession(sessionId: string) {
    const [result] = await Promise.all([
      this.prisma.userSession.updateMany({
        where: {
          id: sessionId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      }),
      this.sessionCache.invalidate(sessionId),
    ]);
    return result;
  }

  registerPushToken(params: RegisterPushTokenParams) {
    const lastSeenAt = new Date();

    return this.prisma.$transaction(async (tx) => {
      await tx.pushToken.deleteMany({
        where: {
          token: params.token,
          NOT: {
            userId: params.userId,
            deviceId: params.deviceId,
          },
        },
      });

      return tx.pushToken.upsert({
        where: {
          userId_deviceId: {
            userId: params.userId,
            deviceId: params.deviceId,
          },
        },
        create: {
          userId: params.userId,
          deviceId: params.deviceId,
          platform: params.platform,
          token: params.token,
          lastSeenAt,
        },
        update: {
          platform: params.platform,
          token: params.token,
          lastSeenAt,
        },
      });
    });
  }

  unregisterPushToken(userId: string, deviceId: string) {
    return this.prisma.pushToken.deleteMany({
      where: {
        userId,
        deviceId,
      },
    });
  }
}

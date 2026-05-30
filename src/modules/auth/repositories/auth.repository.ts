import { Injectable } from '@nestjs/common';
import { DevicePlatform, Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  userIdentityInclude,
} from '../../users/entities/actor-context.entity';

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

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  touchLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
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

  rotateSession(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
    metadata?: {
      deviceId?: string | null;
      userAgent?: string | null;
      ipAddress?: string | null;
    },
  ) {
    return this.prisma.userSession.update({
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
    });
  }

  revokeSession(sessionId: string) {
    return this.prisma.userSession.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
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

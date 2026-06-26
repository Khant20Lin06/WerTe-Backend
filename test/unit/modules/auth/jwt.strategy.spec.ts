import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '@prisma/client';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { AuthRepository } from '../../../../src/modules/auth/repositories/auth.repository';
import { SessionCacheService } from '../../../../src/modules/auth/services/session-cache.service';
import { JwtStrategy } from '../../../../src/modules/auth/strategies/jwt.strategy';
import { UsersService } from '../../../../src/modules/users/services/users.service';

describe('JwtStrategy', () => {
  const configService = {
    getOrThrow: jest.fn((key: string) => {
      switch (key) {
        case 'jwt.accessSecret':
          return 'access-secret';
        case 'jwt.issuer':
          return 'food-delivery-backend';
        case 'jwt.audience':
          return 'food-delivery-platform';
        default:
          throw new Error(`Unexpected config key: ${key}`);
      }
    }),
  } as unknown as ConfigService;

  // Cache always misses in these tests — DB path is exercised.
  const noOpCache = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    invalidate: jest.fn().mockResolvedValue(undefined),
    buildAuthenticatedUser: jest.fn(),
  } as unknown as SessionCacheService;

  const userRecord = {
    id: 'usr_1',
    phone: '09123456789',
    passwordHash: 'hash',
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    customerProfile: { id: 'cust_prof_1' },
    riderProfile: null,
    merchantProfile: null,
    staffProfile: null,
  };

  it('returns authenticated actor context for a valid access token', async () => {
    const authRepository = {
      findSessionById: jest.fn().mockResolvedValue({
        id: 'session_1',
        userId: 'usr_1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        user: userRecord,
      }),
    } as unknown as AuthRepository;
    const usersService = {
      isSuspended: jest.fn().mockReturnValue(false),
      isPending: jest.fn().mockReturnValue(false),
      buildActorContext: jest.fn().mockReturnValue({
        userId: 'usr_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfileId: 'cust_prof_1',
      }),
    } as unknown as UsersService;
    const strategy = new JwtStrategy(configService, authRepository, usersService, noOpCache);

    await expect(
      strategy.validate({
        sub: 'usr_1',
        role: UserRole.CUSTOMER,
        sessionId: 'session_1',
        type: 'access',
        exp: Math.floor(Date.now() / 1_000) + 900,
      }),
    ).resolves.toEqual({
      userId: 'usr_1',
      sessionId: 'session_1',
      role: UserRole.CUSTOMER,
      tokenType: 'access',
      actorContext: {
        userId: 'usr_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfileId: 'cust_prof_1',
      },
    });
  });

  it('rejects non-access tokens for guarded routes', async () => {
    const strategy = new JwtStrategy(
      configService,
      {} as AuthRepository,
      {} as UsersService,
      noOpCache,
    );

    await expect(
      strategy.validate({
        sub: 'usr_1',
        role: UserRole.CUSTOMER,
        sessionId: 'session_1',
        type: 'refresh',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('rejects revoked sessions', async () => {
    const authRepository = {
      findSessionById: jest.fn().mockResolvedValue({
        id: 'session_1',
        userId: 'usr_1',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
        user: userRecord,
      }),
    } as unknown as AuthRepository;
    const strategy = new JwtStrategy(
      configService,
      authRepository,
      {} as UsersService,
      noOpCache,
    );

    await expect(
      strategy.validate({
        sub: 'usr_1',
        role: UserRole.CUSTOMER,
        sessionId: 'session_1',
        type: 'access',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('returns from cache without hitting the database', async () => {
    const cachedSession = {
      userId: 'usr_1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      user: userRecord,
    };
    const cacheHit = {
      get: jest.fn().mockResolvedValue(cachedSession),
      set: jest.fn(),
      invalidate: jest.fn(),
      buildAuthenticatedUser: jest.fn().mockReturnValue({
        userId: 'usr_1',
        sessionId: 'session_1',
        role: UserRole.CUSTOMER,
        tokenType: 'access' as const,
        actorContext: {},
      }),
    } as unknown as SessionCacheService;

    const dbRepository = {
      findSessionById: jest.fn(),
    } as unknown as AuthRepository;

    const usersService = {
      isSuspended: jest.fn().mockReturnValue(false),
      isPending: jest.fn().mockReturnValue(false),
    } as unknown as UsersService;

    const strategy = new JwtStrategy(configService, dbRepository, usersService, cacheHit);

    await strategy.validate({
      sub: 'usr_1',
      role: UserRole.CUSTOMER,
      sessionId: 'session_1',
      type: 'access',
    });

    expect(dbRepository.findSessionById).not.toHaveBeenCalled();
    expect(cacheHit.get).toHaveBeenCalledWith('session_1');
  });
});
